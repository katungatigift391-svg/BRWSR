# Contributing to BRWSR

Thank you for your interest in contributing to **BRWSR**. This document outlines the project architecture, development workflow, coding standards, and submission guidelines for external contributors.

---

## 🏛️ Architecture Overview

BRWSR is built on Electron using Chromium and Node.js with zero external tracking dependencies. The project is divided into four core components:

```
├── main.js             # Electron Main Process (Lifecycle, CDP, WebContentsView, IPC, Downloads)
├── preload.js          # ContextBridge layer between Main and Browser UI Shell
├── page-preload.js     # Early-injection script running inside navigated web pages
├── src/ui/
│   ├── index.html      # Browser chrome & drawer markup
│   ├── style.css       # Design tokens, cyber/slate dark theme
│   └── app.js          # Browser shell state controller & shortcut dispatch
└── .github/workflows/  # CI/CD multi-platform build & release automation
```

* **Process Isolation**: All web pages load inside isolated `WebContentsView` instances with sandbox constraints.
* **CDP Automation**: Low-level V8 execution controls (e.g., JavaScript freeze) interact directly with the Chrome DevTools Protocol.
* **Local Persistence**: User settings, history, bookmarks, and zapper selector rules are persisted locally to JSON files and are never synchronized over the network.

---

## 🛠️ Development Setup

### Prerequisites
* **Node.js**: `v20.x` or higher
* **npm**: `v10.x` or higher
* **Git**: `v2.x` or higher

### Local Installation
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/katungatigift391-svg/BRWSR.git
   cd BRWSR
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development browser:
   ```bash
   npm start
   ```

---

## 🌿 Branching Model & Workflow

The repository follows a standard `main` / `dev` branch workflow:

| Branch | Purpose |
| :--- | :--- |
| `main` | Production-ready releases. Only tagged version bumps are merged here. |
| `dev` | Active development branch. All feature branches and pull requests target `dev`. |
| `feature/<name>` | Dedicated topic branch for new capabilities or substantial refactors. |
| `fix/<name>` | Dedicated topic branch for bug fixes. |

### Commit Message Conventions
Commits should adhere to [Conventional Commits](https://www.conventionalcommits.org/):

* `feat: add stream format filtering to media detector`
* `fix: prevent native view occlusion on fullscreen toggle`
* `refactor: optimize CDP debugger attachment lifecycle`
* `docs: update keyboard shortcuts table`

---

## 📦 Building Distribution Packages

To generate standalone executables locally:

```bash
# Windows Installer & Portable Executable (.exe)
npm run build:win

# Linux AppImage & Debian Package
npm run build:linux
```

Build outputs will be placed in the `dist/` directory.

---

## 📋 Pull Request Checklist

Before submitting a Pull Request:

1. **Syntax & Verification**: Verify all JavaScript files pass static syntax validation:
   ```bash
   node -c main.js preload.js page-preload.js src/ui/app.js
   ```
2. **Zero Telemetry**: Ensure no tracking, telemetry hooks, or unrequested remote connections are introduced.
3. **Target Branch**: Ensure your Pull Request is opened against the `dev` branch.
4. **Documentation**: Update [README.md](README.md) or relevant docstrings if your change introduces new shortcuts, APIs, or configuration parameters.

---

## 🔒 Security & Vulnerability Reporting

If you discover a security issue or vulnerability in BRWSR, please report it responsibly via GitHub Security Advisories or by contacting the maintainers directly. Do not open public issues for sensitive security vulnerabilities.
