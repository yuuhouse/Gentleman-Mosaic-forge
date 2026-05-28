# Gentleman Mosaic v2.3.0

**Author**: leeprinxin  
**GitHub**: https://github.com/leeprinxin  
**License**: MIT

![Gentleman Mosaic Logo](./logo-Photoroom.png)

## UI Preview
![UI Demo](./UI.PNG)


### What's New in v2.3.0
- Fixed brush painting stopping when the brush moved outside the canvas.
- Adjusted UI scaling so 4K images can be viewed fully in the browser without zooming the page.
- Added batch download support for completed masked images.
- Tidied the folder structure to improve readability and reduce maintenance complexity.

### What's New in v2.2.0: 4K Performance Boost
- Optimized high-resolution editing for 4K and large images: rectangle selection, brush movement, and hover previews no longer repeatedly recompute the full image.
- Effect preview now uses dirty caching, so it refreshes only when selections, effect parameters, or image pixels actually change.
- Canvas redraws are throttled with `requestAnimationFrame`, making brush and selection feedback feel much smoother.
- Large-image history snapshots are capped automatically to keep Undo/Redo useful without letting memory usage spiral.
- Full-resolution export is preserved: smoother interaction, same output quality.

### What's New in v2.1.0
- Settings moved into a top-right icon panel (gear icon)
- Added About icon and converted About content into a modal dialog (`X` / backdrop / `Esc` to close)
- Language and Dark/Light preferences are now saved to `launch.ini` and restored on startup
- Added selection polarity toggle: Normal / Inverse
- Added selection operation toggle: Add / Subtract
- Added/clarified shortcuts: `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y` / `Ctrl+X`, and `Space + LMB drag`
- History restore fix: Undo/Redo now correctly restores pending selection overlays
- Mosaic algorithm tuned to better match [PEKO-STEP](https://www.peko-step.com/tool/imageeditor/index.php?lang=zhtw&type=19) style pixelation
- Improved image navigation with drag-to-pan viewport behavior
- Refined dark theme palette, especially a softer checker background in the center image viewport

### What's New in v2.0.0
- Batch image upload and image switching (up to 30 files)
- Per-image state persistence: pending regions and history (Undo/Redo)
- Thumbnail right-click menu: delete image, download processed output
- Thumbnail shortcuts: left click select, `Ctrl + Click` multi-select, `Shift + Click` range select, `Ctrl + A` select all
- NSFW auto-detection (NudeNet) with adjustable threshold and model switch (`320n` / `640m`)
- Effects: Mosaic and Nori bars (color, opacity, width, gap, direction)
- Selection modes: Rectangle and Brush (circle/square)
- Dark mode + Chinese/English UI switching

## Requirements
- Windows (with `.bat` startup flow)
- Python 3.9+ (3.10+ recommended)
- Internet access for first-time Python dependency installation

## Install & Start (Recommended)

### One-Click Startup (Standalone)
1. Open the project root folder.
2. Make sure these files exist: `start_app.bat`, `launch.ini`, `standalone.html`.
3. Double-click `start_app.bat`.
4. The script will read config, create `.venv`, install dependencies, start backend API, and open `standalone.html`.

### Main `launch.ini` Settings
```ini
[backend]
enabled=1
use_venv=1
venv_dir=.venv
create_venv=1
python_cmd=python
host=127.0.0.1
port=7400
reload=0
auto_install_deps=1
```

Notes:
- `port` is written to `runtime-config.js`; frontend uses it to connect backend.
- Set `enabled=0` to disable backend (manual redaction only).

## Development Mode (Standalone/Vite)
```bash
npm install
npm run dev
```

Open:
```text
http://localhost:5173/standalone.html
```

Note: the production feature set currently lives in `standalone.html`. `src/App.jsx` is an older/simplified React version and does not include batch editing, NSFW detection, Nori bars, language settings, or theme persistence.

### Build
```bash
npm run build
npm run preview
```

Deployment note: Hosted static services only deploy the frontend. NSFW auto-detection requires the local FastAPI backend launched by `start_app.bat`; the online frontend does not include that inference service by itself.

## Basic Workflow
1. Upload multiple images or drag files into the canvas area.
2. Select a target image from the thumbnail row.
3. Choose effect type (Mosaic / Nori).
4. Mark regions with rectangle or brush.
5. Click apply to process current pending regions.
6. Use Undo/Redo when needed.
7. Right-click thumbnail to delete or download processed image.

## Notes
- First startup may take longer due to Python package installation.
- If `python` is unavailable, update `python_cmd` in `launch.ini`.
- Batch upload limit is 30 images; extra files are skipped.
