const { app, BrowserWindow, WebContentsView, BrowserView, session, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

/* -------------------------------------------------------------------------- */
/* 1. Privacy & Anti-Telemetry Hardening (Zero Host Telemetry)                */
/* -------------------------------------------------------------------------- */

app.commandLine.appendSwitch('disable-telemetry');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('no-pings');

/* -------------------------------------------------------------------------- */
/* 2. Persistent Storage (Rules, History, Bookmarks, Settings)                */
/* -------------------------------------------------------------------------- */

const getStorageDir = () => app.isPackaged ? app.getPath('userData') : __dirname;

const RULES_PATH = path.join(getStorageDir(), 'rules.json');
const HISTORY_PATH = path.join(getStorageDir(), 'history.json');
const BOOKMARKS_PATH = path.join(getStorageDir(), 'bookmarks.json');
const SETTINGS_PATH = path.join(getStorageDir(), 'settings.json');

let rulesData = { domains: {} };
let historyData = [];
let bookmarksData = [];
let settingsData = { downloadDir: '', historyLogging: true };
const downloadsList = [];
const activeDownloadItems = new Map();

// Layout bounds offsets to prevent native WebContentsView occlusion
let currentBoundsOffset = { top: 80, right: 0 };

function loadStorage() {
  try {
    if (fs.existsSync(RULES_PATH)) rulesData = JSON.parse(fs.readFileSync(RULES_PATH, 'utf8'));
  } catch (e) { rulesData = { domains: {} }; }

  try {
    if (fs.existsSync(HISTORY_PATH)) historyData = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8'));
  } catch (e) { historyData = []; }

  try {
    if (fs.existsSync(BOOKMARKS_PATH)) bookmarksData = JSON.parse(fs.readFileSync(BOOKMARKS_PATH, 'utf8'));
  } catch (e) { bookmarksData = []; }

  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      settingsData = Object.assign({ downloadDir: '', historyLogging: true }, JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8')));
    }
  } catch (e) { settingsData = { downloadDir: '', historyLogging: true }; }
}

function saveRules() {
  try { fs.writeFileSync(RULES_PATH, JSON.stringify(rulesData, null, 2), 'utf8'); } catch (e) {}
}

function saveHistory() {
  try { fs.writeFileSync(HISTORY_PATH, JSON.stringify(historyData.slice(0, 1000), null, 2), 'utf8'); } catch (e) {}
}

function saveBookmarks() {
  try { fs.writeFileSync(BOOKMARKS_PATH, JSON.stringify(bookmarksData, null, 2), 'utf8'); } catch (e) {}
}

function saveSettings() {
  try { fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settingsData, null, 2), 'utf8'); } catch (e) {}
}

function recordHistory(url, title) {
  // If user disabled history logging in Settings, skip immediately
  if (!settingsData.historyLogging) return;

  if (!url || url.startsWith('about:') || url.startsWith('chrome-extension:') || url.startsWith('devtools:')) return;
  if (historyData.length > 0 && historyData[0].url === url) {
    historyData[0].title = title || historyData[0].title;
    historyData[0].visitedAt = new Date().toISOString();
  } else {
    historyData.unshift({
      id: 'hist_' + Date.now(),
      url: url,
      title: title || url,
      visitedAt: new Date().toISOString()
    });
  }
  saveHistory();
}

loadStorage();

/* -------------------------------------------------------------------------- */
/* 3. Browser Window & Tab Lifecycle                                          */
/* -------------------------------------------------------------------------- */

