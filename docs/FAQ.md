# Frequently Asked Questions (FAQ)

> Everything you need to know about ErgonPDF architecture, privacy guarantees, tools, and installation.

---

### General & Privacy

#### 1. What is ErgonPDF?
ErgonPDF is a comprehensive, open-source PDF workspace featuring 126 professional tools (100% PDF24 feature parity plus local AI Studio and duplex scanning). It performs page reorganization, digital signing, permanent vector redaction, watermarking, format conversions, OCR, compression, electronic invoicing, and repairs directly within your local machine.

#### 2. How does ErgonPDF differ from cloud tools like ILovePDF or SmallPDF?
Traditional online tools upload your files over the public internet to their remote cloud servers, process them there, and have you download the result. This exposes sensitive data to server storage, network interception, and compliance risks.

**ErgonPDF never uploads your files.** All processing is powered by WebAssembly and client-side JavaScript running in your browser's isolated sandbox. Your files never touch a remote server.

#### 3. Does ErgonPDF transmit any telemetry or usage metrics?
**No.** There are zero tracking scripts, telemetry agents, analytics pings, or marketing beacons. You can inspect the source code or monitor network traffic using your browser's Developer Tools (`F12`) to verify that no requests leave your machine.

#### 4. Can I use ErgonPDF completely offline?
**Yes.** Once loaded or installed via the 1-click Windows desktop installer, ErgonPDF operates 100% offline. You can disconnect your Wi-Fi or run ErgonPDF on air-gapped workstations without loss of functionality.

---

### Desktop App & Installation

#### 5. How do I install ErgonPDF on Windows?
1. Download or clone the repository to your PC.
2. Double-click `install-ergonpdf.bat` (or run `installer\install-ergonpdf.bat`).
3. The installer automatically detects Node.js, compiles the static build if needed, creates a Desktop shortcut with an icon, creates a Start Menu entry, and opens ErgonPDF in your default browser.
4. From then on, simply double-click the **ErgonPDF** shortcut on your Desktop!

#### 6. Is Node.js required to run the Windows installer?
Yes. The installer uses Node.js (version 18 or later) to host the lightweight local loopback server (`127.0.0.1:8096`) and build the static assets. If Node.js is not detected on your PATH, the installer will inform you and provide the download link.

#### 7. How do I stop or uninstall the local server?
- To stop the local background server: run `installer\stop-ergonpdf.bat`.
- To completely uninstall: run `installer\uninstall-ergonpdf.bat` (or `installer\uninstall.bat`). This removes Desktop and Start Menu shortcuts and cleans up runtime state files.

---

### Capabilities & Performance

#### 8. What is the maximum PDF file size ErgonPDF can handle?
Because ErgonPDF runs entirely inside your browser's memory, file capacity is determined by your computer's available RAM. In general:
- Files under **100 MB** process almost instantaneously.
- Large files up to **500 MB** (or 2,000+ pages) process smoothly on modern systems with 8GB+ RAM.
- For extremely large files (1GB+), closing other browser tabs can free up additional memory.

#### 9. How does the Redaction tool work? Is redacted content permanently removed?
Yes. Unlike visual overlay tools that merely paint a black rectangle over text (leaving underlying selectable characters intact), ErgonPDF's redaction engine burns the blackout layer into the document structure and strips underlying text streams across the redacted bounding boxes, preventing copy-paste extraction.

#### 10. What encryption standards does ErgonPDF use for password protection?
ErgonPDF uses standard Adobe-compatible **AES-256** and **AES-128** encryption via Web Crypto primitives, allowing you to set both User Passwords (to open the document) and Owner Passwords (to restrict printing, copying, and editing).

#### 11. Does ErgonPDF support Optical Character Recognition (OCR)?
Yes! ErgonPDF incorporates **Tesseract.js** (WebAssembly). It inspects scanned PDFs or image-based pages, detects text characters with confidence scoring, and lets you copy or export searchable text directly. The neural model weights are cached locally for offline reuse.

#### 12. How does the Booklet / N-Up Imposition tool work?
- **2-Up / 4-Up Imposition**: Arranges multiple consecutive document pages onto a single sheet of paper (e.g., placing pages 1 and 2 side-by-side on an A4/Letter page).
- **Saddle-Stitch Booklet**: Reorders and pairs pages so that when double-sided printed and folded in half, the pages read sequentially like a physical booklet or magazine.

#### 13. Can ErgonPDF convert PDFs to editable Word or Excel documents?
Yes:
- **PDF to Word**: Extracts text blocks, paragraphs, and headings and produces standard `.docx` documents.
- **PDF to Excel**: Analyzes tabular bounding boxes and converts recognized data matrices into clean `.xlsx` / `.csv` spreadsheets.

---

### Licensing & Compliance

#### 14. Is ErgonPDF free for commercial and business use?
**Yes.** ErgonPDF is licensed under the permissive **MIT License**. You can freely use it for commercial projects, internal company workflows, government operations, and academic research without royalty or restriction.

#### 15. Is ErgonPDF suitable for HIPAA, GDPR, or confidential legal documents?
**Yes.** Because zero data is transmitted over the internet or stored on third-party infrastructure:
- **HIPAA**: Medical records never touch a cloud service, eliminating BAA requirements.
- **GDPR**: You retain full data sovereignty as processing occurs exclusively on your endpoint.
- **Attorney-Client Privilege / NDAs**: Meets strict data confinement mandates.

#### 16. What web browsers are officially supported?
ErgonPDF is compatible with all modern evergreen browsers supporting WebAssembly and ES2022:
- Google Chrome (version 100+)
- Mozilla Firefox (version 100+)
- Microsoft Edge (version 100+)
- Brave, Opera, Vivaldi
- Apple Safari (macOS / iPadOS 16.4+)

#### 17. How can I contribute or report an issue?
We welcome community contributions! Please check our [CONTRIBUTING.md](../CONTRIBUTING.md) and [docs/CONTRIBUTING_DETAILED.md](CONTRIBUTING_DETAILED.md) guides. For bug reports or feature suggestions, submit an issue on our [GitHub Issues page](https://github.com/CodeSorcerer-007/ErgonPDF/issues).
