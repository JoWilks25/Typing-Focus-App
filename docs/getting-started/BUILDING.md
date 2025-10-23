# Building Installers

Complete guide for building Mac and Windows installers for the Typing Focus App.

## Prerequisites

### System Requirements
- **Node.js**: Version 18+ (see `package.json` for exact version)
- **npm**: Latest version
- **Git**: For version control

### Platform-Specific Requirements

#### macOS
- **Xcode**: Required for native dependencies and certificate management
  - Install from Mac App Store or Apple Developer portal
  - Use Xcode to set up Developer ID certificates - specifically need the "Developer Id Application" certificate
- **Apple Developer Account**: For code signing and notarization
- **Developer ID Certificate**: For signing Mac applications

#### Windows
- **Windows SDK**: For building Windows applications
- **Visual Studio Build Tools**: For native dependencies

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see Mac Code Signing section)
4. Verify build tools are installed

## Building for Mac

### Build Commands

#### Intel Mac Build
```bash
npm run build:mac:intel
```
Creates a signed and notarized installer for Intel Macs.

#### Universal Mac Build
```bash
npm run build:mac:universal
```
Creates a signed and notarized installer for both Intel and Apple Silicon Macs.

### Output Files
- **Location**: `dist/` directory
- **Primary Distribution**: `mac-typing-writing-app-{version}.dmg` - DMG installer for end users
- **Alternative**: `Draft Tree-{version}-universal-mac.zip` - ZIP archive (for developers/CI)
- **Note**: Both files are signed and notarized, but DMG provides better user experience

### Code Signing & Notarization

The Mac builds are automatically signed and notarized using the following configuration:

#### Identity Configuration
- **Developer Identity**: "Joanne Wilkins (3U87HS2UXJ)"
- **Team ID**: 3U87HS2UXJ
- **Configuration**: Set in `electron-builder.yml` line 29

#### Required Environment Variables
Create a `.env` file in the project root with:

```bash
export APPLE_ID=your-apple-id@example.com
export APPLE_APP_SPECIFIC_PASSWORD=your-app-specific-password
export APPLE_TEAM_ID=3U87HS2UXJ
```

#### Setting Up Apple Credentials

1. **Apple ID**: Your Apple Developer account email
2. **App-Specific Password**: 
   - Go to [appleid.apple.com](https://appleid.apple.com)
   - Sign in with your Apple ID
   - Generate an app-specific password for "electron-builder"
   - Use this password (not your regular Apple ID password)
3. **Team ID**: Found in your Apple Developer account

#### Notarization Process
- Automatically handled by electron-builder
- Requires internet connection
- May take 5-10 minutes for first-time notarization
- Subsequent builds are faster due to caching

## Building for Windows

### Build Command
```bash
npm run build:win
```

### Output Files
- **Location**: `dist/` directory
- **Distribution File**: `Draft Tree-{version}-setup.exe` - NSIS installer for Windows
- **Format**: `.exe` installer with desktop shortcut and uninstaller

### Windows Build Notes
- **Currently Unsigned**: Windows builds are not code signed
- **NSIS Installer**: Uses NSIS for Windows installation
- **Desktop Shortcut**: Automatically created during installation
- **Uninstaller**: Included with the installer

### Future Code Signing
To add Windows code signing in the future:
1. Obtain a Windows code signing certificate
2. Add certificate configuration to `electron-builder.yml`
3. Set up signing environment variables

## Distribution

### Testing Installers

Before distribution, test installers on target systems:

#### Mac Testing
1. Test on both Intel and Apple Silicon Macs
2. Verify code signing: `codesign -dv --verbose=4 "Draft Tree.app"`
3. Check notarization: `spctl -a -v "Draft Tree.app"`
4. Test installation and uninstallation

#### Windows Testing
1. Test on Windows 10/11
2. Verify installer runs without errors
3. Test installation and uninstallation
4. Check desktop shortcut creation

### Distribution Files

**For Mac users, distribute:**
- **`mac-typing-writing-app-{version}.dmg`** - Primary distribution file (recommended)
- **`Draft Tree-{version}-universal-mac.zip`** - Alternative ZIP format

**For Windows users, distribute:**
- **`Draft Tree-{version}-setup.exe`** - NSIS installer

**Do NOT distribute:**
- `.blockmap` files (used for delta updates)
- Unpacked app bundles in `mac-universal/` folder
- `latest-mac.yml` (auto-update metadata)

### File Size Expectations
- **Mac DMG**: ~150-200MB
- **Mac ZIP**: ~150-200MB  
- **Windows EXE**: ~100-150MB

### Distribution Checklist
- [ ] All builds complete successfully
- [ ] Code signing verified (Mac)
- [ ] Notarization successful (Mac)
- [ ] Installers tested on target platforms
- [ ] File sizes are reasonable
- [ ] Version numbers are correct
- [ ] Release notes are updated

### Auto-Update Configuration
Auto-update is configured in `electron-builder.yml` (lines 52-54):
- **Provider**: Generic
- **URL**: Configured for auto-updates
- **Platforms**: Mac and Windows supported

## Troubleshooting

### Common Build Issues

#### Build Failures
```bash
# Clean build artifacts
rm -rf dist out node_modules
npm install
npm run build
```

#### Mac Signing Issues
- **Certificate not found**: Verify identity in `electron-builder.yml`
- **Notarization fails**: Check environment variables
- **Team ID mismatch**: Verify APPLE_TEAM_ID matches certificate

#### Windows Build Issues
- **Missing Windows SDK**: Install Visual Studio Build Tools
- **NSIS errors**: Check file permissions and paths
- **Antivirus blocking**: Add project folder to exclusions

#### Platform-Specific Errors

##### macOS
- **Xcode tools missing**: Run `xcode-select --install`
- **Permission denied**: Check certificate permissions
- **Notarization timeout**: Check internet connection

##### Windows
- **Build tools missing**: Install Visual Studio Build Tools
- **Path too long**: Move project to shorter path
- **Antivirus interference**: Temporarily disable real-time protection

### Clean Build Steps
```bash
# Complete clean build
rm -rf dist out node_modules
npm install
npm run build
```

### Debugging Build Issues
1. Check Node.js version: `node --version`
2. Verify dependencies: `npm list`
3. Check environment variables: `echo $APPLE_ID`
4. Review build logs for specific errors
5. Test on clean system if possible

## Environment Variables Reference

### Required for Mac Builds
```bash
# Apple ID for notarization
export APPLE_ID="your-apple-id@example.com"

# App-specific password (not regular password)
export APPLE_APP_SPECIFIC_PASSWORD="your-app-specific-password"

# Team ID from Apple Developer account
export APPLE_TEAM_ID="3U87HS2UXJ"
```

### Creating .env File
1. Copy the environment variables above
2. Replace with your actual credentials
3. Save as `.env` in project root
4. Verify `.env` is in `.gitignore` (it should be)

## Build Configuration

### Key Files
- **`package.json`**: Build scripts (lines 19-23)
- **`electron-builder.yml`**: Build configuration
- **`.env`**: Environment variables (not in git)

### Build Scripts Reference
```json
{
  "build:mac": "electron-vite build && electron-builder --mac",
  "build:mac:intel": "electron-vite build && electron-builder --mac --x64",
  "build:mac:universal": "electron-vite build && electron-builder --mac --universal",
  "build:win": "npm run build && electron-builder --win"
}
```

---

For development builds, see [Development Guide](./DEVELOPMENT.md).  
For architecture details, see [Architecture Overview](../architecture/OVERVIEW.md).
