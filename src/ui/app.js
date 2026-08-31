// --------------------------------------------------------------------------
// BRWSR Frontend UI Controller
// --------------------------------------------------------------------------

(() => {
  const api = window.browserAPI;
  if (!api) {
    console.error('browserAPI not available.');
    return;
  }

  // Local UI State
  let tabs = [];
  let activeTabId = null;
  let activeDomain = '';
  let activeDomainRules = [];
  let downloads = [];
  let isDeckOpen = false;
  let isFullscreen = false;
  let historyLoggingEnabled = true;
  let latestReleaseUrl = 'https://github.com/katungatigift391-svg/BRWSR/releases';

  // DOM Elements
  const chromeHeader = document.getElementById('chrome-header');
  const tabsContainer = document.getElementById('tabs-container');
  const btnNewTab = document.getElementById('btn-new-tab');
  const btnBack = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  const btnReload = document.getElementById('btn-reload');
  const urlInput = document.getElementById('url-input');
  const btnClearUrl = document.getElementById('btn-clear-url');
  const btnBookmark = document.getElementById('btn-bookmark');

  // Dynamic Media Download Button
  const btnDynamicMedia = document.getElementById('btn-dynamic-media');
  const dynamicMediaLabel = document.getElementById('dynamic-media-label');

  // Toolbar Download Pill
  const btnToolbarDownloads = document.getElementById('btn-toolbar-downloads');
  const dlToolbarSpeed = document.getElementById('dl-toolbar-speed');
  const dlToolbarBar = document.getElementById('dl-toolbar-bar');

  // Surgical Deck Elements
  const btnSurgicalMenu = document.getElementById('btn-surgical-menu');
  const surgicalDeckPanel = document.getElementById('surgical-deck-panel');
  const deckArrow = document.getElementById('deck-arrow');
  const dotZapper = document.getElementById('dot-zapper');
  const dotFrozen = document.getElementById('dot-frozen');
  const dotBot = document.getElementById('dot-bot');

  const menuItemZapper = document.getElementById('menu-item-zapper');
  const menuItemUnlock = document.getElementById('menu-item-unlock');
  const menuItemFreeze = document.getElementById('menu-item-freeze');
  const menuItemBot = document.getElementById('menu-item-bot');
  const menuItemDark = document.getElementById('menu-item-dark');
  const menuItemDownloads = document.getElementById('menu-item-downloads');
  const menuItemMedia = document.getElementById('menu-item-media');
  const menuItemRules = document.getElementById('menu-item-rules');
  const menuItemHistory = document.getElementById('menu-item-history');
  const menuItemSettings = document.getElementById('menu-item-settings');
  const menuItemDevTools = document.getElementById('menu-item-devtools');

  const mediaStreamBadge = document.getElementById('media-stream-badge');
  const menuRuleBadge = document.getElementById('menu-rule-badge');

  // Toast
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toast-icon');
  const toastMsg = document.getElementById('toast-message');
  let toastTimer = null;

  // Settings Drawer Elements
  const settingsDrawer = document.getElementById('settings-drawer');
  const btnCloseSettingsDrawer = document.getElementById('btn-close-settings-drawer');
  const toggleHistoryLogging = document.getElementById('toggle-history-logging');
  const settingsDownloadDir = document.getElementById('settings-download-dir');
  const btnSettingsChangeDir = document.getElementById('btn-settings-change-dir');
  const btnSettingsResetDir = document.getElementById('btn-settings-reset-dir');

  // Software Update UI Elements
  const appCurrentVersion = document.getElementById('app-current-version');
  const updateStatusBadge = document.getElementById('update-status-badge');
  const updateDetailsBox = document.getElementById('update-details-box');
  const updateLatestVersionText = document.getElementById('update-latest-version-text');
  const btnDownloadUpdate = document.getElementById('btn-download-update');
  const btnCheckUpdates = document.getElementById('btn-check-updates');

  // Downloads Drawer
  const downloadsDrawer = document.getElementById('downloads-drawer');
  const btnCloseDownloadsDrawer = document.getElementById('btn-close-downloads-drawer');
  const downloadsList = document.getElementById('downloads-list');
  const drawerDownloadsCount = document.getElementById('drawer-downloads-count');
  const btnClearCompletedDownloads = document.getElementById('btn-clear-completed-downloads');
  const currentDownloadDir = document.getElementById('current-download-dir');
  const btnChangeDownloadDir = document.getElementById('btn-change-download-dir');
  const btnResetDownloadDir = document.getElementById('btn-reset-download-dir');

  // Rules Drawer
  const rulesDrawer = document.getElementById('rules-drawer');
  const btnCloseRulesDrawer = document.getElementById('btn-close-rules-drawer');
  const drawerDomain = document.getElementById('drawer-domain');
  const drawerRuleCount = document.getElementById('drawer-rule-count');
  const rulesList = document.getElementById('rules-list');
  const customSelectorInput = document.getElementById('custom-selector-input');
  const btnAddCustomRule = document.getElementById('btn-add-custom-rule');
  const btnPurgeDomainRules = document.getElementById('btn-purge-domain-rules');

  // History Drawer
  const historyDrawer = document.getElementById('history-drawer');
  const btnCloseHistoryDrawer = document.getElementById('btn-close-history-drawer');
  const historySearchInput = document.getElementById('history-search-input');
  const historyList = document.getElementById('history-list');
  const btnPurgeAllHistory = document.getElementById('btn-purge-all-history');
  const historyStatusTag = document.getElementById('history-status-tag');

  // Media Drawer
  const mediaDrawer = document.getElementById('media-drawer');
  const btnCloseMediaDrawer = document.getElementById('btn-close-media-drawer');
  const mediaList = document.getElementById('media-list');

  // Find In Page
  const findBar = document.getElementById('find-in-page-bar');
  const findInput = document.getElementById('find-input');
  const findMatches = document.getElementById('find-matches');
  const btnFindPrev = document.getElementById('btn-find-prev');
  const btnFindNext = document.getElementById('btn-find-next');
  const btnFindClose = document.getElementById('btn-find-close');

  /* -------------------------------------------------------------------------- */
  /* Helpers & Utilities                                                        */
  /* -------------------------------------------------------------------------- */

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function showToast(icon, message, duration = 2400) {
    if (toastTimer) clearTimeout(toastTimer);
    toastIcon.textContent = icon;
    toastMsg.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function updateViewOffsets(isDrawerOpen = false) {
    const topOffset = isDeckOpen ? 124 : 80;
    const rightOffset = isDrawerOpen ? 420 : 0;
    api.setViewBoundsOffset({ top: topOffset, right: rightOffset });
  }

  function closeAllDrawers() {
    settingsDrawer.classList.remove('open');
    rulesDrawer.classList.remove('open');
    historyDrawer.classList.remove('open');
    mediaDrawer.classList.remove('open');
    downloadsDrawer.classList.remove('open');
    updateViewOffsets(false);
  }

  /* -------------------------------------------------------------------------- */
  /* True Fullscreen Event Handling                                             */
  /* -------------------------------------------------------------------------- */

  api.onFullscreenChanged(({ isFullscreen: fs }) => {
    isFullscreen = !!fs;
    if (isFullscreen) {
      chromeHeader.classList.add('fullscreen-hidden');
      closeAllDrawers();
      closeFindInPage();
    } else {
      chromeHeader.classList.remove('fullscreen-hidden');
      updateViewOffsets(false);
    }
  });

  /* -------------------------------------------------------------------------- */
  /* Settings Management & History Toggle                                       */
  /* -------------------------------------------------------------------------- */

  async function loadSettings() {
    try {
      const s = await api.getSettings();
      historyLoggingEnabled = s.historyLogging;
      toggleHistoryLogging.checked = historyLoggingEnabled;
      updateHistoryStatusUI();
      if (settingsDownloadDir) {
        settingsDownloadDir.textContent = s.downloadDir + (s.isCustomDir ? ' (Custom)' : ' (Default)');
      }

      const ver = await api.getVersion();
      if (appCurrentVersion) {
        appCurrentVersion.textContent = `v${ver}`;
      }
    } catch (e) {}
  }

  function updateHistoryStatusUI() {
    if (historyStatusTag) {
      if (historyLoggingEnabled) {
        historyStatusTag.textContent = 'Local Vault';
        historyStatusTag.style.color = 'var(--text-muted)';
      } else {
        historyStatusTag.textContent = '⚠️ Logging Paused';
        historyStatusTag.style.color = 'var(--accent-amber)';
      }
    }
  }

  toggleHistoryLogging.addEventListener('change', async (e) => {
    const enabled = e.target.checked;
    historyLoggingEnabled = await api.setHistoryLogging(enabled);
    updateHistoryStatusUI();
    showToast(
      historyLoggingEnabled ? '📝' : '🔒',
      historyLoggingEnabled ? 'Browsing History: ACTIVE (Logging enabled)' : 'Browsing History: PAUSED (Zero URLs logged)'
    );
  });

  btnSettingsChangeDir.addEventListener('click', async () => {
    const res = await api.chooseDownloadDir();
    settingsDownloadDir.textContent = res.path + (res.isCustom ? ' (Custom)' : ' (Default)');
    if (currentDownloadDir) currentDownloadDir.textContent = res.path + (res.isCustom ? ' (Custom)' : ' (Default)');
    showToast('📂', 'Download folder updated');
  });

  btnSettingsResetDir.addEventListener('click', async () => {
    const res = await api.resetDownloadDir();
    settingsDownloadDir.textContent = res.path + ' (Default)';
    if (currentDownloadDir) currentDownloadDir.textContent = res.path + ' (Default)';
    showToast('↺', 'Reset download folder to default');
  });

  /* -------------------------------------------------------------------------- */
  /* In-App Update Checker Engine                                               */
  /* -------------------------------------------------------------------------- */

  async function checkForUpdates(manual = false) {
    if (updateStatusBadge) updateStatusBadge.textContent = 'Checking...';
    try {
      const res = await api.checkUpdates();
      if (res.hasUpdate) {
        latestReleaseUrl = res.releaseUrl || 'https://github.com/katungatigift391-svg/BRWSR/releases/latest';
        if (updateStatusBadge) {
          updateStatusBadge.textContent = `Update available: ${res.latestVersion}`;
          updateStatusBadge.style.color = 'var(--accent-green)';
        }
        if (updateDetailsBox) {
          updateDetailsBox.style.display = 'flex';
          updateLatestVersionText.textContent = `🚀 Update Available: ${res.latestVersion}`;
        }
        if (manual) {
          showToast('🚀', `New release available: ${res.latestVersion}!`, 4000);
        }
      } else {
        if (updateStatusBadge) {
          updateStatusBadge.textContent = 'Up to date';
          updateStatusBadge.style.color = 'var(--accent-cyan)';
        }
        if (updateDetailsBox) updateDetailsBox.style.display = 'none';
        if (manual) {
          showToast('✅', `BRWSR v${res.currentVersion} is up to date!`);
        }
      }
    } catch (err) {
      if (updateStatusBadge) updateStatusBadge.textContent = 'Check failed';
      if (manual) showToast('⚠️', 'Could not connect to update server');
    }
  }

  btnCheckUpdates.addEventListener('click', () => checkForUpdates(true));

  btnDownloadUpdate.addEventListener('click', () => {
    api.openExternalUrl(latestReleaseUrl);
  });

  menuItemSettings.addEventListener('click', () => {
    closeAllDrawers();
    settingsDrawer.classList.add('open');
    updateViewOffsets(true);
    loadSettings();
    checkForUpdates(false);
  });

  btnCloseSettingsDrawer.addEventListener('click', () => closeAllDrawers());

  /* -------------------------------------------------------------------------- */
  /* Tabs Rendering & Management                                                */
  /* -------------------------------------------------------------------------- */

  function renderTabs() {
    tabsContainer.innerHTML = '';
    tabs.forEach(tab => {
      const tabEl = document.createElement('div');
      tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
      tabEl.dataset.id = tab.id;

      const favEl = document.createElement('span');
      favEl.className = 'tab-favicon';
      if (tab.loading) {
        favEl.textContent = '⟳';
      } else if (tab.favicon) {
        const img = document.createElement('img');
        img.src = tab.favicon;
        img.style.width = '14px';
        img.style.height = '14px';
        img.onerror = () => { favEl.textContent = '🌐'; };
        favEl.appendChild(img);
      } else {
        favEl.textContent = '🌐';
      }

      const titleEl = document.createElement('span');
      titleEl.className = 'tab-title';
      titleEl.textContent = tab.title || (tab.loading ? 'Loading...' : 'New Tab');

      const closeBtn = document.createElement('span');
      closeBtn.className = 'tab-close';
      closeBtn.textContent = '✕';
      closeBtn.title = 'Close tab';
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        api.closeTab(tab.id);
      });

      tabEl.appendChild(favEl);
      tabEl.appendChild(titleEl);
      tabEl.appendChild(closeBtn);

      tabEl.addEventListener('click', () => {
        if (tab.id !== activeTabId) {
          api.switchTab(tab.id);
        }
      });

      tabsContainer.appendChild(tabEl);
    });
  }

  async function updateActiveTabUI() {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    urlInput.value = activeTab.url || '';
    btnClearUrl.style.display = urlInput.value ? 'block' : 'none';

    btnBack.disabled = !activeTab.canGoBack;
    btnForward.disabled = !activeTab.canGoForward;

    dotZapper.style.display = activeTab.isZapper ? 'inline-block' : 'none';
    dotFrozen.style.display = activeTab.isFrozen ? 'inline-block' : 'none';
    dotBot.style.display = activeTab.isBot ? 'inline-block' : 'none';

    menuItemZapper.classList.toggle('active', !!activeTab.isZapper);
    menuItemFreeze.classList.toggle('active-red', !!activeTab.isFrozen);
    menuItemBot.classList.toggle('active-green', !!activeTab.isBot);
    menuItemDark.classList.toggle('active', !!activeTab.isDarkMode);

    const mediaCount = activeTab.mediaCount || (activeTab.mediaStreams || []).length;
    mediaStreamBadge.textContent = mediaCount;

    if (mediaCount > 0) {
      btnDynamicMedia.style.display = 'flex';
      dynamicMediaLabel.textContent = `${mediaCount} Video${mediaCount > 1 ? 's' : ''} Detected`;
    } else {
      btnDynamicMedia.style.display = 'none';
    }

    if (activeTab.url && !activeTab.url.startsWith('about:')) {
      const isBm = await api.isBookmarked(activeTab.url);
      btnBookmark.classList.toggle('active', !!isBm);
    } else {
      btnBookmark.classList.remove('active');
    }

    try {
      if (activeTab.url && activeTab.url.startsWith('http')) {
        const parsed = new URL(activeTab.url);
        activeDomain = parsed.hostname;
      } else {
        activeDomain = 'local';
      }
    } catch (e) {
      activeDomain = 'local';
    }

    drawerDomain.textContent = activeDomain;
    fetchDomainRules();
  }

  /* -------------------------------------------------------------------------- */
  /* Dynamic Media Download Button Action                                       */
  /* -------------------------------------------------------------------------- */

  btnDynamicMedia.addEventListener('click', async () => {
    if (!activeTabId) return;
    const tab = tabs.find(t => t.id === activeTabId);
    const streams = tab?.mediaStreams || [];

    if (streams.length === 1) {
      api.downloadUrl(streams[0]);
      showToast('⬇', 'Downloading detected video stream...');
    } else {
      await api.toggleLiveMediaScanner(activeTabId);
    }
  });

  /* -------------------------------------------------------------------------- */
  /* Expandable Push-Down Surgical Deck                                         */
  /* -------------------------------------------------------------------------- */

  btnSurgicalMenu.addEventListener('click', () => {
    isDeckOpen = !isDeckOpen;
    surgicalDeckPanel.classList.toggle('open', isDeckOpen);
    btnSurgicalMenu.classList.toggle('open', isDeckOpen);
    deckArrow.textContent = isDeckOpen ? '▴' : '▾';

    const anyDrawerOpen = settingsDrawer.classList.contains('open') || rulesDrawer.classList.contains('open') || historyDrawer.classList.contains('open') || mediaDrawer.classList.contains('open') || downloadsDrawer.classList.contains('open');
    updateViewOffsets(anyDrawerOpen);
  });

  menuItemZapper.addEventListener('click', async () => {
    if (!activeTabId) return;
    const res = await api.toggleZapper(activeTabId);
    showToast('⚡', res.active ? 'Multi-Zap Mode Active: Click any overlay (Esc to exit)' : 'Zapper Mode Exited');
  });

  menuItemUnlock.addEventListener('click', async () => {
    if (!activeTabId) return;
    await api.unlockScroll(activeTabId);
    showToast('🔓', 'Scroll & backdrop locks purged!');
  });

  menuItemFreeze.addEventListener('click', async () => {
    if (!activeTabId) return;
    const res = await api.freezeJS(activeTabId);
    showToast(res.frozen ? '🛑' : '▶️', res.frozen ? 'JavaScript Execution FROZEN' : 'JavaScript Execution Resumed');
  });

  menuItemBot.addEventListener('click', async () => {
    if (!activeTabId) return;
    const res = await api.toggleGooglebot(activeTabId);
    showToast('🕵️', res.isBot ? 'Googlebot Spoofing ENABLED' : 'Googlebot Spoofing Disabled');
  });

  menuItemDark.addEventListener('click', async () => {
    if (!activeTabId) return;
    const res = await api.toggleDarkMode(activeTabId);
    showToast('🌙', res.isDark ? 'Force Dark Mode ENABLED' : 'Force Dark Mode Disabled');
  });

  menuItemMedia.addEventListener('click', async () => {
    if (activeTabId) {
      await api.toggleLiveMediaScanner(activeTabId);
    }
  });

  menuItemDownloads.addEventListener('click', () => {
    closeAllDrawers();
    downloadsDrawer.classList.add('open');
    updateViewOffsets(true);
    fetchDownloads();
    fetchDownloadDir();
  });

  menuItemRules.addEventListener('click', () => {
    closeAllDrawers();
    rulesDrawer.classList.add('open');
    updateViewOffsets(true);
    fetchDomainRules();
  });

  menuItemHistory.addEventListener('click', () => {
    closeAllDrawers();
    historyDrawer.classList.add('open');
    updateViewOffsets(true);
    fetchHistory();
  });

  menuItemDevTools.addEventListener('click', () => {
    if (activeTabId) api.toggleDevTools(activeTabId);
  });

  /* -------------------------------------------------------------------------- */
  /* Downloads Engine & Custom Folder                                           */
  /* -------------------------------------------------------------------------- */

  async function fetchDownloadDir() {
    try {
      const res = await api.getDownloadDir();
      currentDownloadDir.textContent = res.path + (res.isCustom ? ' (Custom)' : ' (Default)');
    } catch (e) {}
  }

  btnChangeDownloadDir.addEventListener('click', async () => {
    const res = await api.chooseDownloadDir();
    currentDownloadDir.textContent = res.path + (res.isCustom ? ' (Custom)' : ' (Default)');
    if (settingsDownloadDir) settingsDownloadDir.textContent = res.path + (res.isCustom ? ' (Custom)' : ' (Default)');
    showToast('📂', `Download folder updated!`);
  });

  btnResetDownloadDir.addEventListener('click', async () => {
    const res = await api.resetDownloadDir();
    currentDownloadDir.textContent = res.path + ' (Default)';
    if (settingsDownloadDir) settingsDownloadDir.textContent = res.path + ' (Default)';
    showToast('↺', 'Reset download folder to default');
  });

  async function fetchDownloads() {
    try {
      downloads = await api.getDownloads();
      renderDownloadsList();
      updateDownloadsToolbarPill();
      fetchDownloadDir();
    } catch (e) {
      console.error('Failed to fetch downloads:', e);
    }
  }

  function renderDownloadsList() {
    downloadsList.innerHTML = '';
    drawerDownloadsCount.textContent = downloads.length;

    if (downloads.length === 0) {
      downloadsList.innerHTML = '<div class="empty-rules">No downloads yet.</div>';
      return;
    }

    downloads.forEach(d => {
      const card = document.createElement('div');
      card.className = 'download-card';

      const header = document.createElement('div');
      header.className = 'dl-header';

      const name = document.createElement('span');
      name.className = 'dl-name';
      name.textContent = d.filename;
      name.title = d.savePath;

      const tag = document.createElement('span');
      tag.className = `dl-status-tag ${d.state}`;
      tag.textContent = d.state === 'progressing' ? `${d.percent}%` : d.state;

      header.appendChild(name);
      header.appendChild(tag);
      card.appendChild(header);

      if (d.state === 'progressing') {
        const pWrapper = document.createElement('div');
        pWrapper.className = 'dl-progress-wrapper';
        const pFill = document.createElement('div');
        pFill.className = 'dl-progress-fill';
        pFill.style.width = `${d.percent}%`;
        pWrapper.appendChild(pFill);
        card.appendChild(pWrapper);
      }

      const meta = document.createElement('div');
      meta.className = 'dl-meta-row';

      const sizeInfo = document.createElement('span');
      sizeInfo.textContent = `${formatBytes(d.receivedBytes)} / ${formatBytes(d.totalBytes)} ${d.state === 'progressing' ? `(${d.speed})` : ''}`;

      const actions = document.createElement('div');
      actions.className = 'dl-actions';

      if (d.state === 'completed') {
        const btnOpen = document.createElement('button');
        btnOpen.className = 'btn-action-sm';
        btnOpen.textContent = 'Open';
        btnOpen.addEventListener('click', () => api.openDownloadFile(d.savePath));

        const btnFolder = document.createElement('button');
        btnFolder.className = 'btn-action-sm';
        btnFolder.textContent = 'Folder';
        btnFolder.addEventListener('click', () => api.showDownloadInFolder(d.savePath));

        actions.appendChild(btnOpen);
        actions.appendChild(btnFolder);
      } else if (d.state === 'progressing') {
        const btnCancel = document.createElement('button');
        btnCancel.className = 'btn-action-danger';
        btnCancel.textContent = 'Cancel';
        btnCancel.addEventListener('click', () => api.cancelDownload(d.id));
        actions.appendChild(btnCancel);
      }

      meta.appendChild(sizeInfo);
      meta.appendChild(actions);
      card.appendChild(meta);

      downloadsList.appendChild(card);
    });
  }

  function updateDownloadsToolbarPill() {
    const active = downloads.filter(d => d.state === 'progressing');
    if (active.length > 0) {
      btnToolbarDownloads.style.display = 'flex';
      const top = active[0];
      dlToolbarSpeed.textContent = top.speed || 'Downloading...';
      dlToolbarBar.style.width = `${top.percent}%`;
    } else {
      btnToolbarDownloads.style.display = 'none';
    }
  }

  btnToolbarDownloads.addEventListener('click', () => {
    closeAllDrawers();
    downloadsDrawer.classList.add('open');
    updateViewOffsets(true);
    fetchDownloads();
    fetchDownloadDir();
  });

  btnCloseDownloadsDrawer.addEventListener('click', () => {
    downloadsDrawer.classList.remove('open');
    updateViewOffsets(false);
  });

  btnClearCompletedDownloads.addEventListener('click', async () => {
    await api.clearDownloads();
    showToast('🧹', 'Completed downloads cleared');
    fetchDownloads();
  });

  api.onDownloadProgress((data) => {
    const idx = downloads.findIndex(d => d.id === data.id);
    if (idx >= 0) {
      downloads[idx] = data;
    } else {
      downloads.unshift(data);
    }
    updateDownloadsToolbarPill();
    if (downloadsDrawer.classList.contains('open')) {
      renderDownloadsList();
    }
  });

  api.onDownloadCompleted((data) => {
    const idx = downloads.findIndex(d => d.id === data.id);
    if (idx >= 0) {
      downloads[idx] = data;
    } else {
      downloads.unshift(data);
    }
    updateDownloadsToolbarPill();
    if (downloadsDrawer.classList.contains('open')) {
      renderDownloadsList();
    }
    showToast('⬇', data.state === 'completed' ? `Download complete: ${data.filename}` : `Download ${data.state}: ${data.filename}`, 3500);
  });

  /* -------------------------------------------------------------------------- */
  /* History Drawer Engine                                                      */
  /* -------------------------------------------------------------------------- */

  async function fetchHistory(query = '') {
    try {
      const items = await api.getHistory(query);
      renderHistoryList(items);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    }
  }

  function renderHistoryList(items) {
    historyList.innerHTML = '';
    if (!items || items.length === 0) {
      historyList.innerHTML = '<div class="empty-rules">No history found.</div>';
      return;
    }

    items.slice(0, 100).forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';

      const info = document.createElement('div');
      info.className = 'history-info';

      const title = document.createElement('span');
      title.className = 'history-title';
      title.textContent = item.title || item.url;

      const url = document.createElement('span');
      url.className = 'history-url';
      url.textContent = item.url;

      info.appendChild(title);
      info.appendChild(url);

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-rule';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete history entry';
      delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await api.deleteHistoryItem(item.url);
        fetchHistory(historySearchInput.value);
      });

      el.appendChild(info);
      el.appendChild(delBtn);

      el.addEventListener('click', () => {
        if (activeTabId) {
          api.navigateTab(activeTabId, item.url);
          closeAllDrawers();
        }
      });

      historyList.appendChild(el);
    });
  }

  historySearchInput.addEventListener('input', (e) => {
    fetchHistory(e.target.value);
  });

  btnPurgeAllHistory.addEventListener('click', async () => {
    await api.clearHistory();
    showToast('🧹', 'All browsing history purged');
    fetchHistory();
  });

  btnCloseHistoryDrawer.addEventListener('click', () => closeAllDrawers());

  /* -------------------------------------------------------------------------- */
  /* Domain Rules Drawer Engine                                                 */
  /* -------------------------------------------------------------------------- */

  async function fetchDomainRules() {
    if (!activeDomain || activeDomain === 'local') {
      activeDomainRules = [];
      renderRulesList();
      menuRuleBadge.textContent = '0';
      return;
    }

    try {
      const rules = await api.getRules(activeDomain);
      activeDomainRules = rules || [];
      menuRuleBadge.textContent = activeDomainRules.length;
      drawerRuleCount.textContent = activeDomainRules.length;
      renderRulesList();
    } catch (e) {
      console.error('Failed to fetch rules:', e);
    }
  }

  function renderRulesList() {
    rulesList.innerHTML = '';
    if (activeDomainRules.length === 0) {
      rulesList.innerHTML = '<div class="empty-rules">No persistent rules for this domain yet. Use Multi-Zap to vaporize elements.</div>';
      return;
    }

    activeDomainRules.forEach(rule => {
      const item = document.createElement('div');
      item.className = 'rule-item';

      const span = document.createElement('span');
      span.textContent = rule.selector;
      span.title = rule.selector;

      const delBtn = document.createElement('button');
      delBtn.className = 'btn-delete-rule';
      delBtn.textContent = '✕';
      delBtn.title = 'Delete Rule';
      delBtn.addEventListener('click', async () => {
        await api.deleteRule(activeDomain, rule.id || rule.selector);
        showToast('🗑️', `Deleted rule: ${rule.selector}`);
        fetchDomainRules();
      });

      item.appendChild(span);
      item.appendChild(delBtn);
      rulesList.appendChild(item);
    });
  }

  btnAddCustomRule.addEventListener('click', async () => {
    const sel = customSelectorInput.value.trim();
    if (!sel || !activeDomain || activeDomain === 'local') return;

    await api.addRule(activeDomain, { selector: sel, tag: 'custom', id: Date.now().toString() });
    customSelectorInput.value = '';
    showToast('💾', `Added rule: ${sel}`);
    fetchDomainRules();
  });

  customSelectorInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') btnAddCustomRule.click();
  });

  btnPurgeDomainRules.addEventListener('click', async () => {
    if (!activeDomain || activeDomain === 'local') return;
    for (const rule of activeDomainRules) {
      await api.deleteRule(activeDomain, rule.id || rule.selector);
    }
    showToast('🧹', `All rules purged for ${activeDomain}`);
    fetchDomainRules();
  });

  btnCloseRulesDrawer.addEventListener('click', () => closeAllDrawers());
  btnCloseMediaDrawer.addEventListener('click', () => closeAllDrawers());

  /* -------------------------------------------------------------------------- */
  /* Bookmarks Engine                                                           */
  /* -------------------------------------------------------------------------- */

  btnBookmark.addEventListener('click', async () => {
    if (!activeTabId) return;
    const isNowBookmarked = await api.toggleBookmark(activeTabId);
    btnBookmark.classList.toggle('active', isNowBookmarked);
    showToast('⭐', isNowBookmarked ? 'Page bookmarked!' : 'Bookmark removed');
  });

  /* -------------------------------------------------------------------------- */
  /* Find In Page Engine                                                        */
  /* -------------------------------------------------------------------------- */

  function openFindInPage() {
    findBar.classList.add('open');
    findInput.focus();
    findInput.select();
  }

  function closeFindInPage() {
    findBar.classList.remove('open');
    if (activeTabId) {
      api.stopFindInPage(activeTabId, 'clearSelection');
    }
  }

  findInput.addEventListener('input', (e) => {
    const text = e.target.value.trim();
    if (text && activeTabId) {
      api.findInPage(activeTabId, text, { forward: true, findNext: false });
    } else if (activeTabId) {
      api.stopFindInPage(activeTabId, 'clearSelection');
      findMatches.textContent = '0/0';
    }
  });

  findInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) btnFindPrev.click();
      else btnFindNext.click();
    } else if (e.key === 'Escape') {
      closeFindInPage();
    }
  });

  btnFindNext.addEventListener('click', () => {
    const text = findInput.value.trim();
    if (text && activeTabId) {
      api.findInPage(activeTabId, text, { forward: true, findNext: true });
    }
  });

  btnFindPrev.addEventListener('click', () => {
    const text = findInput.value.trim();
    if (text && activeTabId) {
      api.findInPage(activeTabId, text, { forward: false, findNext: true });
    }
  });

  btnFindClose.addEventListener('click', () => closeFindInPage());

  api.onFoundInPage((res) => {
    if (res.matches !== undefined) {
      findMatches.textContent = `${res.activeMatchOrdinal || 0}/${res.matches}`;
    }
  });

  /* -------------------------------------------------------------------------- */
  /* Navigation & Global Event Listeners                                        */
  /* -------------------------------------------------------------------------- */

  btnNewTab.addEventListener('click', () => api.createTab());

  btnBack.addEventListener('click', () => {
    if (activeTabId) api.goBackTab(activeTabId);
  });

  btnForward.addEventListener('click', () => {
    if (activeTabId) api.goForwardTab(activeTabId);
  });

  btnReload.addEventListener('click', () => {
    if (activeTabId) api.reloadTab(activeTabId);
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = urlInput.value.trim();
      if (input && activeTabId) {
        api.navigateTab(activeTabId, input);
      }
    }
  });

  urlInput.addEventListener('focus', () => urlInput.select());

  btnClearUrl.addEventListener('click', () => {
    urlInput.value = '';
    urlInput.focus();
  });

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 't') {
      e.preventDefault();
      api.createTab();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      if (activeTabId) api.closeTab(activeTabId);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      urlInput.focus();
      urlInput.select();
    } else if ((e.ctrlKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
      e.preventDefault();
      if (activeTabId) api.reloadTab(activeTabId);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openFindInPage();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      closeAllDrawers();
      historyDrawer.classList.add('open');
      updateViewOffsets(true);
      fetchHistory();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      closeAllDrawers();
      downloadsDrawer.classList.add('open');
      updateViewOffsets(true);
      fetchDownloads();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      if (activeTabId) api.toggleLiveMediaScanner(activeTabId);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      btnBookmark.click();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      menuItemZapper.click();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      menuItemUnlock.click();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      menuItemFreeze.click();
    } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      menuItemDark.click();
    } else if (e.key === 'F11') {
      e.preventDefault();
      api.toggleWindowFullscreen();
    } else if (e.key === 'F12') {
      e.preventDefault();
      if (activeTabId) api.toggleDevTools(activeTabId);
    }
  });

  /* -------------------------------------------------------------------------- */
  /* IPC Event Handlers from Main Process                                       */
  /* -------------------------------------------------------------------------- */

  api.onTabCreated((data) => {
    tabs.push({
      id: data.id,
      url: data.url || '',
      title: data.title || 'New Tab',
      favicon: data.favicon || '',
      loading: false,
      canGoBack: false,
      canGoForward: false,
      isZapper: false,
      isFrozen: false,
      isBot: false,
      isDarkMode: false,
      isFullscreen: false,
      mediaCount: 0,
      mediaStreams: []
    });
    activeTabId = data.id;
    renderTabs();
    updateActiveTabUI();
  });

  api.onTabUpdated((data) => {
    const tab = tabs.find(t => t.id === data.id);
    if (tab) {
      Object.assign(tab, data);
      renderTabs();
      if (tab.id === activeTabId) {
        updateActiveTabUI();
      }
    }
  });

  api.onTabClosed((tabId) => {
    tabs = tabs.filter(t => t.id !== tabId);
    renderTabs();
  });

  api.onTabSwitched((tabId) => {
    activeTabId = tabId;
    renderTabs();
    updateActiveTabUI();
  });

  api.onMediaCaptured((data) => {
    const tab = tabs.find(t => t.id === data.tabId);
    if (tab) {
      if (!tab.mediaStreams.includes(data.url)) {
        tab.mediaStreams.push(data.url);
      }
      tab.mediaCount = tab.mediaStreams.length;
    }
    if (data.tabId === activeTabId) {
      updateActiveTabUI();
    }
  });

  setTimeout(() => {
    if (tabs.length === 0) {
      api.createTab('https://duckduckgo.com');
    }
    loadSettings();
    setTimeout(() => checkForUpdates(false), 2000);
  }, 100);

})();
