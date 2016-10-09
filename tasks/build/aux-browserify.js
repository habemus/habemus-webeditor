const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');

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

  var entry = options.entry;
  var destFilename = options.destFilename;
  var production = options.production || false;

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  if (!process.env.H_ACCOUNT_URI) {
    throw new Error('H_ACCOUNT_URI env var MUST be set');
  }

  if (!process.env.H_WORKSPACE_URI) {
    throw new Error('H_WORKSPACE_URI env var MUST be set');
  }

  if (!process.env.H_WORKSPACE_SERVER_URI) {
    throw new Error('H_WORKSPACE_SERVER_URI env var MUST be set');
  }

  if (!process.env.WORKSPACE_PREVIEW_HOST) {
    throw new Error('WORKSPACE_PREVIEW_HOST env var MUST be set');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        H_ACCOUNT_URI: process.env.H_ACCOUNT_URI,
        H_WORKSPACE_URI: process.env.H_WORKSPACE_URI,
        H_WORKSPACE_SERVER_URI: process.env.H_WORKSPACE_SERVER_URI,
        WORKSPACE_PREVIEW_HOST: process.env.WORKSPACE_PREVIEW_HOST,
      }),
    ],

    // standalone global object for main module
    standalone: 'habemus',
  });

  // inject modules
  b.require('./browser/injected_node_modules/habemus-editor-h-dev-api.js', {
    expose: 'habemus-editor-h-dev-api'
  });
  b.require('./browser/injected_node_modules/habemus-editor-config.js', {
    expose: 'habemus-editor-config'
  });

  if (production) {
    b.require('./browser/injected_node_modules/habemus-editor-urls.js', {
      expose: 'habemus-editor-urls'
    });
  } else {
    b.require('./browser/injected_node_modules/habemus-editor-urls.development.js', {
      expose: 'habemus-editor-urls'
    });
  }

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

  if (!process.env.H_WORKSPACE_SERVER_URI) {
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
      }),
    ],

    // standalone global object for main module
    standalone: 'HABEMUS_INSPECTOR',
  });

  // inject scripts
  if (production) {
    b.require('./browser/injected_node_modules/habemus-editor-urls.js', {
      expose: 'habemus-editor-urls'
    });
  } else {
    b.require('./browser/injected_node_modules/habemus-editor-urls.development.js', {
      expose: 'habemus-editor-urls'
    });
  }

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};
