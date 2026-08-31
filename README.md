# ⚡ BRWSR

<p align="center">
  <strong>The Standalone, Privacy-Hardened Surgical Browser for Live DOM Deconstruction, Element Vaporizing & Stream Downloading.</strong>
</p>

<p align="center">
  <a href="https://github.com/katungatigift391-svg/BRWSR/releases"><img src="https://img.shields.io/badge/Pre--Release-v1.0.0--preview-06b6d4?style=for-the-badge&logo=github" alt="Pre-Release v1.0.0"></a>
  <img src="https://img.shields.io/badge/Platform-Windows%20PC-8b5cf6?style=for-the-badge&logo=windows" alt="Platform">
  <img src="https://img.shields.io/badge/Status-Active%20Preview-10b981?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/License-ISC-f59e0b?style=for-the-badge" alt="License">
</p>

> 💡 **Early Preview Notice**: BRWSR is currently in active pre-release development (`v1.0.0-preview`). Features, bypass heuristics, and performance improvements are being continuously refined. **Community feedback, site compatibility reports, and feature requests are warmly encouraged!**

---

## ⚡ What is BRWSR?

**BRWSR** is a high-performance desktop browser engineered for developers, power users, and privacy purists. Built from the ground up on **Electron**, **Chromium**, and the **Chrome DevTools Protocol (CDP)**, BRWSR gives you total, uninterrupted control over the web runtime — bypass aggressive modal blockers, vaporize intrusive overlays with persistent rules, intercept live video streams with 1-click downloads via **yt-dlp**, and enjoy zero telemetry logging.

---

## 🚀 Quick Download & Usage Guide

### Option A: Using the Pre-Built Release (No Setup Required)
Grab the latest build from the **[GitHub Releases Page](https://github.com/katungatigift391-svg/BRWSR/releases)**:

1. **📦 Portable Edition (`BRWSR-Portable-1.0.0.exe`)** *(Recommended)*:
   * **Zero Installation**: Download the single `.exe` file anywhere (Desktop, Downloads, or USB drive).
   * Double-click to launch immediately. Leaves zero registry footprints.
2. **🪟 Full Installer (`BRWSR-Setup-1.0.0.exe`)**:
   * Standard Windows installer that adds BRWSR to your Start Menu and creates a Desktop shortcut.

---

### Option B: Building from Source (For Developers)
If you cloned or downloaded the source code repository:

#### Prerequisites
* [Node.js](https://nodejs.org/) (version 20.x or higher)
* Git

#### Step-by-step Setup
```bash
# 1. Clone the repository
git clone https://github.com/katungatigift391-svg/BRWSR.git
cd BRWSR

# 2. Install dependencies
npm install

# 3. Launch the browser in live dev mode
npm start
# (Windows users can also double-click start.bat)

# 4. Compile standalone Windows binaries (.exe)
npm run build:win
```
The compiled installer and portable executable will be placed in the `dist/` directory.

---

## ⚡ Key Capabilities

* **⚡ Continuous Multi-Zap Engine (`Ctrl+Shift+Z`)**  
  Vaporize persistent popups, consent walls, sticky banners, and obstruction layers in rapid succession. All underlying page clicks, links, and mouse events are strictly suppressed while targeting. Rules are automatically parsed and saved to local memory.

* **🎥 yt-dlp & Dynamic Media Sniffer Integration (`Ctrl+Shift+M`)**  
  A pulsing smart indicator illuminates directly next to the URL bar whenever video, audio, or HLS streams are detected on the page. Download direct streams with 1 click or open the Media Vault drawer to download site streams via **yt-dlp**.

* **🎬 In-Page Video Download Badge**  
  Hovering over any HTML5 `<video>` or `<audio>` element automatically reveals a 1-click download pill and copy button directly above the player.

* **🛑 V8 JavaScript Runtime Freeze (`Ctrl+Shift+F`)**  
  Pauses the active tab's V8 JavaScript engine via CDP `Debugger.pause`, freezing countdown timers, anti-adblock loops, and paywalls while maintaining full CSS animations and DOM rendering.

* **🎬 True Fullscreen Video Mode**  
  Automatically hides the browser navigation chrome and toolbar during fullscreen video playback (`F11` or HTML5 fullscreen toggle), providing a 100% immersive experience.

* **🔄 Built-In In-App Update Checker**  
  Open **Settings (`⚙️`)** anytime to check for new releases directly from GitHub and download updates with a single click.

* **🔒 Zero-Telemetry Sandbox**  
  Chromium crash reporting (`breakpad`), background network sync, domain reliability logging, and telemetry pings are permanently disabled at the engine flag level. History, bookmarks, and settings are saved strictly to local JSON vaults.

---

## 💬 Community Feedback & Reporting Issues

Since BRWSR is in active pre-release development, your direct feedback helps shape upcoming capabilities and resolve edge cases across different web platforms.

### 📬 Where to Share Your Feedback:
* 🐛 **Bug Reports & Broken Sites**: Open a ticket on our **[GitHub Issues Tracker](https://github.com/katungatigift391-svg/BRWSR/issues)** with the URL and what happened.
* 💡 **Feature Requests & Ideas**: Submit a feature proposal directly via **[GitHub Feature Requests](https://github.com/katungatigift391-svg/BRWSR/issues/new?title=[Feature+Idea]+)**.
* ⚙️ **Direct In-App Feedback**: Open **Settings (`⚙️`)** in the browser toolbar and click **"🐛 Report an Issue"** or **"💡 Feature Ideas"** to jump directly to the submission page.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| **`Ctrl + T`** | Open New Tab |
| **`Ctrl + W`** | Close Active Tab |
| **`Ctrl + L`** | Focus & select URL bar |
| **`Ctrl + R`** / **`F5`** | Reload Current Tab |
| **`Alt + Left`** / **`Alt + Right`** | History Back / Forward |
| **`Ctrl + F`** | Find in Page search |
| **`Ctrl + J`** | Open **Downloads Vault** drawer |
| **`Ctrl + H`** | Open **Browsing History** drawer |
| **`Ctrl + D`** | Bookmark active page |
| **`Ctrl + Shift + M`** | Open **Media Stream Sniffer** drawer |
| **`Ctrl + Shift + Z`** | Toggle **Continuous Multi-Zap Mode** |
| **`Ctrl + Shift + U`** | **Unlock Scroll** & purge modal backdrops |
| **`Ctrl + Shift + F`** | **Freeze / Resume JavaScript** Execution |
| **`Ctrl + Shift + D`** | Toggle **Force Dark Mode** |
| **`F11`** | Toggle Full Screen Window |
| **`F12`** | Toggle Chrome DevTools |
| **`Escape`** | Exit Zapper / Close Overlays |

---

## 📜 Changelog & Contributing

* Review the [CHANGELOG.md](CHANGELOG.md) for version release notes.
* Review [CONTRIBUTING.md](CONTRIBUTING.md) for the Git branch model (`main` vs `dev`) and architecture guide.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
