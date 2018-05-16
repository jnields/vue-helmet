import rollupPluginBabel from 'rollup-plugin-babel';
import { dependencies } from './package.json';

export default {
  input: './src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
    },
  ],
  plugins: [
    rollupPluginBabel({ runtimeHelpers: true }),
  ],
  external: id => Object.keys(dependencies).some(dep => id === dep || id.startsWith(`${dep}/`)),
};
