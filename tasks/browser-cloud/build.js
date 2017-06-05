// third-party
const runSequence = require('run-sequence');
const fse         = require('fs-extra');

// polymer-build studies. Not working yet
const polymerBuild = require('polymer-build');
const mergeStream  = require('merge-stream');

var browserSync    = require('browser-sync').create();

const jsRe = /.+\.js$/;

// HABEMUS.IO google analytics script
const GA_SCRIPT = `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-71194663-5', 'auto');
  ga('send', 'pageview');

</script>`;


// HABEMUS.IO olark
const OLARK_SCRIPT = `<script type="text/javascript" async> ;(function(o,l,a,r,k,y){if(o.olark)return; r="script";y=l.createElement(r);r=l.getElementsByTagName(r)[0]; y.async=1;y.src="//"+a;r.parentNode.insertBefore(y,r); y=o.olark=function(){k.s.push(arguments);k.t.push(+new Date)}; y.extend=function(i,j){y("extend",i,j)}; y.identify=function(i){y("identify",k.i=i)}; y.configure=function(i,j){y("configure",i,j);k.c[i]=j}; k=y._={s:[],t:[+new Date],c:{},l:a}; })(window,document,"static.olark.com/jsclient/loader.js");
/* custom configuration goes here (www.olark.com/documentation) */
olark.identify('7147-555-10-7685');</script>`;

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
    .pipe($.uglify())
    .pipe($.stripDebug())
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
   * Copies over font files
   * TODO: generalize copy-resources
   */
  gulp.task('browser-cloud:copy-fonts', function () {
    var files = [
      config.srcDir + '/bower_components/open-sans-fontface/**/*',
      config.srcDir + '/bower_components/source-code-pro/**/*',
    ];

    return gulp.src(files, { base: config.srcDir })
      .pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR));
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
   * Copies over image files
   * TODO: generalize copy-resources
   */
  gulp.task('browser-cloud:copy-images', function () {
    return gulp.src(config.srcDir + '/resources/img/**/*')
      .pipe(gulp.dest(BROWSER_CLOUD_DIST_DIR + '/img'));
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
      .pipe($.if('index.browser-cloud.js', $.stripDebug()))
      .pipe($.if(
        'index.browser-cloud.js',
        $.uglify().on('error', function (err) {
          console.warn(err);
        })
      ))
      // move static resources
      // TODO: improve replacing strategy
      .pipe($.if(
        'index.browser-cloud.html',
        $.replace(
          'index.browser-cloud.js',
          '/static/editor/index.browser-cloud.js'
        )
      ))
      .pipe($.if(
        'index.browser-cloud.html',
        $.replace(
          'src="resources/',
          'src="/static/editor/'
        )
      ))
      // add analytics script
      .pipe($.if('index.browser-cloud.html', $.cheerio(($find, file, done) => {
        $find('body').append(GA_SCRIPT);
        $find('body').append(OLARK_SCRIPT);
        done();
      })))
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
    return browserSync.init({
      port: process.env.EDITOR_PORT || 3000,
      server: {
        baseDir: './dist/browser-cloud',
        routes: {
          '/static/editor': './dist/browser-cloud',
        }
      },
      open: true,
    });
  });


  gulp.task('browser-cloud:distribute', function () {

    fse.emptyDirSync(BROWSER_CLOUD_DIST_DIR);

    runSequence([
      'browser-cloud:polybuild-editor',
      'browser-cloud:copy-ace',
      'browser-cloud:copy-fonts',
      'browser-cloud:copy-languages',
      'browser-cloud:copy-images'
    ])
  });
};
