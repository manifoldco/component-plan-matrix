const { RemoteBrowserTarget } = require('happo.io');
const happoPluginTypeScript = require('happo-plugin-typescript');
const path = require('path');

module.exports = {
  project: 'manifoldco/manifold-plan-table',
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  targets: {
    chrome: new RemoteBrowserTarget('chrome', {
      viewport: '1440x900',
    }),
  },
  type: 'plain',
  prerender: false,
  setupScript: path.resolve(__dirname, 'happo.setup.js'),
  stylesheets: [path.resolve(__dirname, 'dist', 'manifold-plan-table', 'manifold-plan-table.css')],
  plugins: [happoPluginTypeScript()],
};
