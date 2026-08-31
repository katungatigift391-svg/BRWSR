# ⚡ BRWSR — Standalone Surgical DOM & Bypass Browser

[![Release](https://img.shields.io/badge/Release-Download%20v1.0.0-06b6d4?style=for-the-badge&logo=windows)](https://github.com/katungatigift391-svg/BRWSR/releases/latest)
[![Platform](https://img.shields.io/badge/Platform-Windows%20PC-8b5cf6?style=for-the-badge)](https://github.com/katungatigift391-svg/BRWSR/releases)
[![License](https://img.shields.io/badge/License-ISC-10b981?style=for-the-badge)](LICENSE)

A private, standalone browser built with **Electron (Chromium + Node.js)** and the **Chrome DevTools Protocol (CDP)** engineered specifically for live DOM deconstruction, continuous element vaporizing, dynamic video media downloading, true fullscreen playback, and zero-telemetry browsing.

---

## ⬇️ Public Downloads

Get the latest pre-compiled binaries from the **[GitHub Releases Page](https://github.com/katungatigift391-svg/BRWSR/releases/latest)**:

* 🪟 **[Windows Installer (Setup .exe)](https://github.com/katungatigift391-svg/BRWSR/releases/latest)** — Full installer with Desktop & Start Menu shortcuts.
* 📦 **[Windows Portable (.exe)](https://github.com/katungatigift391-svg/BRWSR/releases/latest)** — Standalone portable executable. Zero installation, zero registry writes.

---

## ⚡ Core Features

1. **🎬 True Fullscreen HTML5 Video Support**:
   - Seamlessly auto-hides the entire navigation chrome and toolbar when any HTML5 video player (YouTube, stream embeds) enters fullscreen mode (`F11` or player fullscreen toggle), giving 100% of the display to video playback.

2. **🎥 Dynamic 1-Click Media Download Button**:
   - Located directly next to the URL input bar.
   - Automatically illuminates with a pulsing cyan/emerald badge (`🎥 ⬇ 1 Video Detected`) the instant video or audio streams are detected on the active tab.
   - 1-Click direct download to your chosen folder without disruptive dialogs.

3. **⚙️ Settings Vault & Browsing History Toggle**:
   - Open **Settings (`⚙️`)** to toggle **Browsing History Recording ON/OFF**.
   - When disabled, zero URLs, page titles, or timestamps are recorded to `history.json`.
   - Customize your default download directory via native OS folder picker with 1-click reset.

4. **⚡ Continuous Multi-Zap Mode (`Ctrl+Shift+Z`)**:
   - Point, hover, and click to vaporize multiple nested overlays/banners in continuous succession.
   - Live bounding-box HUD shows selector details, tag name, and dimensions.
   - Automatically derives and saves persistent CSS selectors to [rules.json](file:///c:/Users/Giffa/Documents/pr/BRWSR/rules.json).

5. **⬇ Seamless Auto-Download Engine & Vault (`Ctrl+J`)**:
   - Background downloading without disruptive OS file-picker modal prompts.
   - Live progress indicator pill in the toolbar displaying real-time transfer speed (`2.4 MB/s`).
   - Slide-out **Downloads Vault** with speed meters, 1-click **Open File**, and native **Show in Explorer** integration.

6. **🔍 Floating Find in Page (`Ctrl+F`)**:
   - Native search with live match counters (`1/12`), Enter / Shift+Enter navigation, and highlight stepping.

7. **🕒 Private Browsing History (`Ctrl+H`)**:
   - Searchable local vault with instant real-time search filter and a 1-click **"Purge All"** button.

8. **⭐ 1-Click Local Bookmarks (`Ctrl+D`)**:
   - Star icon directly in the Omnibox to save favorite pages locally in [bookmarks.json](file:///c:/Users/Giffa/Documents/pr/BRWSR/bookmarks.json).

9. **🌙 Force Dark Mode (`Ctrl+Shift+D`)**:
   - High-contrast inverted dark mode injector for blinding light-themed websites.

10. **🔓 Scroll Unlocker & Backdrop Purge (`Ctrl+Shift+U`)**:
    - Instantly forces `overflow: auto !important` and clears backdrop blurs & full-screen modal containers.

11. **🛑 JS Execution Freeze (`Ctrl+Shift+F`)**:
    - Pauses the V8 JavaScript event loop via CDP `Debugger.pause` on the active tab without freezing page rendering.

12. **🕵️ One-Click Googlebot Spoofing**:
    - Switches User-Agent and Referer headers on the active tab to Googlebot to unlock crawler-accessible content.

13. **🔒 Hardened Anti-Telemetry & Isolation**:
    - Zero profile sharing with Chrome/Edge/Firefox.
    - Background telemetry, crash reporting (`breakpad`), and sync pings disabled at the Chromium engine level.
    - CSP (`Content-Security-Policy`) and `X-Frame-Options` headers stripped on demand.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + T`** | Open New Tab |
| **`Ctrl + W`** | Close Active Tab |
| **`Ctrl + L`** | Focus & Select Omnibox (URL bar) |
| **`Ctrl + R`** / **`F5`** | Reload Current Tab |
| **`Alt + Left`** / **`Alt + Right`** | Navigate Back / Forward |
| **`Ctrl + F`** | Open **Find in Page** search bar |
| **`Ctrl + J`** | Open **Downloads Vault** drawer |
| **`Ctrl + H`** | Open **Browsing History** drawer |
| **`Ctrl + D`** | **Bookmark** current page |
| **`Ctrl + Shift + M`** | Open **Live Media Detector & Downloader** |
| **`Ctrl + Shift + Z`** | Toggle **Continuous Multi-Zap Mode** |
| **`Ctrl + Shift + U`** | **Unlock Scroll** & purge modal backdrops |
| **`Ctrl + Shift + F`** | **Freeze / Resume JavaScript** Execution |
| **`Ctrl + Shift + D`** | Toggle **Force Dark Mode** |
| **`F11`** | Toggle **Full Screen Window** |
| **`F12`** | Open Chrome DevTools for the active tab |
| **`Escape`** | Exit Zapper / Close Media Scanner / Close Find |

---

## 🛠️ Developer Workspace & Quick Start

### 1. Launch Live Development Shell
```bash
npm start
# or double-click start.bat
```

### 2. Compile Windows Executable (.exe)
```bash
build.bat
# Produces dist/BRWSR Setup 1.0.0.exe and dist/BRWSR-Portable-1.0.0.exe
```

### 3. Git Branching Workflow
See [CONTRIBUTING.md](CONTRIBUTING.md) for full branch strategy (`main` vs `dev`) and automated GitHub Release publication.
