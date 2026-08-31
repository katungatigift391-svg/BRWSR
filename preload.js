const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('browserAPI', {
  // Tab Management
  createTab: (url) => ipcRenderer.invoke('tab:create', url),
  closeTab: (tabId) => ipcRenderer.invoke('tab:close', tabId),
  switchTab: (tabId) => ipcRenderer.invoke('tab:switch', tabId),
  navigateTab: (tabId, url) => ipcRenderer.invoke('tab:navigate', { tabId, url }),
  reloadTab: (tabId) => ipcRenderer.invoke('tab:reload', tabId),
  goBackTab: (tabId) => ipcRenderer.invoke('tab:go-back', tabId),
  goForwardTab: (tabId) => ipcRenderer.invoke('tab:go-forward', tabId),

  // View Layout Management & Fullscreen
  setViewBoundsOffset: (offset) => ipcRenderer.invoke('view:set-bounds-offset', offset),
  toggleWindowFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  onFullscreenChanged: (callback) => ipcRenderer.on('page:fullscreen-changed', (e, data) => callback(data)),

  // Surgical Tools
  toggleZapper: (tabId) => ipcRenderer.invoke('action:toggle-zapper', tabId),
  unlockScroll: (tabId) => ipcRenderer.invoke('action:unlock-scroll', tabId),
  freezeJS: (tabId) => ipcRenderer.invoke('action:freeze-js', tabId),
  toggleGooglebot: (tabId) => ipcRenderer.invoke('action:toggle-googlebot', tabId),
  toggleDarkMode: (tabId) => ipcRenderer.invoke('action:toggle-dark-mode', tabId),
  toggleLiveMediaScanner: (tabId) => ipcRenderer.invoke('action:toggle-media-scanner', tabId),
  toggleDevTools: (tabId) => ipcRenderer.invoke('action:toggle-devtools', tabId),

  // Find in Page
  findInPage: (tabId, text, options) => ipcRenderer.invoke('page:find', { tabId, text, options }),
  stopFindInPage: (tabId, action) => ipcRenderer.invoke('page:stop-find', { tabId, action }),
  onFoundInPage: (callback) => ipcRenderer.on('page:found-in-page', (e, result) => callback(result)),

  // Downloads Engine & Custom Folder
  getDownloads: () => ipcRenderer.invoke('downloads:get'),
  downloadUrl: (url) => ipcRenderer.invoke('downloads:download-url', url),
  downloadYtdlp: (url) => ipcRenderer.invoke('downloads:ytdlp', url),
  ytdlpAvailable: () => ipcRenderer.invoke('downloads:ytdlp-available'),
  openDownloadFile: (filePath) => ipcRenderer.invoke('downloads:open-file', filePath),
  showDownloadInFolder: (filePath) => ipcRenderer.invoke('downloads:show-in-folder', filePath),
  cancelDownload: (id) => ipcRenderer.invoke('downloads:cancel', id),
  clearDownloads: () => ipcRenderer.invoke('downloads:clear'),
  getDownloadDir: () => ipcRenderer.invoke('settings:get-download-dir'),
  chooseDownloadDir: () => ipcRenderer.invoke('settings:choose-download-dir'),
  resetDownloadDir: () => ipcRenderer.invoke('settings:reset-download-dir'),
  onDownloadProgress: (callback) => ipcRenderer.on('downloads:progress', (e, data) => callback(data)),
  onDownloadCompleted: (callback) => ipcRenderer.on('downloads:completed', (e, data) => callback(data)),

  // Settings & History Logging Toggle
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setHistoryLogging: (enabled) => ipcRenderer.invoke('settings:set-history-logging', enabled),

  // In-App Updates & External Link Dispatch
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  checkUpdates: () => ipcRenderer.invoke('app:check-updates'),
  openExternalUrl: (url) => ipcRenderer.invoke('app:open-external-url', url),

  // Media Sniffer
  getMediaStreams: (tabId) => ipcRenderer.invoke('media:get-streams', tabId),
  onMediaCaptured: (callback) => ipcRenderer.on('media:captured', (e, data) => callback(data)),

  // History
  getHistory: (query) => ipcRenderer.invoke('history:get', query),
  clearHistory: () => ipcRenderer.invoke('history:clear'),
  deleteHistoryItem: (url) => ipcRenderer.invoke('history:delete-item', url),

  // Bookmarks
  getBookmarks: () => ipcRenderer.invoke('bookmarks:get'),
  toggleBookmark: (tabId) => ipcRenderer.invoke('bookmarks:toggle', tabId),
  isBookmarked: (url) => ipcRenderer.invoke('bookmarks:is-bookmarked', url),

  // Rules Management
  getRules: (domain) => ipcRenderer.invoke('rules:get', domain),
  getAllRules: () => ipcRenderer.invoke('rules:get-all'),
  addRule: (domain, rule) => ipcRenderer.invoke('rules:add', { domain, rule }),
  deleteRule: (domain, ruleId) => ipcRenderer.invoke('rules:delete', { domain, ruleId }),

  // Event Listeners from Main Process
  onTabCreated: (callback) => ipcRenderer.on('tab:created', (e, data) => callback(data)),
  onTabUpdated: (callback) => ipcRenderer.on('tab:updated', (e, data) => callback(data)),
  onTabClosed: (callback) => ipcRenderer.on('tab:closed', (e, tabId) => callback(tabId)),
  onTabSwitched: (callback) => ipcRenderer.on('tab:switched', (e, tabId) => callback(tabId)),
  onActionStatus: (callback) => ipcRenderer.on('action:status', (e, data) => callback(data))
});
