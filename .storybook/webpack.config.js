const { resolve } = require('path');

module.exports = ({ config }) => {
  const [babelLoader] = config.module.rules;
  babelLoader.exclude.push(resolve(__dirname, '..', 'loader'));
  return config;
};
