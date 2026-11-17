# ErgonPDF Architecture Decision Records (ADRs)

This directory documents key architectural decisions made during the design, development, and evolution of **ErgonPDF**.

Each record follows the standard Michael Nygard ADR format:
- **Title**: Numbered sequential identifier and descriptive name.
- **Status**: `PROPOSED`, `ACCEPTED`, `REJECTED`, `DEPRECATED`, or `SUPERSEDED`.
- **Context**: The engineering challenge, trade-offs, and operational constraints.
- **Decision**: The selected technical strategy and architectural blueprint.
- **Consequences**: Positive, negative, and neutral ramifications.

---

## Index of Architecture Decision Records

| ADR | Title | Status | Date | Primary Subject |
| :--- | :--- | :---: | :---: | :--- |
| [**001**](001-client-side-wasm-processing.md) | 100% Client-Side WebAssembly Processing vs Remote Cloud Ingestion | `ACCEPTED` | 2026-11 | Zero-Exfiltration Privacy Invariant |
| [**002**](002-dual-pdf-engine-pdflib-pdfjs.md) | Dual-Engine Architecture: pdf-lib for Mutation, PDF.js for Rendering | `ACCEPTED` | 2026-11 | Engine Decoupling & Stability |
| [**003**](003-zero-cloud-heuristic-nlp-engine.md) | In-Memory Heuristic NLP Assistant vs Remote Cloud LLMs | `ACCEPTED` | 2026-11 | Privacy-Preserving Document Intelligence |
| [**004**](004-native-webcrypto-aes256-encryption.md) | Native WebCrypto Primitives & Standard PDF AES-256 Encryption | `ACCEPTED` | 2026-11 | Client-Side Cryptographic Hardening |
| [**005**](005-stateless-loopback-windows-installer.md) | Zero-Dependency Localhost Static Loopback Daemon for Windows Desktop | `ACCEPTED` | 2026-11 | Desktop Installer & Native Integration |
| [**006**](006-centralized-tools-registry-universal-workspace.md) | Centralized Single-Source Tool Registry & Universal Workspace Pattern | `ACCEPTED` | 2026-11 | 126-Tool Modularity & Maintainability |
