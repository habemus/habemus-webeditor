// third-party
const fse       = require('fs-extra');
var browserSync = require('browser-sync').create();

const auxBrowserify = require('./browserify');

module.exports = function (gulp, $, config) {

  gulp.task('browser-sw:js-dev:editor', function () {
    return auxBrowserify.createEditorBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.browser-sw-bundle.js',
      production: false,
    })
    .pipe($.size())
    .pipe(gulp.dest(config.srcDir));
  });

  // gulp.task('browser-sw:js-dev:inspector', function () {
  //   return auxBrowserify.createInspectorBrowserifyPipe({
  //     entry: config.root + '/src-inspector/index.js',
  //     destFilename: 'inspector.bundle.js',
  //     production: false,
  //   })
  //   .pipe($.size())
  //   .pipe(gulp.dest(config.srcDir + '/resources'));
  // });

  gulp.task('browser-sw:js-dev', [
    'browser-sw:js-dev:editor',
    // 'browser-sw:js-dev:inspector'
  ]);

  gulp.task('browser-sw:serve', ['less', 'browser-sw:js-dev'], function () {
    browserSync.init({
      port: process.env.EDITOR_PORT || 4000,
      server: {
        baseDir: './src',
        index: 'index.browser-sw.html',
      }
    });

    var watchFilesForBuildJS = [
      './environments/browser-sw/**/*.js',

      './src/index.js',
      './src/lib/**/*.js',
      './src/ui/**/*.js',
      './src/services/**/*.js',
      './src/keyboard/**/*.js',
    ];

    gulp.watch(watchFilesForBuildJS, ['browser-sw:js-dev']);

    var watchFilesForBuildLESS = [
      './src/**/*.less',
    ];

    gulp.watch(watchFilesForBuildLESS, ['less']);

    var watchFilesForReload = [
      './src/index.browser-sw.html',
      './src/index.browser-sw-bundle.js',
      './src/index.bundle.css',
      './src/elements/**/*.css',
      './src/elements/**/*.html',
      './src/elements/**/*.js',
    ];

    gulp.watch(watchFilesForReload, browserSync.reload);
  });

  gulp.task('browser-sw:develop', ['browser-sw:serve']);
};
