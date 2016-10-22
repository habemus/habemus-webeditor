// third-party
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
exports.createBrowserifyPipe = function (options) {

  var entry        = options.entry;
  var destFilename = options.destFilename;
  var standalone   = options.standalone;

  if (!entry) {
    throw new Error('entry is required as an option');
  }

  if (!destFilename) {
    throw new Error('destFilename is required as an option');
  }

  // set up the browserify instance on a task basis
  var b = browserify({
    entries: entry,
    debug: false,

    transform: [
      envify({
        // ENV variables go here
      }),
      strictify,
    ],

    // standalone global object for main module
    standalone: standalone,
  });

  // FS module
  b.require('browserify-fs', {
    expose: 'fs'
  });

  // inject modules
  b.require('./environments/browser-sw/injected_node_modules/habemus-editor-services', {
    expose: 'habemus-editor-services'
  });
  b.require('./environments/browser-sw/injected_node_modules/habemus-editor-ui', {
    expose: 'habemus-editor-ui'
  });

  b.require('./environments/browser-sw/injected_node_modules/habemus-editor-urls.js', {
    expose: 'habemus-editor-urls'
  });

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};
