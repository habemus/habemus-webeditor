// third-party
const fse       = require('fs-extra');
var browserSync = require('browser-sync').create();

const auxBrowserify = require('./browserify');

module.exports = function (gulp, $, config) {

  const TMP_DIR = config.root + '/tmp-dev-sw';

  const COMMON_INJECTIONS = {
    'habemus-editor-services': {
      require: './environments/browser-sw/injected_node_modules/habemus-editor-services',
      expose: 'habemus-editor-services',
    },
    'habemus-editor-ui': {
      require: './environments/browser-sw/injected_node_modules/habemus-editor-ui',
      expose: 'habemus-editor-ui',
    },
    'habemus-editor-urls': {
      require: './environments/browser-sw/injected_node_modules/habemus-editor-urls.js',
      expose: 'habemus-editor-urls'
    }
  };

  gulp.task('browser-sw:js-dev:editor', function () {
    return auxBrowserify.createBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.browser-sw-bundle.js',

      // inject modules
      injections: [
        COMMON_INJECTIONS['habemus-editor-services'],
        COMMON_INJECTIONS['habemus-editor-ui'],
        COMMON_INJECTIONS['habemus-editor-urls'],
      ],
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

      // inject modules
      injections: [
        // use level-db-fs backed by indexed db as the filesystem
        {
          require: 'browserify-fs',
          expose: 'fs',
        },
        // CPR depends on graceful-fs
        // which breaks browser builds of fs
        // TODO: study replacements
        {
          require: 'ncp',
          expose: 'cpr',
        },
        // Replace express with bs-express
        {
          require: 'bs-express',
          expose: 'express',
        },
        COMMON_INJECTIONS['habemus-editor-services'],
        COMMON_INJECTIONS['habemus-editor-ui'],
        COMMON_INJECTIONS['habemus-editor-urls'],
      ],
    })
    .pipe($.size())
    .pipe(gulp.dest(TMP_DIR));
  });

  gulp.task('browser-sw:js-dev:inspector', function () {
    return auxBrowserify.createBrowserifyPipe({
      entry: [
        config.root + '/environments/browser-sw/inspector/index.js',
      ],
      destFilename: 'inspector.js',

      // inject modules
      injections: [

      ],
    })
    .pipe($.size())
    .pipe(gulp.dest(TMP_DIR));
  });

  gulp.task('browser-sw:js-dev', [
    'browser-sw:js-dev:editor',
    'browser-sw:js-dev:service-worker',
    'browser-sw:js-dev:inspector',
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
