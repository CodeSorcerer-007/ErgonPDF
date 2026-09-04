# Security Policy

## Privacy & Security Model

ErgonPDF is architected with a **Zero-Server-Trust** local processing model.

1. **Client-Side Sandbox:** All core document manipulation (merging, splitting, rotating, watermarking, signing, and OCR) is executed in the user's browser client sandbox.
2. **Zero Default Storage:** ErgonPDF does not transmit, store, or log user document data to any centralized database.
3. **Defense Against Malicious PDFs:** All rendering is performed via sandboxed WebAssembly and HTML5 Canvas layers without native system execution permissions.

---

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

If you discover a security vulnerability within ErgonPDF, please do NOT file a public issue.

Instead, please send an advisory email to:
`security@ergonpdf.org`

Include:
- Type of issue (e.g., memory leak, malformed PDF crash, XSS vulnerability)
- Proof of concept or reproduction steps
- Affected browser or deployment environment

We will acknowledge receipt within 48 hours and work with you on a responsible disclosure timeline.
