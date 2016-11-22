// third-party
const runSequence = require('run-sequence');
const fse         = require('fs-extra');

// polymer-build studies. Not working yet
const polymerBuild = require('polymer-build');
const mergeStream  = require('merge-stream');

var browserSync    = require('browser-sync').create();

const jsRe = /.+\.js$/;

/**
 * Browserify auxiliary methods
 * @type {Object}
 */
const auxBrowserify = require('./browserify');

function isJs(file) {
  return jsRe.test(file.path);
};

module.exports = function (gulp, $, config) {

  const BROWSER_CLOUD_DIST_DIR = config.distDir + '/browser-cloud';

  /**
   * 
   */
  gulp.task('browser-cloud:js:inspector', function () {
    return auxBrowserify.createInspectorBrowserifyPipe({
      entry: config.root + '/src-inspector/index.js',
      destFilename: 'inspector.bundle.js',
      production: true
    })
    .pipe($.babel({
      presets: ['es2015']
    }))
    // .pipe($.uglify())
    // .pipe($.stripDebug())
    .pipe($.size({
      title: 'js:inspector',
      showFiles: true,
      gzip: true,
    }))
    .pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR));
  });

  /**
   * Browserifies editor's javascript
   */
  gulp.task('browser-cloud:js:editor', function () {
    return auxBrowserify.createEditorBrowserifyPipe({
      entry: config.srcDir + '/index.js',
      destFilename: 'index.browser-cloud-bundle.js',
      production: true,
    })
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.uglify())
    .pipe($.size({
      title: 'js:editor',
      showFiles: true,
      gzip: true
    }))
    .pipe(gulp.dest(config.root + '/tmp-browser-cloud'));
  });

  gulp.task('browser-cloud:js', ['browser-cloud:js:inspector', 'browser-cloud:js:editor']);

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
  gulp.task('browser-cloud:copy-ace', function () {
    var files = [
      config.srcDir + '/bower_components/ace-builds/src-noconflict/**/*',
    ];

    return gulp.src(files).pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR));
  });

  /**
   * Copies over language files
   * TODO: generalize copy-resources
   */
  gulp.task('browser-cloud:copy-languages', function () {
    return gulp.src(config.srcDir + '/resources/languages/*.json')
      .pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR + '/languages'));
  });

  /**
   * Copies browser required editor resources over to the temporary directory
   */
  gulp.task('browser-cloud:tmp-resources', ['less'], function () {

    fse.emptyDirSync(config.root + '/tmp-browser-cloud');

    var resources = [
      config.srcDir + '/index.browser-cloud.html',
      config.srcDir + '/index.bundle.css',
      config.srcDir + '/elements/**/*',
      config.srcDir + '/bower_components/**/*'
    ];

    return gulp.src(resources, { base: config.srcDir })
      .pipe(gulp.dest(config.root + '/tmp-browser-cloud'));
  });

  // gulp.task('browser-cloud:polymer-build', ['less', 'browser-cloud:js', 'browser-cloud:tmp-resources'], function () {


  //   fse.emptyDirSync(BROWSER_CLOUD_DIST_DIR);

  //   var project = new polymerBuild.PolymerProject({
  //     entrypoint: config.root + '/tmp-browser-cloud/index.html',
  //     sources: [config.root + '/tmp-browser-cloud/**/*'],
  //   });

  //   return mergeStream(project.sources(), project.dependencies())
  //     .pipe(project.analyzer)
  //     .pipe(project.bundler)
  //     .pipe(project.splitHtml())
  //     .pipe(gulp.dest('build-test'));
  // });

  /**
   * Depends on the tmp-browser-cloud directory!
   */
  gulp.task('browser-cloud:polybuild-editor', ['less', 'browser-cloud:js', 'browser-cloud:tmp-resources'], function () {

    return gulp.src(config.root + '/tmp-browser-cloud/index.browser-cloud.html')
      .pipe($.vulcanize({
        inlineScripts: true,
        inlineCss: true,
        stripComments: true
      }))
      .pipe($.crisper())
      // .pipe($.if('index.browser-cloud.js', $.stripDebug()))
      .pipe($.if('index.browser-cloud.js', $.uglify().on('error', function (err) {
        console.warn(err);
      })))
      // move static resources
      .pipe($.if('index.browser-cloud.html', $.replace('index.browser-cloud.js', '/static/editor/index.browser-cloud.js')))
      // rename index.html file
      .pipe($.if('index.browser-cloud.html', $.rename('index.html')))
      .pipe($.size({
        title: 'distribute',
        showFiles: true,
        // gzip: true
      }))
      .pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR));
  });

  /**
   * Serves the dist version
   * Emulates the file structure that should be in production.
   */
  gulp.task('browser-cloud:serve-dist', function () {
    browserSync.init({
      port: process.env.EDITOR_PORT,
      server: {
        baseDir: './dist/browser-cloud',
        routes: {
          '/static/editor': './dist/browser-cloud',
        }
      }
    });
  });


  gulp.task('browser-cloud:distribute', function () {

    fse.emptyDirSync(BROWSER_CLOUD_DIST_DIR);

    runSequence([
      'browser-cloud:polybuild-editor',
      'browser-cloud:copy-ace',
      'browser-cloud:copy-languages'
    ])
  });
};
