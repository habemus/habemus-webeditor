const fse       = require('fs-extra');

var browserSync = require('browser-sync').create();

module.exports = function (gulp, $, config) {
  gulp.task('browser:serve', ['browser:build'], function () {
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

    gulp.watch(watchFilesForBuildJS, ['browser:js']);

    // var watchFilesForBuildLESS = [
    //   './src/**/*.less',
    // ];

    // gulp.watch(watchFilesForBuildLESS, ['less']);

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
