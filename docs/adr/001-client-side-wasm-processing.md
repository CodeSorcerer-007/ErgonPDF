# ADR 001: 100% Client-Side WebAssembly Processing vs Remote Cloud Ingestion

**Status:** `ACCEPTED`  
**Date:** November 2026  
**Deciders:** ErgonPDF Core Architecture Team  
**Consulted:** System Architects, Cryptography & Privacy Engineers  

---

## Context

Most popular online PDF services (ILovePDF, SmallPDF, Adobe Acrobat Web) operate on a client-server architecture: users upload multi-megabyte PDF files to remote cloud servers where Python, Go, or C++ backends execute the document transformation and stream the modified file back to the browser.

This paradigm exhibits severe foundational drawbacks:
1. **Critical Privacy & Compliance Risk**: Confidential legal instruments, medical histories (HIPAA), tax records, and NDA-protected business plans traverse public networks and reside on third-party disks.
2. **Network Bandwidth & Latency Tax**: Uploading and downloading a 50MB PDF over standard internet connections consumes 5–15 seconds, creating high latency and bandwidth overhead.
3. **Infrastructure & Hosting Costs**: Sustaining server CPU, RAM, and bandwidth requires monetizing users through subscriptions, paywalls, file-size caps, or advertising trackers.

Alternative local solutions (such as PDF24 Desktop) exist as closed-source proprietary Windows executables, while server-side self-hosted solutions (like Stirling-PDF) demand complex Docker configurations, WSL2, or Linux administration.

---

## Decision

ErgonPDF adopts an uncompromising, non-negotiable architectural invariant:
> **100% Client-Side Execution**: Every document transformation, page split, OCR recognition pass, rasterization, redaction, and encryption operation must execute strictly inside client device memory via WebAssembly (WASM) and HTML5 Canvas.
>
> Zero document bytes, metadata, or diagnostic telemetry may ever leave the client device.

All processing logic is packaged into static JavaScript and WebAssembly bundles (`pdf-lib`, `pdfjs-dist`, `Tesseract.js`, `WebCrypto`).

---

## Consequences

### Positive
- **Absolute Privacy**: Impossible for server-side data breaches to compromise user documents, since no server exists to breach.
- **Air-Gapped & Offline Ready**: ErgonPDF operates flawlessly with Wi-Fi disabled or in high-security SCIF defense environments.
- **Instantaneous Latency**: Operations execute at memory speed (typically 10–50 ms) without network transit bottlenecks.
- **Zero Hosting Costs**: The application can be served via static file servers, GitHub Pages, or local loopbacks with zero compute overhead.
- **HIPAA & GDPR Compliance**: No Data Processing Agreements (DPAs) or Business Associate Agreements (BAAs) required because no third-party data processing occurs.

### Negative & Mitigations
- **Client Resource Dependency**: Processing massive documents (1,000+ pages or 500MB+) is bounded by client device RAM.  
  *Mitigation*: We implement chunked page stream parsing and lazy thumbnail rasterization to maintain a peak memory footprint under 200MB.
- **Initial Bundle Size**: Downloading the static bundle (including PDF.js and Tesseract WASM weights) requires ~2MB for core tools and ~15MB if OCR is activated.  
  *Mitigation*: Assets are aggressively cached by browser service workers and local storage after the first load.
