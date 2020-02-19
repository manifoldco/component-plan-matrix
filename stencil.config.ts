import { Config } from '@stencil/core';
import { postcss } from '@stencil/postcss';
import postCSSPresetEnv from 'postcss-preset-env';

export const config: Config = {
  namespace: 'manifold-plan-matrix',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
  ],
  plugins: [
    postcss({
      plugins: [
        postCSSPresetEnv({
          features: {
            'custom-media-queries': true,
            'nesting-rules': true,
          },
        }),
      ],
    }),
  ],
};
