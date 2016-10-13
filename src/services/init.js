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

// hb-dependencies (dependencies that are injected for each environment)
const habemusEditorConfig = require('habemus-editor-config');

const ScopedWebStorage = require('./scoped-web-storage');

const initDialogs       = require('./dialogs');
const initNotifications = require('./notifications');

/**
 * Injected modules
 */
const initHDev          = require('habemus-editor-h-dev-api');
const habemusEditorUrls = require('habemus-editor-urls');


module.exports = function (habemus) {

  // define the services singleton
  habemus.services = {};

  // start by initializing notifications and dialog uis
  // so that we can inform the user about setup progress
  return Bluebird.all([
    initNotifications(habemus, habemus.services.config),
    initDialogs(habemus, habemus.services.config),
  ])
  .then(function (services) {
    habemus.services.notifications = services[0];
    habemus.services.dialogs = services[1];

    /**
     * Show the loading notification
     * and let it be manually removed
     */
    habemus.services.notifications.loading.show({
      text: 'Setting up project',
      duration: Math.Infinity,
    });

    /**
     * Load configurations
     */
    return habemusEditorConfig();

  }).then(function (config) {

    if (!config.projectId) {
      throw new Error('projectId is a required option');
    }

    /**
     * Make configurations available as a service
     * 
     * @type {Object}
     */
    habemus.services.config = config;

    /**
     * Setup backend-dependant services.
     */
    return Bluebird.all([
      initHDev(habemus.services.config),
    ]);
  })
  .then(function (services) {

    // use the projectId in the prefix
    const PROJECT_CONFIG_PREFIX = 
      'habemus_config_' + habemus.services.config.projectId;

    /**
     * Hide loading notification
     */
    habemus.services.notifications.loading.show({
      text: 'All set!',
    });
    setTimeout(function () {
      habemus.services.notifications.loading.hide();
    }, 1000);

    habemus.services.hDev = services[0];

    habemus.services.projectConfigStorage = 
      new ScopedWebStorage(PROJECT_CONFIG_PREFIX, window.localStorage);

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

    return;
  })
  .catch(function (err) {

    /**
     * Hide loading notification
     */
    habemus.services.notifications.loading.hide();

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
        habemus.services.notifications.error.show({
          text: 'An unexpected error occurred: ' + err.name,
          duration: Math.Infinity, 
        });

        console.warn(err);
        break;
    }
  });
};