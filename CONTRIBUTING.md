# Contributing to BRWSR

## 🛠️ Developer Workspace & Environment

BRWSR is built with **Electron (Node.js + Chromium + Chrome DevTools Protocol)** for Windows and Desktop OSes.

---

## 🌿 Git Branching Strategy

We follow a strict **Dev → Main** release flow:

```
main        ← Stable, production-ready code. Tagged releases (v1.0.0, v1.1.0) only.
dev         ← Active daily development branch. All feature work lands here first.
feature/*   ← Optional isolated branches for larger features.
```

### Daily Development Loop

1. Checkout `dev`:
   ```bash
   git checkout dev
   ```
2. Start the local live development shell:
   ```bash
   npm start
   # or double-click start.bat
   ```
3. Test changes live without compiling.
4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: description of changes"
   git push origin dev
   ```

---

## 🚀 Releasing a New PC Version

When you are ready to publish a new update for public download:

1. **Merge `dev` into `main`**:
   ```bash
   git checkout main
   git merge dev
   ```

2. **Bump version & tag**:
   ```bash
   # Bump version (e.g. 1.0.0 -> 1.0.1 or 1.1.0)
   npm version patch   # or 'npm version minor'

   # Push main with the new tag
   git push origin main --tags
   ```

3. **Automatic Cloud Release**:
   * Pushing the `v*` tag triggers the [GitHub Actions Release Workflow](.github/workflows/release.yml).
   * It builds the Windows installer `.exe` and the standalone portable `.exe`.
   * Automatically publishes them to your [GitHub Releases](https://github.com/katungatigift391-svg/BRWSR/releases) page for 1-click user downloads.

4. **Local Windows Build (Optional)**:
   * Run `build.bat` locally to compile `.exe` files into the `dist/` directory.
