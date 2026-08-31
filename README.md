# ⚡ BRWSR

<p align="center">
  <strong>A standalone, privacy-hardened surgical browser engineered for DOM deconstruction, continuous element vaporizing, dynamic media sniffing, and zero host telemetry.</strong>
</p>

<p align="center">
  <a href="https://github.com/katungatigift391-svg/BRWSR/releases/latest"><img src="https://img.shields.io/badge/Release-Download%20v1.0.0-06b6d4?style=for-the-badge&logo=windows" alt="Latest Release"></a>
  <img src="https://img.shields.io/badge/Platform-Windows%20PC-8b5cf6?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Electron-v33.4-0284c7?style=for-the-badge&logo=electron" alt="Electron">
  <img src="https://img.shields.io/badge/License-ISC-10b981?style=for-the-badge" alt="License">
</p>

---

## Overview

**BRWSR** is an open-source, desktop browser designed for developers, security researchers, and power users who require absolute control over the web runtime. Built upon **Electron**, Chromium, and the **Chrome DevTools Protocol (CDP)**, BRWSR isolates web pages from host telemetry while providing real-time in-page DOM manipulation, background video/audio stream interception, and persistent rule management.

---

## ⚡ Key Capabilities

* **Continuous Multi-Zap Engine (`Ctrl+Shift+Z`)**  
  Point, hover, and vaporize consecutive modal gates, paywall overlays, and sticky obstructions in real time. Automatically generates and persists minimal CSS selector rules across sessions.

* **Dynamic Stream Sniffer & 1-Click Downloader**  
  An illuminated toolbar indicator dynamically detects playing video, audio, and HLS media streams on the active page, enabling instant one-click downloading to your designated folder without modal prompts.

* **Live In-Page Media Inspector (`Ctrl+Shift+M`)**  
  Scans all HTML5 `<video>`, `<audio>`, and high-resolution assets on the active page with hover-to-preview video cards, resolution metadata, and batch download capabilities.

* **Zero-Telemetry Hardening**  
  Chromium crash reporting (`breakpad`), background network pinging, domain reliability monitors, and telemetry sync services are permanently disabled at the engine flag level. User history, bookmarks, and zapper rules remain strictly in local JSON files.

* **True Fullscreen Video Playback**  
  Automatically hides the entire top navigation chrome and view offsets during HTML5 video fullscreen events (`F11` or in-player fullscreen), dedicating 100% of the screen estate to media.

* **V8 JavaScript Runtime Freeze (`Ctrl+Shift+F`)**  
  Pauses and resumes the page's V8 script execution loop on demand via CDP `Debugger.pause`, freezing timers and anti-tamper scripts while preserving CSS animations and DOM rendering.

* **Scroll & Backdrop Restorer (`Ctrl+Shift+U`)**  
  Purges inline `overflow: hidden`, backdrop blur filters, and fixed cover containers to restore native page scrolling.

* **Googlebot Header Spoofing**  
  Toggles crawler User-Agent and Referer headers on demand to evaluate crawler-accessible page versions.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + T`** | Open New Tab |
| **`Ctrl + W`** | Close Active Tab |
| **`Ctrl + L`** | Focus and select Omnibox |
| **`Ctrl + R`** / **`F5`** | Reload Current Tab |
| **`Alt + Left`** / **`Alt + Right`** | Navigate Backward / Forward |
| **`Ctrl + F`** | Open **Find in Page** search bar |
| **`Ctrl + J`** | Open **Downloads Vault** drawer |
| **`Ctrl + H`** | Open **Browsing History** drawer |
| **`Ctrl + D`** | Toggle **Bookmark** on active page |
| **`Ctrl + Shift + M`** | Open **Live Media Scanner** overlay |
| **`Ctrl + Shift + Z`** | Toggle **Continuous Multi-Zap Mode** |
| **`Ctrl + Shift + U`** | **Unlock Scroll** and purge backdrops |
| **`Ctrl + Shift + F`** | **Freeze / Resume JavaScript** Execution |
| **`Ctrl + Shift + D`** | Toggle **Force Dark Mode** |
| **`F11`** | Toggle **Full Screen Window** |
| **`F12`** | Toggle Chrome DevTools on active page |
| **`Escape`** | Exit Zapper Mode / Close Media Overlay / Close Find Bar |

---

## 📥 Installation & Downloads

Pre-built binaries for Windows are available on the **[Releases Page](https://github.com/katungatigift391-svg/BRWSR/releases/latest)**:

* **Installer (`.exe`)**: Standard NSIS installer with desktop shortcut and uninstaller.
* **Portable (`.exe`)**: Single standalone executable requiring zero installation or registry modification.

---

## 🛠️ Building From Source

### Prerequisites
* [Node.js](https://nodejs.org/) (version 20.x or higher)
* Git

### Quickstart
```bash
# Clone repository
git clone https://github.com/katungatigift391-svg/BRWSR.git
cd BRWSR

# Install dependencies
npm install

# Launch browser in development mode
npm start
```

### Packaging Binaries
```bash
# Build Windows Installer and Portable executable
npm run build:win

# Build Linux AppImage and Debian package
npm run build:linux
```
Compiled artifacts are output to the `dist/` directory.

---

## 📜 Contributing & Architecture

For detailed architecture diagrams, branch guidelines, and pull request procedures, please review [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
