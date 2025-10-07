import vitest from 'eslint-plugin-vitest';

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: { version: 'detect' }
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules
    }
  },
  // tests override
  {
    files: ['tests/**/*.{ts,tsx}'],
    plugins: { vitest },
    ...vitest.configs.recommended,
    rules: {
      // turn off noisy Vite/React rule in tests
      'react-refresh/only-export-components': 'off'
    }
  },
  eslintConfigPrettier
);