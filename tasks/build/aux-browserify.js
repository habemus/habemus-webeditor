const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');

exports.createBrowserifyPipe = function (options) {

  var entry = options.entry;
  var destFilename = options.destFilename;

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  if (!process.env.H_AUTH_URI) {
    throw new Error('H_AUTH_URI env var MUST be set');
  }

  if (!process.env.H_DEV_CLOUD_URI) {
    throw new Error('H_DEV_CLOUD_URI env var MUST be set');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: true,

    transform: [
      envify({
        H_AUTH_URI: process.env.H_AUTH_URI,
        H_DEV_CLOUD_URI: process.env.H_DEV_CLOUD_URI,
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
    .pipe(buffer())
}