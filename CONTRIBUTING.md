# Contributing to Reright

Thank you for your interest in contributing to Reright!

## Before you start

To ensure your contribution can be accepted:

- **Bug fixes**: Feel free to submit a PR directly. Please include a clear description of the bug and how your fix addresses it.
- **New features**: **Please open an issue or discussion first** to propose your idea before writing code. This helps avoid duplicate work and ensures the feature aligns with the project's direction.
- **Documentation improvements**: Always welcome! Submit PRs directly.

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Rust** (latest stable version)
- **Tauri prerequisites** for your platform:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites#setting-up-linux)
  - **Windows**: See [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites#setting-up-windows)

## Getting started

1. **Fork the repository** 

2. **Clone your fork**:

```bash
git clone https://github.com/YOUR_USERNAME/reright.git
cd reright
```

3. **(Optional) Add the upstream remote** to keep your fork in sync:

```bash
git remote add upstream https://github.com/jmacedoit/reright.git
```

4. **Install dependencies**:

```bash
npm install
```

5. **Run in development mode**:

```bash
npm run tauri:dev
```

This starts the app in development mode with hot-reloading enabled for the UI.

## Development workflow

- **UI and application logic** (TypeScript/React) is in `src/`
- **Tauri integration** (Rust) is in `src-tauri/src/`
- **Tests** are in `tests/`

To run tests:

```bash
npm test
```

To check for linting issues:

```bash
npm run lint
```

To build for production:

```bash
npm run tauri:build
```

## Submitting changes

1. **Create a branch** for your changes:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** and test thoroughly
3. **Ensure code quality**:
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed
4. **Commit your changes** with clear, descriptive messages
5. **Push to your fork** and submit a pull request

## Code style

- The project uses **ESLint** for JavaScript/TypeScript linting
- Follow existing patterns and conventions in the codebase
- Write clear, self-documenting code with comments where necessary
- Keep functions focused and modular

## Questions or issues?

- **Found a bug?** [Open an issue](https://github.com/jmacedoit/reright/issues/new) or submit a fix directly
- **Have a feature idea?** [Start a discussion](https://github.com/jmacedoit/reright/discussions) **before** writing code
- **Need help?** Check existing issues or discussions, or open a new one

Thank you for contributing to Reright! 🎉

