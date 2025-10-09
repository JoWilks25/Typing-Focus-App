# Test Configuration

This directory contains configuration files for testing and development purposes.

## Files

### `testConfig.ts`

Contains configurable values that can be easily changed for testing different scenarios.

#### Distraction Warning Countdown

**Location**: `TEST_CONFIG.DISTRACTION_COUNTDOWN_DURATION`

**Purpose**: Controls how long the user has to return to the app before the session is abandoned.

**Default**: 10 seconds

**Testing Examples**:
- `5` - 5 seconds (for quick testing)
- `10` - 10 seconds (default)
- `30` - 30 seconds (for slower testing)
- `60` - 1 minute (for very slow testing)

#### Inactivity Timeout

**Location**: `TEST_CONFIG.INACTIVITY_TIMEOUT_MINUTES`

**Purpose**: Controls how long the user can be inactive before the inactivity modal appears.

**Default**: 3 minutes

**Testing Examples**:
- `0.5` - 30 seconds (for quick testing)
- `3` - 3 minutes (default)
- `5` - 5 minutes (for slower testing)

## How to Use

1. Open `src/main/config/testConfig.ts`
2. Change the desired values
3. Restart the application
4. Test the new behavior

## Important Notes

- Changes require an application restart to take effect
- These are development/testing configurations only
- For production, consider using environment variables or a proper configuration system
