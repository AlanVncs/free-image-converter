# Free Image Converter

A free image converter that runs **entirely in the browser**. No files are uploaded to servers — all decoding, conversion, and downloads happen locally on the user's device.

Repository: [github.com/AlanVncs/free-image-converter](https://github.com/AlanVncs/free-image-converter)

## Table of contents

- [Features](#features)
- [Supported formats](#supported-formats)
- [How to use](#how-to-use)
- [Browser requirements](#browser-requirements)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Development](#development)
- [Build and preview](#build-and-preview)
- [Architecture](#architecture)
- [Internationalization](#internationalization)
- [Bug reports](#bug-reports)
- [License](#license)

## Features

- Batch conversion of multiple images at once
- Select one or more output formats per conversion
- Drag and drop or click to select files
- Preview each file before conversion
- Download files individually or all at once as a ZIP
- Light, dark, or system theme
- Interface in Brazilian Portuguese and English
- Privacy by design: zero server uploads

## Supported formats

| Type | Formats |
|------|---------|
| **Input** | PNG, JPG, WEBP, AVIF, GIF, BMP, ICO, SVG, and HEIC |
| **Output** | PNG, JPG, WEBP, AVIF, GIF, BMP, and ICO |

### Special behavior

- **Animated GIF:** only the first frame is used during conversion
- **ICO:** automatically resized to a maximum of 256px (aspect ratio preserved)
- **HEIC:** tries native browser decoding; falls back to the `heic2any` library if needed
- **SVG:** accepted as input (rendered via the Canvas API), but not available as an output format
- **AVIF (output):** requires browser support for `canvas.toBlob('image/avif')`

## How to use

1. Select one or more target formats at the top of the page
2. Upload one or more images (drag and drop or click)
3. Wait for each file preview to load
4. Click **Convert**
5. Download files individually or all at once as a ZIP

## Browser requirements

- Support for `createImageBitmap` and `canvas.toBlob`
- **AVIF** output requires a recent browser:
  - Chrome 85+
  - Firefox 93+
  - Safari 16+

## Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 19, TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Components | Radix UI (dropdown), Lucide (icons) |
| i18n | i18next + react-i18next |
| Specialized encoding | `gifenc` (GIF), `fast-bmp` (BMP), `heic2any` (HEIC) |
| Batch download | JSZip |
| Lint | Oxlint |

## Project structure

```
free-image-converter/
├── public/                 # Static assets (favicon, icons)
├── src/
│   ├── components/         # React UI components
│   │   └── ui/             # Reusable primitives (dropdown)
│   ├── hooks/              # Custom hooks (theme, meta tags)
│   ├── lib/                # Conversion logic and utilities
│   │   ├── convertImage.ts # Orchestrates decode → canvas → encode
│   │   ├── decodeImage.ts  # Loads ImageBitmap (includes HEIC)
│   │   ├── encodeImage.ts  # Encodes canvas to each selected output format
│   │   ├── formats.ts      # Accepted format definitions
│   │   ├── heic.ts         # HEIC detection and decoding
│   │   ├── downloadFiles.ts
│   │   └── theme.ts
│   ├── locales/            # Translations (pt-BR, en)
│   ├── types/              # TypeScript types
│   ├── App.tsx             # Root component and main flow
│   ├── i18n.ts             # Internationalization setup
│   └── main.tsx            # Entry point
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Development

### Prerequisites

- Node.js 20+ (recommended)
- npm

### Install and run

```bash
git clone git@github.com:AlanVncs/free-image-converter.git
cd free-image-converter
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` (default port).

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Type-check (`tsc`) + production build |
| `npm run preview` | Local preview of the production build |
| `npm run lint` | Static analysis with Oxlint |

## Build and preview

```bash
npm run build
npm run preview
```

Production files are output to `dist/` and can be served by any static host (GitHub Pages, Netlify, Vercel, etc.).

## Architecture

The conversion flow has three stages:

```
File
    ↓  decodeImage.loadImageBitmap()
ImageBitmap
    ↓  Canvas 2D (drawImage)
HTMLCanvasElement
    ↓  encodeImage.encodeCanvas() (per selected format)
Blob(s) (output format(s))
```

- **Lossy formats** (JPG, WEBP, AVIF): encoded via `canvas.toBlob` at quality 0.92
- **Library-backed formats** (GIF, BMP, ICO): dedicated encoders loaded dynamically
- **ICO:** internal PNG wrapped in ICO format, with prior resizing

The UI tracks each file's state (`loading` → `ready` → `converting` → `done` / `error`) and revokes object URLs when files are removed or the component unmounts.

## Internationalization

Supported languages: `pt-BR` and `en`.

- Translation files: `src/locales/pt-BR.json` and `src/locales/en.json`
- Automatic detection from browser preference (pt → pt-BR, otherwise → en)
- Preference persisted in `localStorage` (`language`)

## Bug reports

This project does not accept code contributions. If you find a bug, please [open an issue on GitHub](https://github.com/AlanVncs/free-image-converter/issues/new).

Include as much detail as possible:

1. **Description** of the problem
2. **Steps to reproduce**
3. **Expected** vs. **actual** behavior
4. **Browser and version** (e.g. Firefox 128, Safari 17)
5. **File format(s)** involved (e.g. HEIC → AVIF)
6. **Screenshot** or error message, if available

Well-described issues are much easier to investigate. Thank you!

## License

This project does not yet include a license file. Contact the maintainer before reusing the code in derivative projects.
