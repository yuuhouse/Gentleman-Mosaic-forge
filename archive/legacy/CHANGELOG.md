# Change Log

## [2.3.0] - 2026-05-28

### Fixed
- Fixed brush painting stopping when the brush moved outside the canvas.

### Added
- Added batch download support for completed masked images.

### Changed
- Adjusted UI scaling so 4K images can be viewed fully without browser zoom.
- Tidied project folder structure for better readability and maintenance.

## [2.2.0] - 2026-05-25

### Performance
- Optimized 4K/high-resolution image editing by caching effect previews instead of recomputing the full preview on every mouse movement.
- Throttled interactive canvas redraws with `requestAnimationFrame` for smoother brush, rectangle, hover, and selection feedback.
- Added adaptive history limits for large images to reduce memory pressure while keeping Undo/Redo available.
- Preserved full-resolution export quality while reducing interactive editing lag.

### Changed
- Clarified that `standalone.html` is the production feature surface, while `src/App.jsx` is an older simplified React implementation.
- Unified local backend configuration around port `7400`.
- Pinned backend dependency ranges to reduce breakage from future major package updates.

## [2.1.0] - 2026-04-01

### Added
- About feature upgraded to a modal dialog with multiple close methods (`X`, backdrop click, and `Esc`).
- UI settings persistence API endpoints (`GET/POST /ui-settings`) for language and theme.
- Selection polarity toggle support (`normal` / `inverse`).
- Selection operation toggle support (`add` / `subtract`).
- Keyboard shortcuts and interaction hints: `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y`, `Ctrl+X`, and `Space + LMB drag`.

### Changed
- Updated project version metadata to `v2.1.0` across UI badge, package manifest, and documentation.
- Moved language/theme controls into a compact top-right settings icon panel.
- Improved viewport navigation to support drag-to-pan image viewing.
- Mosaic algorithm adjusted to better align with [PEKO-STEP](https://www.peko-step.com/tool/imageeditor/index.php?lang=zhtw&type=19)-style pixelation behavior.
- Reworked dark theme palette with a softer checkerboard background in the central image viewport.

### Fixed
- Improved INI parsing compatibility by handling UTF-8 BOM (`utf-8-sig`) in `launch.ini` reads.
- Fixed history restore so pending selection overlays are correctly recovered during Undo/Redo.

## [2.0.0] - 2026-03-31

### Added
- Batch image upload workflow (up to 30 files) with thumbnail list, quick switching, and per-image state isolation.
- Thumbnail context menu (right-click): delete image and download processed image.
- Thumbnail selection shortcuts:
  - Left click to select
  - `Ctrl + Click` multi-select
  - `Shift + Click` range-select
  - `Ctrl + A` select all
- NSFW auto-detection integration (NudeNet backend endpoint), including:
  - Adjustable threshold in UI
  - Model switch support (`320n`, `640m`)
- Nori redaction effect with configurable:
  - Color
  - Opacity
  - Stripe width
  - Stripe gap
  - Direction (horizontal / vertical)
- Brush shape options for manual masking:
  - Circle
  - Square
- Multi-language docs split:
  - `README.md` (default Chinese entry)
  - `README.zh.md`
  - `README.en.md`

### Changed
- UI top layout refactor: first-row status block and upload/menu block aligned into the same row.
- README structure updated to a language-switch entry model, with Chinese as default.
- Project version metadata updated to `v2.0.0` across UI and package manifest.

### Fixed
- Fixed intermittent canvas rendering bug where images could appear overlapped after switching between batch items.
- Fixed unexpected canvas cropping by synchronizing canvas dimensions with restored image state.
- Added async image-load race guard to prevent late image responses from overriding the current view.

## [1.0.0] - 2026-03-31

### Added
- Initial standalone image redaction tool UI.
- Core redaction workflows:
  - Rectangle selection
  - Brush selection
  - Mosaic effect
  - Basic export
- Undo/redo and history panel baseline.
- Light/dark theme support and Chinese/English UI switching.

### Changed

### Fixed
