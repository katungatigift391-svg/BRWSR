const { ipcRenderer } = require('electron');

(() => {
  if (window.__BRWSR_INJECTED__) return;
  window.__BRWSR_INJECTED__ = true;

  /* -------------------------------------------------------------------------- */
  /* 1. Early Prototype & Anti-Tamper Neutralization                            */
  /* -------------------------------------------------------------------------- */

  try {
    const originalFunction = window.Function;
    window.Function = function (...args) {
      if (args.length > 0) {
        const body = args[args.length - 1];
        if (typeof body === 'string' && (body.includes('debugger') || body.includes('while (true)'))) {
          args[args.length - 1] = body.replace(/debugger\s*;?/g, '');
        }
      }
      return originalFunction.apply(this, args);
    };
    window.Function.prototype = originalFunction.prototype;
  } catch (e) {}

  try {
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      const blockedEvents = ['contextmenu', 'selectstart', 'copy', 'cut'];
      if (blockedEvents.includes(type) && (this === window || this === document || this === document.body)) {
        const wrappedListener = function (e) {
          if (typeof listener === 'function') {
            try { listener.call(this, e); } catch (err) {}
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };
  } catch (e) {}

  /* -------------------------------------------------------------------------- */
  /* 2. Persistent Rule Applicator (CSS & MutationObserver)                     */
  /* -------------------------------------------------------------------------- */

  let domainRules = [];
  let styleSheetElement = null;

  function applyStoredRules(rules) {
    if (!rules || !Array.isArray(rules) || rules.length === 0) return;
    domainRules = rules;

    const selectors = rules.map(r => r.selector).filter(Boolean);
    if (selectors.length === 0) return;

    const css = selectors.map(s => `${s} { display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important; }`).join('\n');

    if (!styleSheetElement) {
      styleSheetElement = document.createElement('style');
      styleSheetElement.id = 'brwsr-persistent-rules';
      (document.head || document.documentElement).appendChild(styleSheetElement);
    }
    styleSheetElement.textContent = css;

    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => el.remove());
      } catch (err) {}
    });
  }

  ipcRenderer.invoke('rules:get-for-page', window.location.hostname).then(rules => {
    applyStoredRules(rules);
  }).catch(() => {});

  const domObserver = new MutationObserver(() => {
    if (!domainRules || domainRules.length === 0) return;
    for (const rule of domainRules) {
      if (!rule.selector) continue;
      try {
        const matches = document.querySelectorAll(rule.selector);
        for (let i = 0; i < matches.length; i++) {
          matches[i].remove();
        }
      } catch (e) {}
    }
  });

  if (document.documentElement) {
    domObserver.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      domObserver.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 3. Continuous Multi-Zap Engine                                             */
  /* -------------------------------------------------------------------------- */

  let zapperActive = false;
  let hoveredElement = null;
  let hudElement = null;
  let zappedCount = 0;

  function createZapperHUD() {
    if (hudElement) return;
    hudElement = document.createElement('div');
    hudElement.id = 'brwsr-zapper-hud';
    hudElement.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      pointer-events: none;
      border: 2px solid #06b6d4;
      background: rgba(6, 182, 212, 0.18);
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(6, 182, 212, 0.2);
      transition: all 0.05s ease-out;
      display: none;
      box-sizing: border-box;
    `;

    const label = document.createElement('div');
    label.id = 'brwsr-zapper-label';
    label.style.cssText = `
      position: absolute;
      top: -30px;
      left: 0;
      background: #0b0f19;
      color: #38bdf8;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #06b6d4;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0,0,0,0.6);
    `;
    hudElement.appendChild(label);
    (document.body || document.documentElement).appendChild(hudElement);
  }

  function getOptimalSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return null;

    if (el.id && !/^\d/.test(el.id) && !el.id.includes(':')) {
      return `#${CSS.escape(el.id)}`;
    }

    const classes = Array.from(el.classList || [])
      .filter(c => !c.startsWith('brwsr-') && !c.includes(':') && c.length < 40)
      .slice(0, 3);

    if (classes.length > 0) {
      const classSelector = '.' + classes.map(c => CSS.escape(c)).join('.');
      if (document.querySelectorAll(classSelector).length === 1) return classSelector;
      return `${el.tagName.toLowerCase()}${classSelector}`;
    }

    const role = el.getAttribute('role');
    if (role) return `${el.tagName.toLowerCase()}[role="${role}"]`;

    let path = el.tagName.toLowerCase();
    let parent = el.parentElement;
    let depth = 0;
    while (parent && parent !== document.body && depth < 3) {
      const tag = parent.tagName.toLowerCase();
      if (parent.id) {
        path = `#${CSS.escape(parent.id)} > ${path}`;
        break;
      }
      path = `${tag} > ${path}`;
      parent = parent.parentElement;
      depth++;
    }
    return path;
  }

  function onZapperMouseMove(e) {
    if (!zapperActive) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === hudElement || target === document.body || target === document.documentElement || target.id?.startsWith('brwsr-')) {
      if (hudElement) hudElement.style.display = 'none';
      hoveredElement = null;
      return;
    }

    hoveredElement = target;
    createZapperHUD();

    const rect = target.getBoundingClientRect();
    hudElement.style.display = 'block';
    hudElement.style.top = `${Math.max(0, rect.top)}px`;
    hudElement.style.left = `${Math.max(0, rect.left)}px`;
    hudElement.style.width = `${rect.width}px`;
    hudElement.style.height = `${rect.height}px`;

    const label = hudElement.querySelector('#brwsr-zapper-label');
    if (label) {
      const selector = getOptimalSelector(target) || target.tagName.toLowerCase();
      label.textContent = `⚡ [${zappedCount} Zapped] ${selector} (${Math.round(rect.width)}x${Math.round(rect.height)}) [Click = Vaporize | Esc = Done]`;
      label.style.top = rect.top < 36 ? '4px' : '-30px';
    }
  }

  function onZapperClick(e) {
    if (!zapperActive || !hoveredElement) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const target = hoveredElement;
    const selector = getOptimalSelector(target);

    target.remove();
    zappedCount++;
    if (hudElement) hudElement.style.display = 'none';
    hoveredElement = null;

    forceUnlockScroll();

    if (selector) {
      ipcRenderer.invoke('rules:save-zapped', {
        hostname: window.location.hostname,
        selector: selector,
        tag: target.tagName.toLowerCase()
      }).then((updatedRules) => {
        applyStoredRules(updatedRules);
      }).catch(() => {});
    }
  }

  function onZapperKeyDown(e) {
    if (e.key === 'Escape' && zapperActive) {
      e.preventDefault();
      toggleZapperMode(false);
    }
  }

  function toggleZapperMode(activate) {
    zapperActive = (activate !== undefined) ? activate : !zapperActive;

    if (zapperActive) {
      zappedCount = 0;
      createZapperHUD();
      document.addEventListener('mousemove', onZapperMouseMove, true);
      document.addEventListener('click', onZapperClick, true);
      document.addEventListener('keydown', onZapperKeyDown, true);
      document.documentElement.style.cursor = 'crosshair';
      ipcRenderer.send('action:zapper-state', true);
    } else {
      if (hudElement) hudElement.style.display = 'none';
      document.removeEventListener('mousemove', onZapperMouseMove, true);
      document.removeEventListener('click', onZapperClick, true);
      document.removeEventListener('keydown', onZapperKeyDown, true);
      document.documentElement.style.cursor = '';
      hoveredElement = null;
      ipcRenderer.send('action:zapper-state', false);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 4. Scroll Unlocker & Backdrop Purge                                        */
  /* -------------------------------------------------------------------------- */

  function forceUnlockScroll() {
    const styleOverride = document.createElement('style');
    styleOverride.id = 'brwsr-scroll-unlocker';
    styleOverride.textContent = `
      html, body {
        overflow: auto !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        position: static !important;
        height: auto !important;
        max-height: none !important;
        margin: 0 !important;
        filter: none !important;
        -webkit-filter: none !important;
        pointer-events: auto !important;
        user-select: auto !important;
        -webkit-user-select: auto !important;
      }
      div[class*="backdrop"], div[class*="overlay"], div[class*="modal-bg"], div[class*="mask"] {
        display: none !important;
      }
    `;
    (document.head || document.documentElement).appendChild(styleOverride);

    if (document.documentElement) {
      document.documentElement.style.setProperty('overflow', 'auto', 'important');
      document.documentElement.style.setProperty('position', 'static', 'important');
    }
    if (document.body) {
      document.body.style.setProperty('overflow', 'auto', 'important');
      document.body.style.setProperty('position', 'static', 'important');
      document.body.style.setProperty('height', 'auto', 'important');
    }

    const allFixed = document.querySelectorAll('div, section, aside, span');
    allFixed.forEach(el => {
      const style = window.getComputedStyle(el);
      const isFixed = style.position === 'fixed' || style.position === 'sticky';
      const zIndex = parseInt(style.zIndex, 10);
      const isFullScreen = (el.offsetWidth >= window.innerWidth * 0.85 && el.offsetHeight >= window.innerHeight * 0.85);

      if (isFixed && (zIndex > 100 || isNaN(zIndex)) && isFullScreen) {
        const text = (el.textContent || '').toLowerCase();
        if (text.includes('subscribe') || text.includes('sign up') || text.includes('cookie') || text.includes('disable adblock') || text.includes('register') || style.backgroundColor.includes('rgba') || style.opacity !== '1') {
          el.remove();
        }
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 5. Force Dark Mode Inverter                                                */
  /* -------------------------------------------------------------------------- */

  let darkModeActive = false;
  function toggleDarkMode(forceState) {
    darkModeActive = (forceState !== undefined) ? forceState : !darkModeActive;
    let darkStyle = document.getElementById('brwsr-force-dark');
    if (darkModeActive) {
      if (!darkStyle) {
        darkStyle = document.createElement('style');
        darkStyle.id = 'brwsr-force-dark';
        darkStyle.textContent = `
          html {
            filter: invert(90%) hue-rotate(180deg) !important;
            background: #111 !important;
          }
          img, video, canvas, iframe, svg, [style*="background-image"] {
            filter: invert(100%) hue-rotate(180deg) !important;
          }
        `;
        (document.head || document.documentElement).appendChild(darkStyle);
      }
    } else {
      if (darkStyle) darkStyle.remove();
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 6. Live In-Page Video Hover Download Badge                                 */
  /* -------------------------------------------------------------------------- */

  let videoBadge = null;
  let activeHoveredMedia = null;

  function createVideoBadge() {
    if (videoBadge) return;
    videoBadge = document.createElement('div');
    videoBadge.id = 'brwsr-video-badge';
    videoBadge.style.cssText = `
      position: absolute;
      z-index: 2147483646;
      display: none;
      background: #0b0f19;
      border: 1px solid #06b6d4;
      border-radius: 6px;
      padding: 4px 8px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.8), 0 0 10px rgba(6, 182, 212, 0.4);
      gap: 6px;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      cursor: default;
    `;

    const dlBtn = document.createElement('button');
    dlBtn.textContent = '⬇ 1-Click Download';
    dlBtn.style.cssText = `
      background: #06b6d4;
      color: #041019;
      border: none;
      border-radius: 4px;
      padding: 3px 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 10px;
    `;
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeHoveredMedia) {
        const src = activeHoveredMedia.currentSrc || activeHoveredMedia.src;
        if (src) {
          ipcRenderer.invoke('downloads:download-url', src);
          dlBtn.textContent = '✓ Starting...';
          setTimeout(() => { dlBtn.textContent = '⬇ 1-Click Download'; }, 2000);
        }
      }
    });

    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy URL';
    copyBtn.style.cssText = `
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
      border-radius: 4px;
      padding: 3px 8px;
      cursor: pointer;
      font-size: 10px;
    `;
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeHoveredMedia) {
        const src = activeHoveredMedia.currentSrc || activeHoveredMedia.src;
        if (src) {
          navigator.clipboard.writeText(src);
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => { copyBtn.textContent = '📋 Copy URL'; }, 2000);
        }
      }
    });

    videoBadge.appendChild(dlBtn);
    videoBadge.appendChild(copyBtn);
    (document.body || document.documentElement).appendChild(videoBadge);
  }

  document.addEventListener('mouseover', (e) => {
    if (zapperActive) return;
    const target = e.target;
    if (target && (target.tagName === 'VIDEO' || target.tagName === 'AUDIO')) {
      const src = target.currentSrc || target.src;
      if (src) {
        activeHoveredMedia = target;
        createVideoBadge();
        const rect = target.getBoundingClientRect();
        videoBadge.style.display = 'flex';
        videoBadge.style.top = `${Math.max(10, rect.top + window.scrollY + 10)}px`;
        videoBadge.style.left = `${Math.max(10, rect.right + window.scrollX - 220)}px`;
      }
    }
  }, true);

  document.addEventListener('mousemove', (e) => {
    if (videoBadge && videoBadge.style.display === 'flex' && activeHoveredMedia) {
      const rect = activeHoveredMedia.getBoundingClientRect();
      const badgeRect = videoBadge.getBoundingClientRect();
      const inMedia = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
      const inBadge = e.clientX >= badgeRect.left && e.clientX <= badgeRect.right && e.clientY >= badgeRect.top && e.clientY <= badgeRect.bottom;
      if (!inMedia && !inBadge) {
        videoBadge.style.display = 'none';
        activeHoveredMedia = null;
      }
    }
  });

  /* -------------------------------------------------------------------------- */
  /* 7. Live In-Page Media Scanner Dashboard Overlay                            */
  /* -------------------------------------------------------------------------- */

  let mediaScannerModal = null;

  function scanAllPageMedia() {
    const found = [];
    // 1. Videos
    document.querySelectorAll('video').forEach(v => {
      const src = v.currentSrc || v.src;
      if (src && !found.some(f => f.src === src)) {
        found.push({
          type: 'video',
          src: src,
          width: v.videoWidth || v.clientWidth,
          height: v.videoHeight || v.clientHeight,
          duration: v.duration ? `${Math.round(v.duration)}s` : 'Stream'
        });
      }
      v.querySelectorAll('source').forEach(s => {
        if (s.src && !found.some(f => f.src === s.src)) {
          found.push({ type: 'video', src: s.src, duration: 'Source' });
        }
      });
    });

    // 2. Audio
    document.querySelectorAll('audio').forEach(a => {
      const src = a.currentSrc || a.src;
      if (src && !found.some(f => f.src === src)) {
        found.push({ type: 'audio', src: src, duration: a.duration ? `${Math.round(a.duration)}s` : 'Audio' });
      }
    });

    // 3. High-res Images (> 250px)
    document.querySelectorAll('img').forEach(img => {
      const src = img.currentSrc || img.src;
      if (src && (img.naturalWidth > 250 || img.naturalHeight > 250) && !found.some(f => f.src === src)) {
        found.push({
          type: 'image',
          src: src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          duration: `${img.naturalWidth}x${img.naturalHeight}`
        });
      }
    });

    return found;
  }

  function openLiveMediaScanner() {
    if (mediaScannerModal) {
      mediaScannerModal.remove();
      mediaScannerModal = null;
    }

    const items = scanAllPageMedia();

    mediaScannerModal = document.createElement('div');
    mediaScannerModal.id = 'brwsr-live-media-scanner';
    mediaScannerModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(4, 7, 13, 0.88);
      backdrop-filter: blur(14px);
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-sizing: border-box;
      padding: 24px;
      color: #f1f5f9;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 16px;
      margin-bottom: 20px;
    `;

    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `<h2 style="margin:0; font-size:18px; color:#06b6d4; font-weight:700; letter-spacing:0.5px;">🎥 LIVE MEDIA DETECTOR (${items.length} detected)</h2><span style="font-size:12px; color:#94a3b8;">Click any media card to download instantly or copy direct link</span>`;

    const btnRow = document.createElement('div');
    btnRow.style.cssText = `display:flex; gap:10px; align-items:center;`;

    const btnDownloadAll = document.createElement('button');
    btnDownloadAll.textContent = '⬇ Download All Media';
    btnDownloadAll.style.cssText = `
      background: #06b6d4;
      color: #041019;
      border: none;
      border-radius: 6px;
      padding: 8px 14px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    `;
    btnDownloadAll.addEventListener('click', () => {
      items.forEach(it => ipcRenderer.invoke('downloads:download-url', it.src));
      btnDownloadAll.textContent = `✓ Queued ${items.length} Downloads!`;
    });

    const btnClose = document.createElement('button');
    btnClose.textContent = '✕ Close (Esc)';
    btnClose.style.cssText = `
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 8px 14px;
      font-weight: 600;
      cursor: pointer;
      font-size: 12px;
    `;
    btnClose.addEventListener('click', () => {
      mediaScannerModal.remove();
      mediaScannerModal = null;
    });

    btnRow.appendChild(btnDownloadAll);
    btnRow.appendChild(btnClose);
    header.appendChild(titleDiv);
    header.appendChild(btnRow);
    mediaScannerModal.appendChild(header);

    // Grid Body
    const grid = document.createElement('div');
    grid.style.cssText = `
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      padding-bottom: 20px;
    `;

    if (items.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:60px 0; color:#64748b; font-size:14px;">No active HTML5 video, audio, or high-res images detected on this page yet.<br>Play a video or refresh the page to scan again.</div>';
    } else {
      items.forEach(it => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: #0e1422;
          border: 1px solid #1e293b;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          transition: transform 0.15s ease, border-color 0.15s ease;
        `;
        card.onmouseenter = () => { card.style.borderColor = '#06b6d4'; card.style.transform = 'translateY(-2px)'; };
        card.onmouseleave = () => { card.style.borderColor = '#1e293b'; card.style.transform = 'none'; };

        // Thumbnail / Preview
        const previewDiv = document.createElement('div');
        previewDiv.style.cssText = `height: 140px; background: #070a11; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;`;

        if (it.type === 'video') {
          const vid = document.createElement('video');
          vid.src = it.src;
          vid.style.cssText = `width:100%; height:100%; object-fit:cover;`;
          vid.muted = true;
          vid.onmouseenter = () => vid.play();
          vid.onmouseleave = () => vid.pause();
          previewDiv.appendChild(vid);
        } else if (it.type === 'image') {
          const img = document.createElement('img');
          img.src = it.src;
          img.style.cssText = `width:100%; height:100%; object-fit:cover;`;
          previewDiv.appendChild(img);
        } else {
          previewDiv.innerHTML = '<span style="font-size:36px;">🎵</span>';
        }

        // Tag pill
        const tag = document.createElement('span');
        tag.textContent = it.type.toUpperCase();
        tag.style.cssText = `
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(11, 15, 25, 0.85);
          color: #06b6d4;
          font-family: monospace;
          font-size: 10px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid rgba(6, 182, 212, 0.4);
        `;
        previewDiv.appendChild(tag);

        // Details & Action
        const bodyDiv = document.createElement('div');
        bodyDiv.style.cssText = `padding: 12px; display:flex; flex-direction:column; gap:8px; flex:1; justify-content:space-between;`;

        const urlText = document.createElement('div');
        urlText.textContent = it.src;
        urlText.title = it.src;
        urlText.style.cssText = `
          font-family: monospace;
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;

        const cardBtnRow = document.createElement('div');
        cardBtnRow.style.cssText = `display:flex; gap:6px;`;

        const dlCardBtn = document.createElement('button');
        dlCardBtn.textContent = '⬇ 1-Click Download';
        dlCardBtn.style.cssText = `
          flex: 1;
          background: #06b6d4;
          color: #041019;
          border: none;
          border-radius: 4px;
          padding: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        `;
        dlCardBtn.addEventListener('click', () => {
          ipcRenderer.invoke('downloads:download-url', it.src);
          dlCardBtn.textContent = '✓ Downloading...';
          setTimeout(() => { dlCardBtn.textContent = '⬇ 1-Click Download'; }, 2000);
        });

        const copyCardBtn = document.createElement('button');
        copyCardBtn.textContent = '📋 Copy';
        copyCardBtn.style.cssText = `
          background: #1e293b;
          color: #94a3b8;
          border: 1px solid #334155;
          border-radius: 4px;
          padding: 6px 10px;
          font-size: 11px;
          cursor: pointer;
        `;
        copyCardBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(it.src);
          copyCardBtn.textContent = '✓';
          setTimeout(() => { copyCardBtn.textContent = '📋 Copy'; }, 2000);
        });

        cardBtnRow.appendChild(dlCardBtn);
        cardBtnRow.appendChild(copyCardBtn);

        bodyDiv.appendChild(urlText);
        bodyDiv.appendChild(cardBtnRow);

        card.appendChild(previewDiv);
        card.appendChild(bodyDiv);
        grid.appendChild(card);
      });
    }

    mediaScannerModal.appendChild(grid);
    (document.body || document.documentElement).appendChild(mediaScannerModal);

    const onEsc = (e) => {
      if (e.key === 'Escape' && mediaScannerModal) {
        mediaScannerModal.remove();
        mediaScannerModal = null;
        document.removeEventListener('keydown', onEsc);
      }
    };
    document.addEventListener('keydown', onEsc);
  }

  /* -------------------------------------------------------------------------- */
  /* 8. IPC Handlers from Main Process                                         */
  /* -------------------------------------------------------------------------- */

  ipcRenderer.on('action:trigger-zapper', (e, state) => {
    toggleZapperMode(state);
  });

  ipcRenderer.on('action:trigger-unlock-scroll', () => {
    forceUnlockScroll();
  });

  ipcRenderer.on('action:trigger-dark-mode', (e, state) => {
    toggleDarkMode(state);
  });

  ipcRenderer.on('action:trigger-media-scanner', () => {
    openLiveMediaScanner();
  });

  ipcRenderer.on('action:rules-updated', (e, updatedRules) => {
    applyStoredRules(updatedRules);
  });

})();
