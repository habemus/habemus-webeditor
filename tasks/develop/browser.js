const fse       = require('fs-extra');

const auxBrowserify = require('../build/aux-browserify');

var browserSync = require('browser-sync').create();

module.exports = function (gulp, $, config) {

  gulp.task('browser:js-dev', function () {
    return auxBrowserify.createBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.bundle.js',
    })
    .pipe(gulp.dest(config.srcDir));
  });

  gulp.task('browser:serve', ['less', 'browser:js-dev'], function () {
    browserSync.init({
      server: {
        baseDir: './src',
        index: 'index.browser.html',
      }
    });

    var watchFilesForBuildJS = [
      './browser/**/*.js',

      './src/index.js',
      './src/ui/**/*.js',
      './src/services/**/*.js',
      './src/keyboard/**/*.js',
    ];

    gulp.watch(watchFilesForBuildJS, ['browser:js-dev']);

    var watchFilesForBuildLESS = [
      './src/**/*.less',
    ];

    gulp.watch(watchFilesForBuildLESS, ['less']);

    var watchFilesForReload = [
      './src/index.browser.html',
      './src/index.bundle.js',
      './src/index.bundle.css',
      './src/elements/**/*.css',
      './src/elements/**/*.html',
      './src/elements/**/*.js',
    ];

    gulp.watch(watchFilesForReload, browserSync.reload);
  });

  gulp.task('browser:develop', ['browser:serve']);
};
