import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-assign-module-variable': 'off',

      // Next 16's React 19 lint profile enables React Compiler-oriented rules
      // that were not part of the verified Phase 11 lint contract. They are
      // useful refactoring guidance, but converting dozens of established
      // data-loading/local-storage effects during this security runtime upgrade
      // would create unrelated behavioral risk. Keep Rules of Hooks,
      // exhaustive-deps, Next core-web-vitals, TypeScript and the production
      // build enforced while deferring compiler-style refactors separately.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/refs': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
])
