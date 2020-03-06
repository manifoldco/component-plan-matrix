const { RemoteBrowserTarget } = require('happo.io');
const happoPluginTypeScript = require('happo-plugin-typescript');
const path = require('path');

module.exports = {
  project: 'manifoldco/component-plan-matrix',
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: '1024x768',
    }),
  },
  type: 'plain',
  prerender: false,
  setupScript: path.resolve(__dirname, 'happo.setup.js'),
  plugins: [happoPluginTypeScript()],
};
