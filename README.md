# Draft Tree

A minimalist writing app built with Electron, React, and TypeScript. Write without distractions with beautiful animations that respond to your typing progress.

https://github.com/user-attachments/assets/1d2de2cf-b930-440f-989e-ab454001c3f8

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

📚 **[View All Documentation](./docs/README.md)** - Complete documentation hub

**Quick Links:**
- 🚀 [Setup Guide](./docs/getting-started/SETUP.md) - Get started with development
- 🏗️ [Architecture Overview](./docs/architecture/OVERVIEW.md) - Understand the system design
- 📋 [User Stories](./docs/user-stories/USER_STORIES.md) - Feature requirements and acceptance criteria
- 🎯 [Product Goals](./docs/project/PRODUCT_GOALS.md) - Core product vision and objectives

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, coding standards, and workflow.

## License

MIT License - see [LICENSE](./LICENSE) file for details.
