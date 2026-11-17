# ErgonPDF Beta Feedback & Bug Report Template

Thank you for testing ErgonPDF! Please use this template when reporting bugs, performance regressions, or usability feedback.

---

> 🔒 **PRIVACY NOTICE — DO NOT ATTACH SENSITIVE DOCUMENTS**:
> ErgonPDF never receives your documents, and our development team does NOT want your confidential files.
> - **DO NOT** attach real legal contracts, medical records, financial statements, or documents containing PII/PHI.
> - **DO** reproduce issues using synthetic PDFs (e.g. from `public/samples/`) or redact sample files before sharing.
> - **DO** scrub local usernames (`C:\Users\<YourName>\...`) from any pasted console logs.

---

## 1. Issue Overview

- **Title / Summary**: [Short descriptive summary of the issue]
- **Severity**: [P0 - Blocker | P1 - Critical | P2 - Major | P3 - Minor | P4 - Enhancement]
- **Affected Tool**: [e.g., Merge PDF, Redact PDF, Booklet Creator, OCR, AI Studio, etc.]
- **ErgonPDF Version**: [e.g., v1.2.0 (check footer or .ergon_runtime.json)]

---

## 2. Environment Details

- **Operating System**: [e.g., Windows 11 23H2 (x64), Windows 10, macOS 14 Sonoma, Ubuntu 24.04]
- **Browser & Version**: [e.g., Chrome 124.0, Edge 124.0, Firefox 125.0, Brave]
- **Deployment Mode**: [ ] Windows 1-Click Desktop Installer | [ ] Local Dev (`npm run dev`) | [ ] Docker Intranet | [ ] Web Preview
- **Document Specs**:
  - File Size: [e.g., 4.2 MB]
  - Page Count: [e.g., 34 pages]
  - Document Source: [e.g., Scanned scanner output, Word export, Adobe InDesign export, Unknown]

---

## 3. Steps to Reproduce

1. Open ErgonPDF.
2. Select tool: `[Tool Name]`.
3. Upload/drop test PDF: `[describe sample file characteristics]`.
4. Configure options: `[e.g., Margins: Small, Rotation: 90 degrees]`.
5. Click `[Action Button]`.

---

## 4. Expected Behavior

[Describe clearly what you expected to happen.]

---

## 5. Actual Behavior

[Describe what actually occurred, including any visible error toasts or UI freeze.]

---

## 6. Console Error Trace (Sanitized)

Press `F12`, switch to the **Console** tab, copy relevant error traces, and ensure personal paths are scrubbed:

```text
[Paste sanitized console errors here]
```

---

## 7. Additional Context & Proposed Fix (Optional)

[Any additional observations or suggested solutions.]
