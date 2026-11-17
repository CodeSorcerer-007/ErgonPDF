# Testing Strategy & Automated Quality Gates

ErgonPDF employs a strict 4-tier testing hierarchy to guarantee engine integrity, UI responsiveness, routing accuracy, and absolute privacy compliance.

---

## 1. Test Suite Architecture

| Test Tier | Scope & Tool | Target | Execution Command |
| :--- | :--- | :--- | :--- |
| **Tier 1: Static Analysis** | Oxlint (`oxlint`) | Code style, syntax, security anti-patterns | `npm run lint` |
| **Tier 2: Static Typing** | TypeScript (`tsc -b`) | Strict static type validation | `npm run typecheck` |
| **Tier 3: Feature Integrity** | Engine Feature Suite (`test-features.js`)| 25 core PDF mutation and security algorithms | `npm run test-features` |
| **Tier 4: Smoke Test Suite** | HTTP & UI Routes (`smoke-test.js`) | 168 HTTP endpoints, static assets, and 126 UI tool routes | `npm run smoke-test` |
| **Tier 5: Benchmarking** | Accuracy & Latency (`calculate-accuracy-and-efficiency.js`) | 16 precision checks, heap allocation, operations/sec | `npm run benchmark` |

---

## 2. Running Automated Tests

### Comprehensive Verification One-Liner
To execute all quality gates in sequence:
```bash
npm run check
# Or using just:
just check
```

### Running Individual Suites
```bash
# Tier 1: Linting
npm run lint

# Tier 2: TypeScript typecheck
npm run typecheck

# Tier 3: PDF Engine Features (25 tests)
npm run test-features

# Tier 4: Comprehensive Local Smoke Test (168 tests)
npm run smoke-test

# Accuracy & Latency Benchmarks (16 accuracy + 18 latency tests)
npm run benchmark
```

---

## 3. PDF Engine Feature Integrity Suite (`test-features.js`)

The feature suite runs headless via Node.js using in-memory PDF synthesis:
- **Imposition Tests:** `halvePages`, `nUpImposition`, `createBooklet`
- **Security Tests:** `encryptDocument` (AES-256), `unlockDocument`, `applyRedactions` (text erasure)
- **Document Manipulation:** `mergeDocuments`, `splitDocument`, `compressDocument`, `webOptimize`, `repairDocument`
- **Conversions:** `convertToPdfA`, `convertToWordDoc`, `extractTablesToCSV`

---

## 4. Comprehensive Smoke Test Suite (`smoke-test.js`)

The smoke test boots a temporary preview server and asserts:
1. **Network Layer:** GET, HEAD, 404 behavior, SPA fallback routes.
2. **Security Headers:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
3. **Traversal Defenses:** Directory traversal attempts (`/..%2f..%2fpackage.json`) return 404.
4. **Service Smoke Calls:** In-memory execution of core methods with valid and invalid inputs.
5. **Tool Route Coverage:** Confirms all 126 registered tools in `toolsRegistry.ts` resolve to mounted workspace tabs or modal dialogs.
