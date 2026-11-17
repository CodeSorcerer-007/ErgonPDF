# ErgonPDF Developer Workflows & Build Recipes
# Modeled after VoiceBox and CodexOS production standards
# Install: cargo install just (or choco install just / winget install just)
# Usage: just --list

# Shell selection: use PowerShell on Windows
set windows-shell := ["powershell", "-NoProfile", "-Command"]

# Default recipe: show available commands
default:
    @just --list

# Full project setup & dependency installation
setup:
    npm install
    @Write-Host "ErgonPDF development environment is ready."

# Launch Vite development server with hot module replacement
dev:
    npm run dev

# Compile TypeScript and generate optimized production bundle
build:
    npm run build

# Run fast linter (oxlint)
lint:
    npm run lint

# Run strict TypeScript typecheck
typecheck:
    npx tsc -b

# Comprehensive QA: lint + typecheck + test + benchmark
check: lint typecheck test benchmark
    @Write-Host "All ErgonPDF QA gates passed successfully!"

# Run full test suite (Feature integrity + HTTP Smoke tests)
test: test-features smoke

# Run PDF Engine 25-feature integrity test suite
test-features:
    npm run test-features

# Run 168-endpoint HTTP and UI route smoke test
smoke:
    npm run smoke-test

# Run performance and memory efficiency benchmark suite
benchmark:
    node scripts/calculate-accuracy-and-efficiency.js

# Install ErgonPDF as native Windows Desktop application
install-windows:
    cmd /c .\install.bat

# Launch installed or local ErgonPDF desktop instance
launch:
    cmd /c .\launch.bat

# Stop background ErgonPDF local loopback daemon
stop:
    cmd /c .\installer\stop-ergonpdf.bat

# Update local repository and synchronize desktop installation
update:
    cmd /c .\update.bat

# Uninstall ErgonPDF desktop application and remove shortcuts
uninstall-windows:
    cmd /c .\uninstall.bat

# Register Windows Explorer context menu handlers
context-menu-install:
    reg import scripts\register-context-menu.reg
    @Write-Host "Windows Explorer context menu registered successfully."

# Remove Windows Explorer context menu handlers
context-menu-uninstall:
    reg import scripts\unregister-context-menu.reg
    @Write-Host "Windows Explorer context menu removed successfully."

# Package standalone Windows distribution archive
package:
    node scripts/package-windows-installer.cjs

# Audit tools registry and route coverage
audit-tools:
    node scripts/audit-tools.js

# Start preview server for production build
preview:
    npm run preview

# Clean build artifacts and temporary files
clean:
    if (Test-Path dist) { Remove-Item -Recurse -Force dist }
    if (Test-Path node_modules/.vite) { Remove-Item -Recurse -Force node_modules/.vite }
    @Write-Host "Build artifacts cleaned."
