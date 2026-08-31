# Changelog

All notable changes to the **BRWSR** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0-preview] - 2026-08-31

### 🚀 Initial Public Pre-Release

#### ⚡ Core Engine & DOM Surgical Suite
* **Continuous Multi-Zap Mode (`Ctrl+Shift+Z`)**: Point-and-click overlay vaporizing with strict mouse/click event isolation, automated CSS selector derivation, and persistent rule storage in `rules.json`.
* **V8 JavaScript Runtime Freeze (`Ctrl+Shift+F`)**: CDP-level `Debugger.pause` interception to freeze page scripts and anti-inspect loops without interrupting rendering.
* **Scroll Lock & Modal Purge (`Ctrl+Shift+U`)**: Restores native scrolling and clears backdrop blurs and fixed obstruction layers.
* **Googlebot Spoofing**: One-click crawler user-agent and referer headers injection.
* **Force Dark Mode (`Ctrl+Shift+D`)**: High-contrast inverted dark mode for light-themed web pages.

#### 🎥 Media Sniffing & yt-dlp Downloader
* **yt-dlp Engine Integration**: Integrated background process runner for yt-dlp with real-time transfer progress and speed tracking in the downloads list.
* **Dynamic Stream Sniffer**: Real-time media sniffer illuminating beside the Omnibox whenever audio or video streams (`.mp4`, `.m3u8`, `.mpd`, `.webm`) are captured.
* **Media Stream Sniffer Drawer (`Ctrl+Shift+M`)**: Slide-out vault listing all captured audio/video streams with 1-click yt-dlp downloading and clipboard copying.
* **In-Page Video Download Badge**: Hover pill on `<video>` and `<audio>` elements for instant stream capture and downloading.
* **Zero-Modal Auto-Save Engine (`Ctrl+J`)**: Background downloading with customizable destination directories.

#### 🎬 Window & View Management
* **Definitive Menu Bar Removal**: Three-layer suppression (`Menu.setApplicationMenu(null)` during and after `app.whenReady()`, plus `setMenuBarVisibility(false)`).
* **True Fullscreen Video Playback**: Automatically hides the navigation chrome and resets view offsets when web videos enter fullscreen mode (`F11` or player toggle).
* **Native Occlusion Prevention**: Dynamic layout calculations ensure native `WebContentsView` layers never overlap surgical decks or slide-out drawers.
* **Integrated Control Deck**: Push-down expandable surgical strip (`⚡ SURGICAL DECK ▾`).

#### 🔒 Privacy & Architecture
* **Zero Host Telemetry**: Engine-level disabling of Chromium crash reporting (`breakpad`), background network sync, domain reliability logging, and telemetry pings.
* **Local Data Vaults**: User history, bookmarks, settings, and zapped rules are stored exclusively in local JSON files.
* **In-App Update Checker**: Integrated GitHub Release version verification with 1-click download prompts.
