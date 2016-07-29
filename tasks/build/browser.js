const browserify  = require('browserify');
const source      = require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const gutil       = require('gulp-util');
const envify      = require('envify/custom');
const runSequence = require('run-sequence');

const polybuild  = require('polybuild');

const fse        = require('fs-extra');

const jsRe = /.+\.js$/;

function isJs(file) {
  return jsRe.test(file.path);
};

module.exports = function (gulp, $, config) {

  /**
   * Special copy task for ace, as the ace-editor loads
   * its scripts relative to its root.
   * Not all scripts should be included at once, as they are
   * pretty huge.
   *
   * As polybuild concatenates all scripts into a single script
   * at the root (index.build.js), we must copy ace extensions
   * to the root directory as well.
   */
  gulp.task('browser:copy-ace', function () {
    var files = [
      config.srcDir + '/bower_components/ace-builds/src-noconflict/**/*',
    ];

    return gulp.src(files).pipe(gulp.dest(config.distDir));
  });

  gulp.task('browser:js', function () {

    if (!process.env.H_AUTH_URI) {
      throw new Error('H_AUTH_URI env var MUST be set');
    }

    if (!process.env.H_DEV_CLOUD_URI) {
      throw new Error('H_DEV_CLOUD_URI env var MUST be set');
    }

    // set up the browserify instance on a task basis
    var b = browserify({
      entries: config.srcDir + '/index.js',
      debug: true,

      transform: [
        envify({
          H_AUTH_URI: process.env.H_AUTH_URI,
          H_DEV_CLOUD_URI: process.env.H_DEV_CLOUD_URI,
        }),
      ],

      // standalone global object for main module
      standalone: 'habemus',
    });

    // inject modules
    b.require('./browser/injected_node_modules/hb-service-h-dev/index.js', {
      expose: 'hb-service-h-dev'
    });
    b.require('./browser/injected_node_modules/hb-service-config/index.js', {
      expose: 'hb-service-config'
    });

    return b.bundle()
      .pipe(source('index.js'))
      .pipe(buffer())
      // .pipe(gulp.dest(config.srcDir));
      .pipe(gulp.dest(config.root + '/tmp-browser'));
  });

  // TODO: copying bower_components not working
  gulp.task('browser:resources', ['less'], function () {

    fse.emptyDirSync(config.root + '/tmp-browser');

    var resources = [
      config.srcDir + '/index.html',
      config.srcDir + '/index.bundle.css',
      config.srcDir + '/elements/**/*',
      config.srcDir + '/bower_components/**/*'
    ];

    return gulp.src(resources, { base: config.srcDir })
      .pipe(gulp.dest(config.root + '/tmp-browser'));
  });

  /**
   * Depends on the tmp-browser directory!
   */
  gulp.task('browser:polybuild', ['less', 'browser:js', 'browser:resources'], function () {

    // return gulp.src(config.srcDir + '/index.html')

    return gulp.src(config.root + '/tmp-browser/index.html')
      // maximumCrush should uglify the js
      .pipe(polybuild({ maximumCrush: true }))
      // remove debugging (debugger, console.*, alert)
      .pipe($.if(isJs, $.stripDebug()))
      .pipe($.if('index.build.html', $.rename('index.html')))
      .pipe($.size({
        title: 'distribute',
        showFiles: true,
        gzip: true
      }))
      .pipe(gulp.dest(config.distDir));

  });

  gulp.task('browser:distribute', function () {

    fse.emptyDirSync(config.distDir);

    runSequence(['browser:polybuild', 'browser:copy-ace'])
  });
};
