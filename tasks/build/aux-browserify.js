const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');

/**
 * Creates a browserify gulp pipe that builds
 * the editor's js.
 * 
 * @param  {Object} options
 * @return {gulp pipe}
 */
exports.createEditorBrowserifyPipe = function (options) {

  var entry = options.entry;
  var destFilename = options.destFilename;

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

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        H_ACCOUNT_URI: process.env.H_ACCOUNT_URI,
        H_WORKSPACE_URI: process.env.H_WORKSPACE_URI,
      }),
    ],

    // standalone global object for main module
    standalone: 'habemus',
  });

  // inject modules
  b.require('./browser/injected_node_modules/hb-service-h-dev/index.js', {
    expose: 'hb-service-h-dev'
  });
  b.require('./browser/injected_node_modules/hb-service-config/index.js', {
    expose: 'hb-service-config'
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

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  if (!process.env.HOST) {
    throw new Error('HOST env var MUST be set');
  }

  if (!process.env.H_WORKSPACE_URI) {
    throw new Error('H_WORKSPACE_URI env var MUST be set');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        HOST: process.env.HOST,
        H_WORKSPACE_URI: process.env.H_WORKSPACE_URI,
      }),
    ],

    // standalone global object for main module
    standalone: 'HABEMUS_INSPECTOR',
  });

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};
