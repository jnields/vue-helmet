import rollupPluginBabel from 'rollup-plugin-babel';
import { dependencies } from './package.json';

export default {
  input: './src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    rollupPluginBabel({ runtimeHelpers: true }),
  ],
  external: id => Object.keys(dependencies).some(dep => id === dep || id.startsWith(`${dep}/`)),
};
