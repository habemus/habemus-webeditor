const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');
const strictify   = require('strictify');

/**
 * Creates a browserify gulp pipe that builds
 * the editor's js.
 * 
 * @param  {Object} options
 *         - entry: String
 *         - destFilename: String
 *         - production: Boolean
 * @return {gulp pipe}
 */
exports.createEditorBrowserifyPipe = function (options) {

  var entry        = options.entry;
  var destFilename = options.destFilename;
  var production   = options.production || false;

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  // apis
  if (!process.env.H_ACCOUNT_URI) {
    throw new Error('H_ACCOUNT_URI env var MUST be set');
  }
  if (!process.env.H_PROJECT_URI) {
    throw new Error('H_PROJECT_URI env var MUST be set');
  }
  if (!process.env.H_WORKSPACE_URI) {
    throw new Error('H_WORKSPACE_URI env var MUST be set');
  }

  // workspace serving
  if (!production && !process.env.H_WORKSPACE_SERVER_URI) {
    // server uri required for development only
    throw new Error('H_WORKSPACE_SERVER_URI env var MUST be set');
  }
  if (!process.env.WORKSPACE_PREVIEW_HOST) {
    throw new Error('WORKSPACE_PREVIEW_HOST env var MUST be set');
  }

  // website serving
  if (!production && !process.env.H_WEBSITE_SERVER_URI) {
    // server uri required for development only
    throw new Error('H_WEBSITE_SERVER_URI env var MUST be set');
  }
  if (!process.env.WEBSITE_HOST) {
    throw new Error('WEBSITE_HOST env var MUST be set');
  }

  // other uis
  if (!process.env.UI_DASHBOARD_URI) {
    throw new Error('UI_DASHBOARD_URI env var MUST be set');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        H_ACCOUNT_URI: process.env.H_ACCOUNT_URI,
        H_PROJECT_URI: process.env.H_PROJECT_URI,
        H_WORKSPACE_URI: process.env.H_WORKSPACE_URI,
        H_WORKSPACE_SERVER_URI: process.env.H_WORKSPACE_SERVER_URI,
        H_WEBSITE_SERVER_URI: process.env.H_WEBSITE_SERVER_URI,
        WEBSITE_HOST: process.env.WEBSITE_HOST,
        UI_WORKSPACE_BASE_URL: process.env.UI_WORKSPACE_BASE_URL,
        WORKSPACE_PREVIEW_HOST: process.env.WORKSPACE_PREVIEW_HOST,
        UI_DASHBOARD_URI: process.env.UI_DASHBOARD_URI,

        ACE_BASE_PATH: '/static/editor',
        LANGUAGES_BASE_URL: process.env.LANGUAGES_BASE_URL,
        DEMO_MODE: process.env.DEMO_MODE,
      }),
      strictify,
    ],
  });

  // inject modules
  if (production) {
    b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-urls.js', {
      expose: 'habemus-editor-urls'
    });
  } else {
    b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-urls.development.js', {
      expose: 'habemus-editor-urls'
    });
  }

  b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-services', {
    expose: 'habemus-editor-services'
  });
  b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-ui', {
    expose: 'habemus-editor-ui'
  });
  b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-initialize', {
    expose: 'habemus-editor-initialize'
  });

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};

/**
 * Creates a browserify gulp pipe that builds
 * the inspector's js.
 * 
 * @param  {Object} options
 * @return {gulp pipe}
 */
exports.createInspectorBrowserifyPipe = function (options) {

  var entry = options.entry;
  var destFilename = options.destFilename;
  var production = options.production || false;

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  if (!process.env.WORKSPACE_PREVIEW_HOST) {
    throw new Error('WORKSPACE_PREVIEW_HOST env var MUST be set');
  }

  if (!process.env.H_WORKSPACE_URI) {
    throw new Error('H_WORKSPACE_URI env var MUST be set');
  }

  if (!production && !process.env.H_WORKSPACE_SERVER_URI) {
    // server uri required for development only
    throw new Error('H_WORKSPACE_SERVER_URI env var MUST be set');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        WORKSPACE_PREVIEW_HOST: process.env.WORKSPACE_PREVIEW_HOST,
        H_WORKSPACE_URI: process.env.H_WORKSPACE_URI,
        H_WORKSPACE_SERVER_URI: process.env.H_WORKSPACE_SERVER_URI,
        UI_WORKSPACE_BASE_URL: process.env.UI_WORKSPACE_BASE_URL,
        WEBSITE_HOST: process.env.WEBSITE_HOST,
      }),
    ],

    // standalone global object for main module
    standalone: 'HABEMUS_INSPECTOR',
  });

  // inject scripts
  if (production) {
    b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-urls.js', {
      expose: 'habemus-editor-urls'
    });
  } else {
    b.require('./src/environments/browser-cloud/injected_node_modules/habemus-editor-urls.development.js', {
      expose: 'habemus-editor-urls'
    });
  }

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};