let mainWindow = null;
const tabs = new Map();
let activeTabId = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#070a11',
    title: 'BRWSR // Surgical Browser',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'ui', 'index.html'));

  mainWindow.on('resize', () => {
    updateActiveViewBounds();
  });

  mainWindow.on('enter-full-screen', () => {
    if (mainWindow) {
      mainWindow.webContents.send('page:fullscreen-changed', { isFullscreen: true });
    }
    updateActiveViewBounds();
  });

  mainWindow.on('leave-full-screen', () => {
    if (mainWindow) {
      mainWindow.webContents.send('page:fullscreen-changed', { isFullscreen: false });
    }
    updateActiveViewBounds();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function updateActiveViewBounds() {
  if (!mainWindow || !activeTabId) return;
  const tab = tabs.get(activeTabId);
  if (!tab || !tab.view) return;

  const [width, height] = mainWindow.getContentSize();

  // If active tab is in true fullscreen, make view occupy the entire window with 0 offset
  if (tab.isFullscreen || (mainWindow.isFullScreen && mainWindow.isFullScreen())) {
    if (tab.view.setBounds) {
      tab.view.setBounds({ x: 0, y: 0, width: width, height: height });
    }
    return;
  }

  const topOffset = currentBoundsOffset.top || 80;
  const rightOffset = currentBoundsOffset.right || 0;

  const bounds = {
    x: 0,
    y: topOffset,
    width: Math.max(200, width - rightOffset),
    height: Math.max(200, height - topOffset)
  };

  if (tab.view.setBounds) {
    tab.view.setBounds(bounds);
  }
}

function normalizeUrl(input) {
  if (!input) return 'https://duckduckgo.com';
  let url = input.trim();
  if (/^https?:\/\//i.test(url)) return url;
  if (/^localhost(:\d+)?/i.test(url) || /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) {
    return `http://${url}`;
  }
  if (/^[\w-]+(\.[\w-]+)+([\/\w-.~:?#[\]@!$&'()*+,;=]*)?$/i.test(url)) {
    return `https://${url}`;
  }
  return `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
}

function createTab(initialUrl = 'https://duckduckgo.com') {
  const tabId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const ViewConstructor = WebContentsView || BrowserView;

  const view = new ViewConstructor({
    webPreferences: {
      preload: path.join(__dirname, 'page-preload.js'),
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: false
    }
  });

  const tabData = {
    id: tabId,
    view: view,
    cdpAttached: false,
    isFrozen: false,
    isGooglebot: false,
    isZapper: false,
    isDarkMode: false,
    isFullscreen: false,
    mediaStreams: [],
    url: initialUrl,
    title: 'New Tab',
    favicon: '',
    canGoBack: false,
    canGoForward: false
  };

  tabs.set(tabId, tabData);
  const wc = view.webContents;

  // True Fullscreen HTML5 Video Event Interceptors
  wc.on('enter-html-full-screen', () => {
    tabData.isFullscreen = true;
    if (mainWindow) {
      mainWindow.setFullScreen(true);
      const [width, height] = mainWindow.getContentSize();
      if (tabData.view && tabData.view.setBounds) {
        tabData.view.setBounds({ x: 0, y: 0, width: width, height: height });
      }
      mainWindow.webContents.send('page:fullscreen-changed', { tabId: tabData.id, isFullscreen: true });
    }
  });

  wc.on('leave-html-full-screen', () => {
    tabData.isFullscreen = false;
    if (mainWindow) {
      mainWindow.setFullScreen(false);
      updateActiveViewBounds();
      mainWindow.webContents.send('page:fullscreen-changed', { tabId: tabData.id, isFullscreen: false });
    }
  });

  wc.on('did-start-navigation', (e, url, isInPlace, isMainFrame) => {
    if (isMainFrame) {
      tabData.url = url;
      tabData.loading = true;
      tabData.mediaStreams = [];
      notifyTabUpdated(tabData);
    }
  });

  wc.on('did-navigate', (e, url) => {
    tabData.url = url;
    tabData.canGoBack = wc.canGoBack();
    tabData.canGoForward = wc.canGoForward();
    recordHistory(url, tabData.title);
    notifyTabUpdated(tabData);
  });

  wc.on('did-finish-load', () => {
    tabData.loading = false;
    tabData.canGoBack = wc.canGoBack();
    tabData.canGoForward = wc.canGoForward();
    recordHistory(tabData.url, tabData.title);
    notifyTabUpdated(tabData);
  });

  wc.on('page-title-updated', (e, title) => {
    tabData.title = title;
    recordHistory(tabData.url, title);
    notifyTabUpdated(tabData);
  });

  wc.on('page-favicon-updated', (e, favicons) => {
    if (favicons && favicons.length > 0) {
      tabData.favicon = favicons[0];
      notifyTabUpdated(tabData);
    }
  });

  wc.on('found-in-page', (e, result) => {
    if (mainWindow && activeTabId === tabId) {
      mainWindow.webContents.send('page:found-in-page', {
        activeMatchOrdinal: result.activeMatchOrdinal,
        matches: result.matches,
        finalUpdate: result.finalUpdate
      });
    }
  });

  attachCDP(tabData);
  switchTab(tabId);

  wc.loadURL(normalizeUrl(initialUrl)).catch(err => {
    console.error(`Failed to load ${initialUrl}:`, err);
  });

  if (mainWindow) {
    mainWindow.webContents.send('tab:created', {
      id: tabData.id,
      url: tabData.url,
      title: tabData.title,
      favicon: tabData.favicon
    });
  }

  return tabData;
}

function switchTab(tabId) {
  if (!tabs.has(tabId) || !mainWindow) return;

  if (activeTabId && tabs.has(activeTabId)) {
    const prevTab = tabs.get(activeTabId);
    if (WebContentsView && mainWindow.contentView && mainWindow.contentView.removeChildView) {
      try { mainWindow.contentView.removeChildView(prevTab.view); } catch (e) {}
    } else if (mainWindow.removeBrowserView) {
      try { mainWindow.removeBrowserView(prevTab.view); } catch (e) {}
    }
  }

  activeTabId = tabId;
  const currentTab = tabs.get(tabId);

  if (WebContentsView && mainWindow.contentView && mainWindow.contentView.addChildView) {
    mainWindow.contentView.addChildView(currentTab.view);
  } else if (mainWindow.setBrowserView) {
    mainWindow.setBrowserView(currentTab.view);
  }

  updateActiveViewBounds();

  mainWindow.webContents.send('tab:switched', tabId);
  notifyTabUpdated(currentTab);
}

function closeTab(tabId) {
  if (!tabs.has(tabId)) return;
  const tab = tabs.get(tabId);

  if (WebContentsView && mainWindow && mainWindow.contentView && mainWindow.contentView.removeChildView) {
    try { mainWindow.contentView.removeChildView(tab.view); } catch (e) {}
  } else if (mainWindow && mainWindow.removeBrowserView) {
    try { mainWindow.removeBrowserView(tab.view); } catch (e) {}
  }

  try { tab.view.webContents.close(); } catch (e) {}
  tabs.delete(tabId);

  if (mainWindow) {
    mainWindow.webContents.send('tab:closed', tabId);
  }

  if (activeTabId === tabId) {
    const remainingKeys = Array.from(tabs.keys());
    if (remainingKeys.length > 0) {
      switchTab(remainingKeys[remainingKeys.length - 1]);
    } else {
      createTab('https://duckduckgo.com');
    }
  }
}

function notifyTabUpdated(tabData) {
  if (!mainWindow) return;
  mainWindow.webContents.send('tab:updated', {
    id: tabData.id,
    url: tabData.url,
    title: tabData.title,
    favicon: tabData.favicon,
    loading: tabData.loading,
    canGoBack: tabData.canGoBack,
    canGoForward: tabData.canGoForward,
    isZapper: tabData.isZapper,
    isFrozen: tabData.isFrozen,
    isBot: tabData.isGooglebot,
    isDarkMode: tabData.isDarkMode,
    isFullscreen: tabData.isFullscreen,
    mediaCount: (tabData.mediaStreams || []).length,
    mediaStreams: tabData.mediaStreams || []
  });
}

/* -------------------------------------------------------------------------- */
/* 4. Chrome DevTools Protocol (CDP) Controller                               */
/* -------------------------------------------------------------------------- */

async function attachCDP(tabData) {
  const wc = tabData.view.webContents;
  try {
    if (!wc.debugger.isAttached()) {
      wc.debugger.attach('1.3');
      tabData.cdpAttached = true;
      await wc.debugger.sendCommand('Debugger.enable');
      await wc.debugger.sendCommand('Runtime.enable');
      await wc.debugger.sendCommand('Page.enable');
    }
  } catch (err) {
    console.error('CDP Attach Error:', err);
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Network Filter, Media Sniffer & Seamless Download Engine                 */
/* -------------------------------------------------------------------------- */

function setupNetworkInterceptors() {
  const customSession = session.defaultSession;

  customSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['content-security-policy-report-only'];
    delete responseHeaders['x-frame-options'];
    callback({ responseHeaders });
  });

  customSession.webRequest.onResponseStarted((details) => {
    const url = details.url || '';
    const isMedia = /\.(m3u8|mpd|mp4|webm|mp3|m4a|aac)(\?.*)?$/i.test(url) ||
      (details.responseHeaders && details.responseHeaders['content-type'] &&
       details.responseHeaders['content-type'].some(t => t.includes('video/') || t.includes('mpegurl') || t.includes('audio/')));

    if (isMedia && !url.includes('.js') && !url.includes('.css')) {
      if (activeTabId && tabs.has(activeTabId)) {
        const tab = tabs.get(activeTabId);
        if (!tab.mediaStreams.includes(url)) {
          tab.mediaStreams.push(url);
          if (mainWindow) {
            mainWindow.webContents.send('media:captured', { tabId: activeTabId, url, count: tab.mediaStreams.length });
          }
          notifyTabUpdated(tab);
        }
      }
    }
  });

  // Seamless Auto-Downloading to Custom or Default Directory
  customSession.on('will-download', (event, item, webContents) => {
    const downloadsDir = (settingsData.downloadDir && fs.existsSync(settingsData.downloadDir))
      ? settingsData.downloadDir
      : app.getPath('downloads');

    const originalFilename = item.getFilename() || 'download';
    let targetPath = path.join(downloadsDir, originalFilename);

    let counter = 1;
    const ext = path.extname(originalFilename);
    const base = path.basename(originalFilename, ext);
    while (fs.existsSync(targetPath)) {
      targetPath = path.join(downloadsDir, `${base} (${counter})${ext}`);
      counter++;
    }

    item.setSavePath(targetPath);

    const downloadId = 'dl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const downloadEntry = {
      id: downloadId,
      filename: path.basename(targetPath),
      savePath: targetPath,
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      state: 'progressing',
      speed: '0 KB/s',
      percent: 0,
      startTime: Date.now()
    };

    downloadsList.unshift(downloadEntry);
    activeDownloadItems.set(downloadId, item);

    let lastBytes = 0;
    let lastTime = Date.now();

    item.on('updated', (e, state) => {
      if (state === 'progressing') {
        const received = item.getReceivedBytes();
        const total = item.getTotalBytes();
        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000;

        if (timeDiff >= 0.5) {
          const bytesDiff = received - lastBytes;
          const speedBps = bytesDiff / timeDiff;
          downloadEntry.speed = speedBps > 1024 * 1024
            ? (speedBps / (1024 * 1024)).toFixed(1) + ' MB/s'
            : (speedBps / 1024).toFixed(0) + ' KB/s';
          lastBytes = received;
          lastTime = now;
        }

        downloadEntry.receivedBytes = received;
        downloadEntry.totalBytes = total;
        downloadEntry.percent = total > 0 ? Math.round((received / total) * 100) : 0;

        if (mainWindow) {
          mainWindow.webContents.send('downloads:progress', downloadEntry);
        }
      }
    });

    item.once('done', (e, state) => {
      activeDownloadItems.delete(downloadId);
      downloadEntry.state = state;
      downloadEntry.speed = '0 KB/s';
      downloadEntry.percent = state === 'completed' ? 100 : downloadEntry.percent;

      if (mainWindow) {
        mainWindow.webContents.send('downloads:completed', downloadEntry);
      }
    });
  });
}

/* -------------------------------------------------------------------------- */
/* 6. IPC Handlers                                                            */
/* -------------------------------------------------------------------------- */

// Layout offset handler to prevent native WebContentsView occlusion
ipcMain.handle('view:set-bounds-offset', (e, offset) => {
  currentBoundsOffset = Object.assign(currentBoundsOffset, offset);
  updateActiveViewBounds();
  return true;
});

// Fullscreen toggle
ipcMain.handle('window:toggle-fullscreen', () => {
  if (mainWindow) {
    const nextState = !mainWindow.isFullScreen();
    mainWindow.setFullScreen(nextState);
    return nextState;
  }
  return false;
});

// Settings & Custom Download Directory & History Logging Toggle
ipcMain.handle('settings:get', () => {
  return {
    downloadDir: settingsData.downloadDir || app.getPath('downloads'),
    isCustomDir: !!settingsData.downloadDir,
    historyLogging: settingsData.historyLogging !== false
  };
});

ipcMain.handle('settings:set-history-logging', (e, enabled) => {
  settingsData.historyLogging = !!enabled;
  saveSettings();
  return settingsData.historyLogging;
});

ipcMain.handle('settings:get-download-dir', () => {
  const currentPath = (settingsData.downloadDir && fs.existsSync(settingsData.downloadDir))
    ? settingsData.downloadDir
    : app.getPath('downloads');
  return { path: currentPath, isCustom: !!settingsData.downloadDir };
});

ipcMain.handle('settings:choose-download-dir', async () => {
  if (!mainWindow) return { path: app.getPath('downloads'), isCustom: false };
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Custom Download Folder',
    properties: ['openDirectory', 'createDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    settingsData.downloadDir = result.filePaths[0];
    saveSettings();
    return { path: settingsData.downloadDir, isCustom: true };
  }
  return {
    path: (settingsData.downloadDir && fs.existsSync(settingsData.downloadDir)) ? settingsData.downloadDir : app.getPath('downloads'),
    isCustom: !!settingsData.downloadDir
  };
});

ipcMain.handle('settings:reset-download-dir', () => {
  settingsData.downloadDir = '';
  saveSettings();
  return { path: app.getPath('downloads'), isCustom: false };
});

// Tab Management
ipcMain.handle('tab:create', (e, url) => createTab(url || 'https://duckduckgo.com').id);
ipcMain.handle('tab:close', (e, tabId) => closeTab(tabId));
ipcMain.handle('tab:switch', (e, tabId) => switchTab(tabId));
ipcMain.handle('tab:navigate', (e, { tabId, url }) => {
  const tab = tabs.get(tabId);
  if (tab) tab.view.webContents.loadURL(normalizeUrl(url));
});
ipcMain.handle('tab:reload', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab) tab.view.webContents.reload();
});
ipcMain.handle('tab:go-back', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab && tab.view.webContents.canGoBack()) tab.view.webContents.goBack();
});
ipcMain.handle('tab:go-forward', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab && tab.view.webContents.canGoForward()) tab.view.webContents.goForward();
});

// Surgical Tools
ipcMain.handle('action:toggle-zapper', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (!tab) return { active: false };
  tab.isZapper = !tab.isZapper;
  tab.view.webContents.send('action:trigger-zapper', tab.isZapper);
  notifyTabUpdated(tab);
  return { active: tab.isZapper };
});

ipcMain.on('action:zapper-state', (e, state) => {
  const senderWc = e.sender;
  for (const [id, tab] of tabs.entries()) {
    if (tab.view.webContents === senderWc) {
      tab.isZapper = state;
      notifyTabUpdated(tab);
      break;
    }
  }
});

ipcMain.handle('action:unlock-scroll', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab) tab.view.webContents.send('action:trigger-unlock-scroll');
  return { success: true };
});

ipcMain.handle('action:toggle-dark-mode', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (!tab) return { isDark: false };
  tab.isDarkMode = !tab.isDarkMode;
  tab.view.webContents.send('action:trigger-dark-mode', tab.isDarkMode);
  notifyTabUpdated(tab);
  return { isDark: tab.isDarkMode };
});

ipcMain.handle('action:toggle-media-scanner', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab) {
    tab.view.webContents.send('action:trigger-media-scanner');
  }
  return { success: true };
});

ipcMain.handle('action:freeze-js', async (e, tabId) => {
  const tab = tabs.get(tabId);
  if (!tab) return { frozen: false };
  const wc = tab.view.webContents;
  try {
    if (!wc.debugger.isAttached()) await attachCDP(tab);
    if (tab.isFrozen) {
      await wc.debugger.sendCommand('Debugger.resume');
      tab.isFrozen = false;
    } else {
      await wc.debugger.sendCommand('Debugger.pause');
      tab.isFrozen = true;
    }
  } catch (err) { console.error('Freeze JS Error:', err); }
  notifyTabUpdated(tab);
  return { frozen: tab.isFrozen };
});

ipcMain.handle('action:toggle-googlebot', async (e, tabId) => {
  const tab = tabs.get(tabId);
  if (!tab) return { isBot: false };
  tab.isGooglebot = !tab.isGooglebot;
  const wc = tab.view.webContents;
  try {
    if (tab.isGooglebot) {
      const googlebotUA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
      wc.setUserAgent(googlebotUA);
      if (tab.cdpAttached) {
        await wc.debugger.sendCommand('Network.setUserAgentOverride', { userAgent: googlebotUA });
      }
    } else {
      wc.setUserAgent('');
      if (tab.cdpAttached) {
        await wc.debugger.sendCommand('Network.setUserAgentOverride', { userAgent: '' });
      }
    }
    wc.reload();
  } catch (err) { console.error('Googlebot Spoof Error:', err); }
  notifyTabUpdated(tab);
  return { isBot: tab.isGooglebot };
});

ipcMain.handle('action:toggle-devtools', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (tab) {
    const wc = tab.view.webContents;
    if (wc.isDevToolsOpened()) wc.closeDevTools();
    else wc.openDevTools({ mode: 'right' });
  }
});

// Find In Page
ipcMain.handle('page:find', (e, { tabId, text, options }) => {
  const tab = tabs.get(tabId);
  if (tab && text) {
    return tab.view.webContents.findInPage(text, options || { forward: true, findNext: false });
  }
  return null;
});

ipcMain.handle('page:stop-find', (e, { tabId, action }) => {
  const tab = tabs.get(tabId);
  if (tab) tab.view.webContents.stopFindInPage(action || 'clearSelection');
});

// Downloads Engine Handlers
ipcMain.handle('downloads:get', () => downloadsList);
ipcMain.handle('downloads:download-url', (e, url) => {
  if (mainWindow && url) {
    mainWindow.webContents.downloadURL(url);
    return true;
  }
  return false;
});
ipcMain.handle('downloads:open-file', (e, filePath) => {
  if (filePath && fs.existsSync(filePath)) shell.openPath(filePath);
});
ipcMain.handle('downloads:show-in-folder', (e, filePath) => {
  if (filePath && fs.existsSync(filePath)) shell.showItemInFolder(filePath);
});
ipcMain.handle('downloads:cancel', (e, id) => {
  const item = activeDownloadItems.get(id);
  if (item) {
    item.cancel();
    return true;
  }
  return false;
});
ipcMain.handle('downloads:clear', () => {
  const remaining = downloadsList.filter(d => d.state === 'progressing');
  downloadsList.length = 0;
  downloadsList.push(...remaining);
  return true;
});

// Media Sniffer
ipcMain.handle('media:get-streams', (e, tabId) => {
  const tab = tabs.get(tabId);
  return tab ? (tab.mediaStreams || []) : [];
});

// History & Bookmarks
ipcMain.handle('history:get', (e, query) => {
  if (!query) return historyData;
  const q = query.toLowerCase();
  return historyData.filter(h => h.title.toLowerCase().includes(q) || h.url.toLowerCase().includes(q));
});

ipcMain.handle('history:clear', () => {
  historyData = [];
  saveHistory();
  return true;
});

ipcMain.handle('history:delete-item', (e, url) => {
  historyData = historyData.filter(h => h.url !== url);
  saveHistory();
  return true;
});

ipcMain.handle('bookmarks:get', () => bookmarksData);

ipcMain.handle('bookmarks:toggle', (e, tabId) => {
  const tab = tabs.get(tabId);
  if (!tab || !tab.url || tab.url.startsWith('about:')) return false;

  const index = bookmarksData.findIndex(b => b.url === tab.url);
  if (index >= 0) {
    bookmarksData.splice(index, 1);
    saveBookmarks();
    return false;
  } else {
    bookmarksData.unshift({
      id: 'bm_' + Date.now(),
      url: tab.url,
      title: tab.title || tab.url,
      favicon: tab.favicon || '',
      createdAt: new Date().toISOString()
    });
    saveBookmarks();
    return true;
  }
});

ipcMain.handle('bookmarks:is-bookmarked', (e, url) => bookmarksData.some(b => b.url === url));

// Rules Management Handlers
ipcMain.handle('rules:get-for-page', (e, hostname) => rulesData.domains[hostname] || []);
ipcMain.handle('rules:get', (e, domain) => rulesData.domains[domain] || []);
ipcMain.handle('rules:get-all', () => rulesData.domains);

ipcMain.handle('rules:save-zapped', (e, { hostname, selector, tag }) => {
  if (!hostname || !selector) return [];
  if (!rulesData.domains[hostname]) rulesData.domains[hostname] = [];

  const existing = rulesData.domains[hostname].find(r => r.selector === selector);
  if (!existing) {
    rulesData.domains[hostname].push({
      id: 'rule_' + Date.now(),
      selector: selector,
      tag: tag || 'div',
      created: new Date().toISOString()
    });
    saveRules();
  }
  return rulesData.domains[hostname];
});

ipcMain.handle('rules:add', (e, { domain, rule }) => {
  if (!domain || !rule || !rule.selector) return false;
  if (!rulesData.domains[domain]) rulesData.domains[domain] = [];

  rulesData.domains[domain].push({
    id: rule.id || ('rule_' + Date.now()),
    selector: rule.selector,
    tag: rule.tag || 'custom',
    created: new Date().toISOString()
  });
  saveRules();

  for (const tab of tabs.values()) {
    if (tab.url && tab.url.includes(domain)) {
      tab.view.webContents.send('action:rules-updated', rulesData.domains[domain]);
    }
  }
  return true;
});

ipcMain.handle('rules:delete', (e, { domain, ruleId }) => {
  if (!domain || !rulesData.domains[domain]) return false;
  rulesData.domains[domain] = rulesData.domains[domain].filter(r => r.id !== ruleId && r.selector !== ruleId);
  saveRules();

  for (const tab of tabs.values()) {
    if (tab.url && tab.url.includes(domain)) {
      tab.view.webContents.send('action:rules-updated', rulesData.domains[domain]);
    }
  }
  return true;
});

/* -------------------------------------------------------------------------- */
/* App Entry                                                                  */
/* -------------------------------------------------------------------------- */

app.whenReady().then(() => {
  setupNetworkInterceptors();
  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
