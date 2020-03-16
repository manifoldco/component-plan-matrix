import { addDecorator, configure } from '@storybook/html';
import { defineCustomElements as defineInit } from '@manifoldco/manifold-init/loader/index.mjs';
import { defineCustomElements as definePlanMatrix } from '../loader';

// Init web components
defineInit();
definePlanMatrix();

// Load stories (import all files ending in *.stories.js)
const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
