# 🚀 Startup Verification Checklist

Follow these steps to verify your Focus Writer setup is working correctly.

## Prerequisites

- ✅ Node.js 20+ installed
- ✅ macOS (recommended for MVP)
- ✅ Repository cloned

## Step 1: Install Dependencies

```bash
npm install
```

### Expected Result:
- ✅ Command completes without errors
- ✅ No `npm ERR!` messages
- ✅ `node_modules/` directory created
- ✅ `package-lock.json` updated

**If this fails:** Check Node.js version with `node -v`

---

## Step 2: Start Development Server

```bash
npm run dev
```

### Expected Result:
- ✅ Vite dev server starts
- ✅ Console shows: `VITE v7.x.x ready in xxx ms`
- ✅ Electron main process compiles successfully
- ✅ No compilation errors in terminal

**Console Output Should Include:**
```
➜  Local:   http://localhost:5173/
➜  ready in xxx ms
```

---

## Step 3: Electron Window Opens

### Expected Result:
- ✅ Electron window appears automatically
- ✅ Window size is 1200x800
- ✅ Window is visible and focused
- ✅ No crash or immediate close

**If window doesn't open:** Check terminal for Electron errors

---

## Step 4: React Content is Visible

### Expected Result:
- ✅ Window displays "Focus Writer" header (gradient text)
- ✅ Two navigation buttons visible: "Dashboard View" and "Editor View"
- ✅ Main content area shows "Dashboard - Coming Soon"
- ✅ Footer shows version info (Electron, Chromium, Node versions)
- ✅ Dark theme is applied (gray background)

**Visual Checklist:**
- [ ] Header with gradient "Focus Writer" text
- [ ] Navigation buttons (Dashboard View, Editor View)
- [ ] Content area with placeholder text
- [ ] Footer with version numbers

---

## Step 5: Console Shows No Errors

Open DevTools: **View → Toggle Developer Tools** or press **Cmd+Option+I** (macOS)

### Expected Result in Console:
- ✅ No red error messages
- ✅ May see info logs (blue/gray) - these are OK
- ✅ No "Failed to load" errors
- ✅ No React errors or warnings (red/yellow)

**Common Acceptable Logs:**
- `[vite] connected.` (info)
- `[HMR] Waiting for update signal from WDS...` (info)
- View switching logs when clicking buttons (info)

**Red Flags (should NOT see):**
- ❌ `Uncaught Error`
- ❌ `Failed to fetch`
- ❌ `Module not found`
- ❌ React error boundaries

---

## Step 6: Test Navigation

Click the **"Editor View"** button.

### Expected Result:
- ✅ Button highlights (blue background)
- ✅ Content changes to "Editor - Coming Soon"
- ✅ Console logs: `"Switching to editor view"`
- ✅ No errors or crashes

Click back to **"Dashboard View"**.

### Expected Result:
- ✅ Button highlights (blue background)
- ✅ Content changes back to "Dashboard - Coming Soon"
- ✅ Console logs: `"Switching to dashboard view"`
- ✅ App remains stable

---

## Step 7: Close App Gracefully

Close the Electron window using:
- **Cmd+Q** (macOS), or
- **Window close button** (red X)

### Expected Result:
- ✅ Window closes immediately
- ✅ Dev server stops in terminal
- ✅ No error messages on exit
- ✅ Process terminates cleanly

**Terminal Should Show:**
```
[vite] server closed
```

---

## ✅ Success Criteria

Your setup is working correctly if:

1. ✅ `npm install` completes without errors
2. ✅ `npm run dev` starts the app
3. ✅ Electron window opens (1200x800)
4. ✅ React content is visible (Focus Writer UI)
5. ✅ Console shows no errors
6. ✅ Navigation works (Dashboard ↔ Editor)
7. ✅ Can close app gracefully

## 🐛 Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Tailwind styles not loading
- Ensure Tailwind CSS v3 is installed: `npm list tailwindcss`
- Should show: `tailwindcss@3.4.18`

### TypeScript errors
```bash
# Run type check
npm run typecheck
```

### Window opens but is blank
- Check browser console for errors
- Verify `src/renderer/src/App.tsx` exists
- Check network tab for failed resource loads

---

## 🎉 Next Steps

If all checks pass:
1. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines
2. Explore the codebase structure in [STRUCTURE.md](./STRUCTURE.md)
3. Check [PRELOAD_API_USAGE.md](./PRELOAD_API_USAGE.md) for API examples
4. Start building features!

**Happy coding!** 🚀

