/**
 * This module initializes all services and makes
 * them available to the editor.
 * 
 * All services must be instantiated by this script.
 * 
 * Service constructors may be replaced for custom builds
 * for differing environments (browser, local, etc)
 */

// third-party dependencies
const Bluebird = require('bluebird');

const ScopedWebStorage = require('./scoped-web-storage');

const initHDev = require('hb-service-h-dev');

module.exports = function (habemus, options) {
  
  if (!options.projectId) {
    throw new Error('projectId is a required option');
  }

  // use the projectId in the prefix
  const PROJECT_CONFIG_PREFIX = 'habemus_config_' + options.projectId;

  // define the services singleton
  habemus.services = {};
  
  return Bluebird.all([
    initHDev(options),
  ])
  .then(function (services) {
    
    habemus.services.hDev = services[0];

    habemus.services.projectConfigStorage = 
      new ScopedWebStorage(PROJECT_CONFIG_PREFIX, window.localStorage);

    // TODO: deprecate services.localStorage
    habemus.services.localStorage = habemus.services.projectConfigStorage;

    return;
  })
  .catch(function (err) {

    alert('there was an error setting up services');
    console.warn(err);
  });
};