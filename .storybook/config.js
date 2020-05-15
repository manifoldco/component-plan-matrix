import { configure } from '@storybook/html';
import { defineCustomElements as defineInit } from '@manifoldco/manifold-init/loader/index.mjs';
import '../dist/manifold-plan-table/manifold-plan-table.css';
import './styles.css';
import { defineCustomElements as definePlanTable } from '../dist/esm-es5/loader.mjs';

// Init web components
defineInit();
definePlanTable();

// Load stories (import all files ending in *.stories.js)
const req = require.context('../stories', true, /\.stories\.js$/);

function loadStories() {
  req.keys().forEach((filename) => req(filename));
}

configure(loadStories, module);
