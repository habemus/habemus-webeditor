// native dependencies
const path = require('path');
const proc = require('child_process')

// third-party dependencies
const gulp = require('gulp');
const electron = require('electron-prebuilt');


// Load all installed gulp plugins into $
var $ = require('gulp-load-plugins')();

// test
const istanbul = require('gulp-istanbul');
const mocha    = require('gulp-mocha');


// Internal dependencies
const config = require('./tasks/config');

gulp.task('develop-electron', () => {

  // LESS autorecompile
  gulp.watch(config.srcDir + '/**/*.less', ['less']);

  // spawn electron 
  var child = proc.spawn(electron, ['electron/main.js']);
});

gulp.task('pre-test', function () {
  return gulp.src(['lib/model/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/**/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
    .on('error', (err) => {
      this.emit('error', err);
    });
});

// load task definers
require('./tasks/build/less')(gulp, $, config);
require('./tasks/build/browser')(gulp, $, config);

require('./tasks/develop/browser')(gulp, $, config);
