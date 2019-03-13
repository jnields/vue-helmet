import rollupPluginBabel from 'rollup-plugin-babel';
import { dependencies } from './package.json';

const getConfig = es => ({
  input: './src/index.js',
  output: [
    {
      file: `dist/index${es ? '.es' : ''}.js`,
      format: es ? 'es' : 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    rollupPluginBabel({
      babelrc: false,
      runtimeHelpers: true,
      presets: [
        ['@babel/env', { modules: false }],
        '@babel/flow',
      ],
      plugins: [
        [
          '@babel/transform-runtime',
          { useESModules: es },
        ],
      ],
    }),
  ],
  external: id => Object.keys(dependencies).some(dep => id === dep || id.startsWith(`${dep}/`)),
});

export default [getConfig(true), getConfig(false)];
