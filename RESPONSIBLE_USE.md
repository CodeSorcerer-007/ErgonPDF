# Responsible Use Policy

ErgonPDF is a sovereign, local-first document workspace providing 126 PDF tools that execute entirely in client memory via WebAssembly and HTML5 Canvas. Because ErgonPDF includes capabilities for permanent cryptographic redaction, metadata wiping, digital signature application, optical character recognition (OCR), password encryption, and structural alteration, it is essential that users employ these tools ethically and in compliance with applicable law.

---

## 1. Core Principles

1. **User Sovereignty & Data Privacy**: ErgonPDF never transmits document contents, metadata, or diagnostic telemetry to any remote cloud infrastructure. Your documents remain strictly inside your device's memory.
2. **Accountability**: Because processing occurs on your local machine without third-party moderation or cloud filtering, you remain exclusively responsible for the documents you create, modify, inspect, or redact.
3. **Integrity of Legal & Financial Records**: ErgonPDF's document manipulation features must never be used to falsify records, evade regulatory obligations, or mislead recipients.

---

## 2. Permitted Uses

You are encouraged to use ErgonPDF for:

- **Personal & Family Document Management**: Merging tax records, organizing utility bills, filling out medical intake forms, and password-protecting personal identity documents.
- **Enterprise & Business Workflows**: Assembling contracts, preparing saddle-stitch booklets, optimizing raster presentations, and generating multi-page N-Up printing sheets.
- **Privacy & Compliance Redaction**: Permanently stripping Social Security Numbers (SSNs), Protected Health Information (PHI), Credit Card Numbers (PCI-DSS), and proprietary trade secrets before public or judicial filing.
- **Healthcare & Legal Operations**: Processing medical charts under HIPAA guidelines and legal discovery briefs under strict Attorney-Client privilege without triggering third-party cloud data processing agreements (DPAs).
- **Academic & Archival Research**: Converting research papers to standardized PDF/A-1b archival formats, performing local OCR on scanned manuscripts, and extracting tabular data to CSV.
- **Air-Gapped & High-Security Computing**: Operating within offline SCIFs, defense environments, government intranets, or humanitarian field clinics where external network connections are strictly forbidden.

---

## 3. Prohibited Uses

You may **not** use ErgonPDF for any of the following activities:

- **Document Forgery & Fraud**: Altering dollar values, contractual clauses, signatures, audit trails, or notarization stamps on existing legal, financial, or academic instruments with the intent to deceive.
- **Circumventing Lawful Digital Rights Management (DRM)**: Stripping protection passwords from copyrighted commercial publications without authorization from the copyright holder.
- **Incomplete or Deceptive Redaction**: Misrepresenting cosmetic visual blackouts as true redactions. ErgonPDF provides true stream-level text removal; attempting to obfuscate text using superficial overlays in contexts where discovery law requires true redaction can violate judicial sanctions.
- **Automated Harassment or Malicious Document Generation**: Creating phishing documents disguised as invoices (ZUGFeRD/XRechnung abuse) or weaponized PDF exploit vectors designed to crash downstream readers.
- **Impersonating Authorized Signers**: Generating or forging digital signatures representing natural persons or legal entities without explicit written power of attorney.

---

## 4. Redaction Integrity & Legal Discovery

When preparing documents for public disclosure, FOIA requests, or judicial discovery:

- **True Stream Redaction**: ErgonPDF's Redact tool parses the underlying `/Contents` stream and strips the referenced glyphs and Unicode mappings, replacing them with blacked-out vector rectangles.
- **Verification Requirement**: Users must independently verify redacted output before public distribution by executing full-text selection (`Ctrl + A`) or using the Text Extraction tool to confirm that target strings are completely eradicated from the document stream.
- **Metadata Sanitization**: Always utilize the **Sanitize Metadata** tool in conjunction with redaction to eradicate embedded author identities, creation timestamps, title history, and editing software footprints.

---

## 5. Compliance Framework Alignment

| Framework | Alignment Mechanism in ErgonPDF |
| :--- | :--- |
| **HIPAA (Health Insurance Portability and Accountability Act)** | 100% Client-Side processing guarantees Protected Health Information (PHI) never enters external data transmission paths. No Business Associate Agreement (BAA) is required because no cloud transit exists. |
| **GDPR (General Data Protection Regulation)** | Absolute data sovereignty. Zero telemetry, zero analytics cookies, zero third-party scripts. No cross-border data transfer occurs. |
| **ISO 19005 (PDF/A Archival Standards)** | Generates standardized PDF/A compliant document structures for long-term document preservation. |
| **Attorney-Client & Work-Product Privilege** | Processing confidential discovery documents in client memory avoids waiver of privilege associated with third-party cloud ingest. |

---

## 6. Disclaimer of Legal & Advisory Warranties

ErgonPDF is provided as open-source software under the MIT License. It does not provide legal advice, forensic certification, or automated statutory compliance verification. Users are solely responsible for ensuring their usage meets jurisdictional court rules, archival mandates, and regulatory statutes.

---

© 2026 ErgonPDF Contributors · [MIT License](LICENSE)
