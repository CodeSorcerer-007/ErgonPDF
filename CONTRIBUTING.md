# Contributing to ErgonPDF

Thank you for your interest in contributing to ErgonPDF.

ErgonPDF is an open-source, client-side document processing suite designed with a zero-server-upload privacy guarantee. Whether submitting bug fixes, adding new document operations, improving accessibility, or authoring documentation, your contributions help advance private, hardware-efficient document processing.

---

## Architecture and Design Principles

When designing and submitting contributions, adhere to these core architectural requirements:

1. **Client-Side Execution**: All document manipulation, page rendering, cryptographic operations, and metadata extraction must execute locally within the browser runtime using WebAssembly, Web Workers, and HTML5 Canvas. Never transmit document byte buffers to external servers.
2. **Deterministic Processing**: Document transformations must yield repeatable, spec-compliant output adhering strictly to PDF standards (ISO 32000-1 and PDF/A ISO 19005).
3. **Memory Safety and Resource Cleanup**: Explicitly clean temporal object URLs via `URL.revokeObjectURL()`, dispose of canvas contexts, and release Web Worker threads to prevent memory leaks during multi-page or batch processing.
4. **Design System Consistency**: Use standard design tokens defined in `src/index.css` for typography, color palette, spacing, and border radii.
5. **Accessibility**: All interactive elements must support keyboard navigation, appropriate ARIA roles, descriptive accessible names, and visible focus indicators.

---

## Development Workflow

### Prerequisites
- Node.js version 18 or higher (Node 20 or 22 LTS recommended)
- npm version 9 or higher

### Initial Setup

1. Fork the repository on GitHub:
   ```bash
   git clone https://github.com/<your-username>/ErgonPDF.git
   cd ErgonPDF
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   The local application will be available at `http://localhost:5173`.

---

## Branching Model

Create a dedicated branch for each feature or bug fix. Use standard prefix conventions:

- `feat/<feature-name>`: New document tools, engine capabilities, or UI features.
- `fix/<bug-name>`: Bug fixes and error handling improvements.
- `docs/<description>`: Documentation additions, updates, and clarifications.
- `chore/<task-name>`: Build scripts, dependency updates, and maintenance.
- `refactor/<scope>`: Code refactoring without behavior modification.

Example:
```bash
git checkout -b feat/add-page-labels
```

---

## Coding Standards

### TypeScript
- Strict mode is enforced across the entire codebase (`"strict": true` in `tsconfig.json`).
- Explicit type annotations are required for function arguments, return values, and public class members.
- The use of `any` is prohibited except where interfacing with third-party untyped library boundaries.
- All new engine methods must be stateless and static within `PDFEngineService`.

### Code Quality and Linting
ErgonPDF uses `oxlint` for high-speed static code analysis:
```bash
npm run lint
```
The codebase must pass with zero errors and zero warnings.

### Build Verification
Verify compilation and Rollup bundling before submitting changes:
```bash
npm run build
```
The build step executes `tsc -b && vite build` and must exit with code 0.

### Automated Test Verification
Run the automated engine feature suite and smoke tests:
```bash
npm run test-features
npm run smoke-test
```
All feature tests and smoke endpoints must pass with 100% success.

---

## Commit Message Standards

Commit messages must follow the Conventional Commits specification:

```text
<type>(<scope>): <short description>

[optional body explaining rationale and trade-offs]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new feature or user-facing capability.
- `fix`: A bug fix.
- `docs`: Documentation modifications only.
- `style`: Changes that do not affect code semantics (formatting, whitespace).
- `refactor`: Code refactoring that neither fixes a bug nor adds a feature.
- `perf`: Performance optimizations.
- `test`: Adding or correcting tests.
- `chore`: Build process, tooling, or dependency updates.

### Examples
- `feat(engine): add dynamic QR code stamping on arbitrary pages`
- `fix(workspace): resolve memory leak in canvas thumbnail rendering`
- `docs: update ARCHITECTURE.md with engine method signatures`

---

## Pull Request Guidelines

1. **Keep Pull Requests Focused**: Limit each pull request to a single logical change or feature. Avoid bundling unrelated refactorings.
2. **Verify All Checks Pass Locally**:
   - `npm run lint` exits with 0 warnings and 0 errors.
   - `npm run build` compiles without TypeScript or Rollup errors.
   - `npm run test-features` reports 100% pass rate.
3. **Include Rationale**: Describe the user problem solved, implementation decisions, and any edge cases evaluated.
4. **No Emojis**: Documentation, commit messages, and PR descriptions must maintain a professional tone without emoji characters.

---

## Adding a New Document Tool

To integrate a new tool into ErgonPDF:

1. **Register the Tool**: Add a new tool entry to `src/config/toolsRegistry.ts` defining its unique `id`, `name`, `description`, `iconName`, `category`, and search `intents`.
2. **Implement Engine Logic**: Add the corresponding static processing method to `src/services/pdfEngine.ts` utilizing `pdf-lib` or `pdfjs-dist`.
3. **Create the Tool Panel Component**: Create `src/components/workspace/<ToolName>Tool.tsx` and export it in `src/components/workspace/index.ts`.
4. **Connect the Workspace**: Wire the component in `src/components/UniversalWorkspace.tsx` to handle parameter states and trigger execution via `handleExportPDF`.
5. **Add Automated Feature Tests**: Append an end-to-end verification test to `scripts/test-features.js`.
