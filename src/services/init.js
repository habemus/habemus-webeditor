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

const initHFS = require('hb-service-hfs');

module.exports = function (habemus, options) {

  habemus.services = {};
  
  return Bluebird.all([
    initHFS(options),
  ])
  .then(function (services) {
    
    habemus.services.hfs = services[0];
    
    // localStorage is the browser's localStorage
    habemus.services.localStorage = window.localStorage;
    
    return;
  })
  .catch(function (err) {

    alert('there was an error setting up services');
    console.warn(err);

  });
};