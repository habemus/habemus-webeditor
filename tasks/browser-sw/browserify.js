// third-party
const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');
const strictify   = require('strictify');

// transform all requires for fs into 'browserify-fs'
const through = require('through2');

// function _replaceFs(file) {
//   return through(function (buf, enc, next) {
//     this.push(buf.toString('utf8').replace(
//       /require\(['"]fs['"]\);/g,
//       "require('browserify-fs');"
//     ));
//     next();
//   });
// }

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
      // strictify,
      // _replaceFs,
    ],

    // standalone global object for main module
    standalone: standalone,
  });

  // FS modules
  b.require('browserify-fs', {
    expose: 'fs'
  });
  // CPR depends on graceful-fs
  // which breaks browser builds of fs
  // TODO: study replacements
  b.require('ncp', {
    expose: 'cpr',
  });
  
  // Replace express with bs-express
  b.require('bs-express', {
    expose: 'express',
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
