// tslint:disable

import typescript from 'rollup-plugin-typescript2'
import commonjs from 'rollup-plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import resolve from 'rollup-plugin-node-resolve'
import json from 'rollup-plugin-json'

const pkg = require('./package.json')

export default {
  input: 'src/resynced.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
  ],

  external: ['react', 'react-dom', 'prop-types'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    resolve(),
    typescript({
      clean: true,
      rollupCommonJSResolveHack: true,
      exclude: ['*.d.ts', '**/*.d.ts'],
    }),
    commonjs(),
    // Resolve source maps to the original source
    sourceMaps(),
  ],
}
