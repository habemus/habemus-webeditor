// const browserify  = require('browserify');
// const source      = require('vinyl-source-stream');
// const buffer      = require('vinyl-buffer');
const gutil       = require('gulp-util');
// const envify      = require('envify/custom');
const runSequence = require('run-sequence');

const polybuild  = require('polybuild');

const fse        = require('fs-extra');

const jsRe = /.+\.js$/;

/**
 * Browserify auxiliary methods
 * @type {Object}
 */
const auxBrowserify = require('./aux-browserify');

function isJs(file) {
  return jsRe.test(file.path);
};

module.exports = function (gulp, $, config) {

  /**
   * 
   */
  gulp.task('browser:js:inspector', function () {
    return auxBrowserify.createInspectorBrowserifyPipe({
      entry: config.root + '/browser/injected_browser_scripts/inspector/index.js',
      destFilename: 'inspector.bundle.js',
    })
    .pipe($.uglify())
    .pipe($.stripDebug())
    .pipe($.size({
      title: 'js:inspector',
      showFiles: true,
      gzip: true,
    }))
    .pipe(gulp.dest(config.distDir + '/resources'));
  });

  /**
   * Browserifies editor's javascript
   */
  gulp.task('browser:js:editor', function () {
    return auxBrowserify.createEditorBrowserifyPipe({
      entry: config.srcDir + '/index.js',
      destFilename: 'index.js',
    })
    .pipe($.size({
      title: 'js:editor',
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest(config.root + '/tmp-browser'));
  });

  gulp.task('browser:js', ['browser:js:inspector', 'browser:js:editor']);

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

  /**
   * Copies browser required editor resources over to the temporary directory
   */
  gulp.task('browser:tmp-resources', ['less'], function () {

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
  gulp.task('browser:polybuild', ['less', 'browser:js', 'browser:tmp-resources'], function () {

    // return gulp.src(config.srcDir + '/index.html')

    return gulp.src(config.root + '/tmp-browser/index.html')
      // maximumCrush should uglify the js
      // .pipe(polybuild({ maximumCrush: true }))
      .pipe(polybuild({ maximumCrush: false }))
      // remove debugging (debugger, console.*, alert)
      // .pipe($.if(isJs, $.stripDebug()))
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
