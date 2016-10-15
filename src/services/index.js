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

// own
const aux = require('../aux');

module.exports = function (habemus, options) {

  // define the services singleton
  habemus.services = {};

  // start by initializing notification and dialog uis
  // so that we can inform the user about setup progress
  return Bluebird.all([
    require('./notification')(habemus, options),
    require('./dialogs')(habemus, options),
  ])
  .then(function (services) {

    aux.defineFrozenProperties(habemus.services, {
      notification: services[0],
      dialogs: services[1],
    });

    /**
     * Show the loading notification
     * and let it be manually removed
     */
    habemus.services.notification.loading.show({
      text: 'Setting up project',
      duration: Math.Infinity,
    });

    /**
     * Setup environment specific services:
     * Expects the module to define required services
     * onto habemus.services object
     *
     * - config
     * - hDev
     */
    return require('habemus-editor-services')(habemus, options);
  })
  .then(function () {

    if (!habemus.services.config) { throw new Error('config services MUST be defined'); }
    if (!habemus.services.config.projectId) { throw new Error('config.projectId MUST be defined'); }
    if (!habemus.services.hDev) { throw new Error('hDev service MUST be defined'); }

    return Bluebird.all([
      // project-config-storage depends on config.projectId
      require('./project-config-storage')(habemus, options),
    ]);
  })
  .then(function (services) {

    aux.defineFrozenProperties(habemus.services, {
      projectConfigStorage: services[0],
    });

    // TODO: deprecate services.localStorage
    Object.defineProperty(habemus.services, 'localStorage', {
      get: function () {
        console.warn(
          'habemus.services.localStorage will be removed in 1.0.0 release\n' + 
          'please use habemus.services.projectConfigStorage instead'
        );

        return habemus.services.projectConfigStorage;
      }
    });

    /**
     * Hide loading notification
     */
    habemus.services.notification.loading.show({
      text: 'All set!',
    });
    setTimeout(function () {
      habemus.services.notification.loading.hide();
    }, 1000);

    return;
  })
  .then(function () {

    // freeze services
    Object.freeze(habemus.services);

  })
  .catch(function (err) {

    /**
     * Hide loading notification
     */
    habemus.services.notification.loading.hide();

    /**
     * TODO: these errors should be handled by the external service
     * instantiator.
     */
    switch (err.name) {
      case 'NotFound':
        // TODO:
        // study best way of implementing this messaging system.
        var msg = 'The requested project was not found.';
        msg += 'It may have been renamed recently or the address was mistyped.';

        if (habemus.services.config && habemus.services.config.cloud) {
          msg += 'Please go to the <a href="';
          msg += habemus.services.config.cloud.uiDashboardURI;
          msg += '">dashboard</a> ';
          msg += 'and access the desired workspace again.'
        }

        habemus.services.dialogs.alert(msg);

        break;
      case 'Unauthorized':
        // TODO:
        // study best way of implementing this messaging system.
        var msg = 'Your account does not have the right permissions to access this workspace.';
        msg += 'We are sorry :(';

        if (habemus.services.config && habemus.services.config.cloud) {
          msg += 'Please go to the <a href="';
          msg += habemus.services.config.cloud.uiDashboardURI;
          msg += '">dashboard</a> ';
          msg += 'and access the desired workspace again.'
        }

        habemus.services.dialogs.alert(msg);

        break;
      default:
      /**
       * Unknown error
       * @type {String}
       */
        habemus.services.notification.error.show({
          text: 'An unexpected error occurred: ' + err.name,
          duration: Math.Infinity, 
        });

        console.warn(err);
        break;
    }
  });
};