# Setup Guide

Get the Typing Focus App running on your development machine.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **macOS** (primary target for MVP)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Typing-Focus-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify installation**
   ```bash
   node -v  # Should show v20+ or v22+
   npm -v   # Should show recent version
   ```

## Development Server

Start the development environment:

```bash
npm run dev
```

### Expected Results

- ✅ Vite dev server starts on `http://localhost:5173/`
- ✅ Electron window opens automatically (1200x800)
- ✅ Hot Module Replacement (HMR) enabled for React
- ✅ Auto-reload for Electron main process
- ✅ No compilation errors in terminal

### Console Output
```
➜  Local:   http://localhost:5173/
➜  ready in xxx ms
```

## Verification Checklist

### 1. App Window Opens
- [ ] Electron window appears (1200x800)
- [ ] Window is visible and focused
- [ ] No crash or immediate close

### 2. UI Content Loads
- [ ] "Draft Tree" header with gradient text
- [ ] Navigation buttons: "Dashboard View" and "Editor View"
- [ ] Main content area shows placeholder text
- [ ] Footer with version info
- [ ] Dark theme applied

### 3. Navigation Works
- [ ] Click "Editor View" → content changes
- [ ] Click "Dashboard View" → content changes
- [ ] No errors in console

### 4. Developer Tools
Open DevTools: **View → Toggle Developer Tools** or **Cmd+Option+I**

- [ ] No red error messages
- [ ] Info logs are acceptable (blue/gray)
- [ ] No "Failed to load" errors
- [ ] No React errors or warnings

### 5. Clean Shutdown
- [ ] Close window with **Cmd+Q** or red X
- [ ] Dev server stops cleanly
- [ ] No error messages on exit

## Troubleshooting

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### TypeScript Errors
```bash
npm run typecheck
```

### Blank Window
- Check browser console for errors
- Verify `src/renderer/src/App.tsx` exists
- Check network tab for failed resource loads

### Tailwind Issues
- Ensure Tailwind CSS v3 is installed: `npm list tailwindcss`
- Should show: `tailwindcss@3.4.18`

## Next Steps

Once setup is complete:

1. Read [Development Guide](./DEVELOPMENT.md) for daily workflow
2. Check [Testing Guide](./TESTING.md) for testing setup
3. Explore [Architecture Overview](../architecture/OVERVIEW.md)
4. Review [CONTRIBUTING.md](../../CONTRIBUTING.md) for coding standards

## Available Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run test          # Run all tests
npm run test:coverage # Run tests with coverage
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Run tests with UI interface
npm run lint          # Run ESLint
npm run format        # Run Prettier
npm run typecheck     # TypeScript type checking
```

---

**Happy coding!** 🚀
