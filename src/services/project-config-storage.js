// own deps
const ScopedWebStorage = require('../lib/scoped-web-storage');

module.exports = function (habemus, options) {
  // use the projectId in the prefix
  const PROJECT_CONFIG_PREFIX = 
    'habemus_config_' + habemus.services.config.projectId;

  return new ScopedWebStorage(PROJECT_CONFIG_PREFIX, window.localStorage);
};
