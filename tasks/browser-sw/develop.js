// third-party
const fse       = require('fs-extra');
var browserSync = require('browser-sync').create();

const auxBrowserify = require('./browserify');

module.exports = function (gulp, $, config) {

  const TMP_DIR = config.root + '/tmp-dev-sw';

  gulp.task('browser-sw:js-dev:editor', function () {
    return auxBrowserify.createBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.browser-sw-bundle.js',
    })
    .pipe($.size())
    .pipe(gulp.dest(TMP_DIR));
  });

  gulp.task('browser-sw:js-dev:service-worker', function () {
    return auxBrowserify.createBrowserifyPipe({
      entry: [
        config.root + '/environments/browser-sw/service-worker/index.js',
      ],
      destFilename: 'service-worker.js',
      standalone: 'HABEMUS_SW',
    })
    .pipe($.size())
    .pipe(gulp.dest(TMP_DIR));
  });

  gulp.task('browser-sw:js-dev', [
    'browser-sw:js-dev:editor',
    'browser-sw:js-dev:service-worker',
  ]);

  gulp.task('browser-sw:serve', ['less', 'browser-sw:js-dev'], function () {
    browserSync.init({
      port: process.env.EDITOR_PORT || 4000,
      server: {
        baseDir: './src',
        index: 'index.browser-sw.html',
      },
      serveStatic: [
        TMP_DIR
      ]
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
      './src/index.bundle.css',
      './src/elements/**/*.css',
      './src/elements/**/*.html',
      './src/elements/**/*.js',

      './tmp-dev-sw/**/*',
    ];

    gulp.watch(watchFilesForReload, browserSync.reload);
  });

  gulp.task('browser-sw:develop', ['browser-sw:serve']);
};
