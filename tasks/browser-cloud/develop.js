// third-party
const fse       = require('fs-extra');
var browserSync = require('browser-sync').create();

const auxBrowserify = require('./browserify');

module.exports = function (gulp, $, config) {

  gulp.task('browser-cloud:js-dev:editor', function () {
    return auxBrowserify.createEditorBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.bundle.js',
      production: false,
    })
    .pipe($.size())
    .pipe(gulp.dest(config.srcDir));
  });

  gulp.task('browser-cloud:js-dev:inspector', function () {
    return auxBrowserify.createInspectorBrowserifyPipe({
      entry: config.root + '/src-inspector/index.js',
      destFilename: 'inspector.bundle.js',
      production: false,
    })
    .pipe($.size())
    .pipe(gulp.dest(config.srcDir + '/resources'));
  });

  gulp.task('browser-cloud:js-dev', ['browser-cloud:js-dev:editor', 'browser-cloud:js-dev:inspector']);

  gulp.task('browser-cloud:serve', ['less', 'browser-cloud:js-dev'], function () {
    browserSync.init({
      port: process.env.EDITOR_PORT,
      server: {
        baseDir: './src',
        index: 'index.browser-cloud.html',
      }
    });

    var watchFilesForBuildJS = [
      './browser/**/*.js',

      './src/index.js',
      './src/lib/**/*.js',
      './src/ui/**/*.js',
      './src/services/**/*.js',
      './src/keyboard/**/*.js',
    ];

    gulp.watch(watchFilesForBuildJS, ['browser-cloud:js-dev']);

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

  gulp.task('browser-cloud:develop', ['browser-cloud:serve']);
};
