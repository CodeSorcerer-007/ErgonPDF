# Security Policy

ErgonPDF is developed under a zero-server-trust architecture. All document operations execute strictly within the client browser environment using WebAssembly and Web Workers. This policy defines our vulnerability handling procedures, disclosure protocols, and security guarantees.

---

## Security and Privacy Guarantees

1. **Client-Side Isolation**: All PDF processing, OCR analysis, cryptographic operations, and rendering take place in the local browser runtime. Document buffers and extracted text are never transmitted to external servers.
2. **Zero Centralized Storage**: ErgonPDF does not maintain servers, databases, or cloud buckets for storing user documents, metadata, or activity logs.
3. **Execution Sandbox**: File rendering and parsing rely on sandboxed WebAssembly and HTML5 Canvas APIs, preventing local filesystem access or unauthorized system execution.
4. **Header Hardening**: Production deployments enforce strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and restrictive Permissions-Policy headers to mitigate cross-site scripting (XSS) and iframe clickjacking.

---

## Supported Versions

Security updates and vulnerability patches are actively provided for the following releases:

| Version Branch | Supported | Security Maintenance Status |
| :--- | :--- | :--- |
| 1.2.x | Yes | Current stable release branch |
| 1.1.x | Limited | Critical security fixes only |
| < 1.1.0 | No | Unsupported; upgrade to 1.2.x recommended |

---

## Reporting a Security Vulnerability

If you identify a security vulnerability, architectural flaw, or potential data leak in ErgonPDF, do not open a public GitHub issue.

Please report vulnerabilities through one of the following secure channels:

1. **GitHub Private Vulnerability Reporting**:
   Navigate to the repository's **Security** tab, select **Advisories**, and click **Report a vulnerability**. This allows coordinated discussion in a private forum.

2. **Security Contact Email**:
   Send an encrypted or plain-text email to:
   `security@ergonpdf.org`

### Required Information
To help us triage and resolve the issue quickly, include:
- A descriptive summary of the vulnerability (e.g., Cross-Site Scripting, Buffer Overflow, Untrusted Stream Injection, Malformed PDF Parsing Crash).
- Step-by-step reproduction instructions or a minimal proof-of-concept file.
- The affected component, file path, or engine function.
- Deployment environment details (browser name and version, operating system, Docker container version).
- An assessment of the potential impact on user confidentiality or application integrity.

---

## Vulnerability Handling Timeline

- **Initial Acknowledgement**: Within 48 hours of receipt.
- **Triage and Impact Assessment**: Within 5 business days of confirmation.
- **Patch Development & Testing**: Prioritized based on severity (Critical: < 7 days; Moderate: < 14 days).
- **Public Disclosure**: Coordinated with the reporter following release of a patched version, typically within 30 to 60 days of the initial report.
