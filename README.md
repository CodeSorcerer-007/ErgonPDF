<p align="center">
  <img src="public/favicon.svg" alt="ErgonPDF Logo" width="80" height="80" />
</p>

<h1 align="center">ErgonPDF</h1>

<p align="center">
  <strong>The Open-Source, Privacy-First All-in-One PDF Workspace.</strong><br>
  <em>Organize, edit, compress, sign, convert, and understand documents with zero server uploads and lightning-fast local performance.</em>
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#why-ergonpdf">Philosophy</a> •
  <a href="#quickstart">Quickstart</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#self-hosting">Self-Hosting</a> •
  <a href="#contributing">Contributing</a> •
  <a href="LICENSE">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Processing-100%25%20Local-10b981?style=flat-square" alt="100% Local" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker" alt="Docker Ready" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
</p>

---

## 🌟 Why ErgonPDF?

Most online PDF utilities force you to surrender your sensitive contracts, tax records, and medical files to third-party servers, queue up behind artificial rate limits, or suffer intrusive advertisements. 

**ErgonPDF changes that.**

Built on the principle: **"Build for the user, not for the engineer."**

1. 🔒 **100% Client-Side Privacy:** PDF operations, page mutations, digital signatures, local OCR, and heuristic intelligence execute in your browser via WebAssembly & Web Workers.
2. ⚡ **Zero Friction:** No account required. No countdown timers. No paywalls. Drag your file and start working instantly.
3. 🎨 **World-Class Aesthetic:** Designed with a human-centered design system, dark obsidian / light slate modes, crisp fluid typography, and delightful micro-interactions.
4. 🧠 **AI & Document Intelligence:** Instant executive summaries, key highlights, action items, dates extraction, and chat with your document using exact page navigation references.

---

## 🛠️ Key Capabilities

| Category | Tools & Features | Processing |
| :--- | :--- | :--- |
| **Organize** | Merge PDFs, Split & Extract Ranges, Visual Page Reordering, 90°/180°/270° Rotation, Page Deletion, Duplication, Reverse | 100% Local |
| **Compress** | Maximum (~70%), Balanced (~50%), High Quality (~25%) presets, live size reduction metrics ("18.4 MB → 4.2 MB (77% smaller)") | 100% Local |
| **Sign & Fill** | Smooth digital signature drawing, stylized cursive fonts, PNG signature upload, interactive page positioning & scaling | 100% Local |
| **Security** | Password protection, AES encryption, permissions restrictions (copy/print), metadata scrubber / sanitization | 100% Local |
| **Redact** | Permanent visual blackout redactions flattening vector data underneath | 100% Local |
| **Convert** | High-DPI PDF to PNG/JPEG/WebP export, multi-image photos to PDF builder, raw text extractor | 100% Local |
| **Pages** | Custom text/image watermarks with angle and opacity controls, formatted page numbers (headers/footers) | 100% Local |
| **OCR & Scan** | In-browser Tesseract Web Worker OCR to extract searchable text from scanned PDFs | 100% Local |
| **Compare** | Side-by-side visual document comparison with synchronized page navigation | 100% Local |
| **Batch Queue** | Parallel multi-file compressor, image converter, and watermarking with instant ZIP download | 100% Local |
| **AI Studio** | Classification (Contracts, Invoices, Papers, Resumes), Executive Summaries, Action Items, Flashcards, Chat with PDF | Local / BYO API |

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (Node 22 or 24 recommended)
- npm or pnpm

### Running Locally

```bash
# 1. Clone repository
git clone https://github.com/ergonpdf/ergonpdf.git
cd ergonpdf

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🐳 Self-Hosting with Docker

You can self-host ErgonPDF in your home lab, company intranet, or cloud VPS with a single command:

```bash
docker compose up -d
```

ErgonPDF will be accessible at `http://localhost:8080`.

To change port or customize settings, adjust `docker-compose.yml` or set `PORT=3000` in `.env`.

---

## 🏗️ Architecture

```
                                  +-----------------------+
                                  |   Browser Client      |
                                  |   (React 19 + Vite)   |
                                  +-----------------------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v                                                 v
          +-----------------------+                         +----------------------+
          |  Universal Workspace  |                         |  Command Palette ⌘K  |
          |  (Canvas + Overlays)  |                         |  (Intent Router)     |
          +-----------------------+                         +----------------------+
                     |                                                 |
                     +------------------------+------------------------+
                                              |
                                              v
                         +------------------------------------------+
                         |      PDF Engine Service (Worker/WASM)    |
                         |  - pdf-lib (in-memory DOM & encryption)  |
                         |  - pdfjs-dist (canvas rasterization)     |
                         |  - tesseract.js (client Web Worker OCR)  |
                         |  - jszip (batch archive packaging)       |
                         +------------------------------------------+
```

---

## 🔌 Tool Plugin Architecture

Adding a new PDF tool takes under 5 minutes without touching core workspace logic:

```bash
npm run create-tool grayscale-pdf
```

Or register it directly in `src/config/toolsRegistry.ts`:

```typescript
{
  id: "grayscale-pdf",
  name: "Grayscale PDF",
  description: "Convert color documents into clean monochrome",
  category: "compress",
  iconName: "Palette",
  intents: ["grayscale", "black and white", "mono"],
  processingMode: "local"
}
```

---

## 🤝 Contributing

We welcome contributions from the community! See [CONTRIBUTING.md](CONTRIBUTING.md) for full development guidelines, code standards, and PR workflows.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewPDFTool`)
3. Commit your Changes (`git commit -m 'Add NewPDFTool'`)
4. Push to the Branch (`git push origin feature/NewPDFTool`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<p align="center">
  Built with obsession for details by the ErgonPDF community.
</p>
