import { defineCustomElements as defineCore } from '@manifoldco/mui-core/loader';
import { defineCustomElements } from './loader';

defineCore(window);
defineCustomElements(window);
window.happoRender = () => {};
