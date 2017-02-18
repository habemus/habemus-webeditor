// third-party
const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const envify      = require('envify/custom');
const strictify   = require('strictify');

// transform all requires for fs into 'browserify-fs'
const through = require('through2');

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
  var injections   = options.injections || [];

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
    ],

    // standalone global object for main module
    standalone: standalone,
  });

  // replacement injections
  injections.forEach((inj) => {

    if (!inj.require || !inj.expose) {
      throw new Error('inj.require and inj.expose are injuired');
    }

    b.require(inj.require, {
      expose: inj.expose,
    });
  });

  return b.bundle()
    .pipe(source(destFilename))
    .pipe(buffer());
};
