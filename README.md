# Draft Tree

A minimalist writing app built with Electron, React, and TypeScript. Write without distractions with beautiful animations that respond to your typing.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **macOS** (primary target for MVP)
- **npm** (comes with Node.js)

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

This will open the Electron app with:
- Hot Module Replacement (HMR) for the React renderer
- Auto-reload for the Electron main process

## Build

Build the application for production:

```bash
npm run build        # Build only
npm run build:mac    # Build macOS app
npm run build:win    # Build Windows app
npm run build:linux  # Build Linux app
```

## Testing

Run tests with Vitest (unified test framework for all layers):

```bash
npm run test         # Run all tests
npm run test:coverage # Run tests with coverage report
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI interface
```

## Other Commands

```bash
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run typecheck    # TypeScript type checking
```

## Project Structure

```
src/
├── main/           # Electron main process (Node.js)
├── preload/        # Preload scripts (context bridge)
└── renderer/       # React application (frontend)

tests/              # All tests (unit, integration, and future E2E)
├── main/          # Main process tests
├── preload/       # Preload script tests
├── renderer/      # Renderer process tests
└── setup.ts       # Global test setup
```

## Documentation

📚 **[View All Documentation](./docs/README.md)** - Complete documentation index

**Quick Links:**
- 🚀 [Getting Started Guide](./docs/setup/STARTUP.md) - Verify your setup
- 🏗️ [Project Structure](./docs/architecture/STRUCTURE.md) - Understand the codebase
- 🔌 [API Usage Guide](./docs/architecture/PRELOAD_API_USAGE.md) - Use the Electron API

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, coding standards, and workflow.

## License

MIT License - see [LICENSE](./LICENSE) file for details.
