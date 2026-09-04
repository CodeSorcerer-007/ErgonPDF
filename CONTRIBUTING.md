# Contributing to ErgonPDF

Thank you for your interest in contributing to ErgonPDF! 

ErgonPDF is designed to be an open-source, privacy-first, community-driven PDF workspace. Whether you're fixing a bug, adding a new document tool, improving accessibility, or writing documentation, we welcome your contributions.

---

## 🧭 Guiding Design Principle

> **"Build for the user, not for the engineer."**

When contributing new features:
1. **Never expose raw PDF technical jargon** unless requested in an advanced mode.
2. **Prioritize client-side processing:** Keep document manipulation local to the browser whenever technically feasible.
3. **Keep interactions effortless:** Minimize user clicks and decisions. Provide sensible smart defaults.
4. **Maintain visual consistency:** Use the shared design system tokens and component primitives.

---

## 🛠️ Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/ergonpdf.git
   cd ergonpdf
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```

4. **Verify TypeScript and build correctness:**
   ```bash
   npm run build
   ```

---

## 🔌 Adding a New PDF Tool

1. **Run the tool generator:**
   ```bash
   node scripts/create-tool.js <tool-slug>
   ```

2. **Register the tool in `src/config/toolsRegistry.ts`:**
   Define human-friendly metadata and natural language query triggers for intent discovery.

3. **Implement processing logic in `src/services/pdfEngine.ts`:**
   Use `pdf-lib` for document mutations or `pdfjs-dist` for page rendering.

4. **Test with sample PDFs:**
   Verify the tool functions properly across multi-page, single-page, and rotated documents.

---

## 📜 Pull Request Guidelines

- Ensure `npm run build` succeeds cleanly without any TypeScript errors.
- Follow existing code formatting and naming conventions.
- Keep commits atomic and informative.
- Describe the user problem solved in your pull request description.
