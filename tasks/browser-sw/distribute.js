// third-party
const fse         = require('fs-extra');
const mergeStream = require('merge-stream');
const runSequence = require('run-sequence');
var browserSync   = require('browser-sync').create();

const auxBrowserify = require('./browserify');

// HABEMUS.IO google analytics script
const GA_SCRIPT = `<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-71194663-5', 'auto');
  ga('send', 'pageview');

</script>`;

module.exports = function (gulp, $, config) {

  const TMP_DIR  = config.root + '/docker/browser-sw/tmp';
  const DIST_DIR = config.root + '/docker/browser-sw/dist';

  const COMMON_INJECTIONS = {
    'habemus-editor-services': {
      require: './src/environments/browser-sw/injected_node_modules/habemus-editor-services',
      expose: 'habemus-editor-services',
    },
    'habemus-editor-ui': {
      require: './src/environments/browser-sw/injected_node_modules/habemus-editor-ui',
      expose: 'habemus-editor-ui',
    },
    'habemus-editor-urls': {
      require: './src/environments/browser-sw/injected_node_modules/habemus-editor-urls.js',
      expose: 'habemus-editor-urls'
    },
    'habemus-editor-initialize': {
      require: './src/environments/browser-sw/injected_node_modules/habemus-editor-initialize',
      expose: 'habemus-editor-initialize',
    }
  };

  /**
   * Editor's bundle
   */
  gulp.task('browser-sw:js:editor', function () {

    fse.removeSync(TMP_DIR + '/index.browser-sw-bundle.js');

    return auxBrowserify.createBrowserifyPipe({
      entry: config.srcDir + '/index.js',

      // careful not to overwrite the original index.js
      destFilename: 'index.browser-sw-bundle.js',

      // inject modules
      injections: [
        COMMON_INJECTIONS['habemus-editor-services'],
        COMMON_INJECTIONS['habemus-editor-ui'],
        COMMON_INJECTIONS['habemus-editor-urls'],
        COMMON_INJECTIONS['habemus-editor-initialize'],
      ],
    })
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.stripDebug())
    .pipe($.uglify())
    .pipe($.size())
    .pipe(gulp.dest(TMP_DIR));
  });

  /**
   * Service worker's bundle
   * Goes directly to DIST_DIR
   */
  gulp.task('browser-sw:js:service-worker', function () {

    fse.removeSync(TMP_DIR + '/service-worker.js');

    return auxBrowserify.createBrowserifyPipe({
      entry: [
        config.root + '/src/environments/browser-sw/service-worker/index.js',
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
    .pipe($.stripDebug())
    .pipe($.replace('arguments.callee', '(function () {})'))
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.uglify())
    .pipe($.size())
    .pipe(gulp.dest(DIST_DIR));
  });

  /**
   * Inspector's bundle.
   * Goes directly to DIST_DIR
   */
  gulp.task('browser-sw:js:inspector', function () {

    fse.removeSync(TMP_DIR + '/inspector.js');

    return auxBrowserify.createBrowserifyPipe({
      entry: [
        config.root + '/src/environments/browser-sw/inspector/index.js',
      ],
      destFilename: 'inspector.js',

      // inject modules
      injections: [

      ],
    })
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.stripDebug())
    .pipe($.uglify())
    .pipe($.size())
    .pipe(gulp.dest(DIST_DIR));
  });

  /**
   * Auxiliary task that compiles all three javascripts
   */
  gulp.task('browser-sw:js', [
    'browser-sw:js:editor',
    'browser-sw:js:service-worker',
    'browser-sw:js:inspector',
  ]);

  /**
   * Ensures temporary files are ready.
   */
  gulp.task('browser-sw:tmp', ['browser-sw:js'], function () {
    return gulp.src('src/**/*')
      .pipe(gulp.dest(TMP_DIR));
  });

  /**
   * Optimizes all files into a single html, js and css.
   */
  gulp.task('browser-sw:polybuild', function () {

    return gulp.src(TMP_DIR + '/index.browser-sw.html')
      .pipe($.vulcanize({
        inlineScripts: true,
        inlineCss: true,
        stripComments: true
      }))
      .pipe($.crisper())
      // move static resources
      // TODO: improve replacing strategy
      // .pipe($.if(
      //   'index.browser-sw.html',
      //   $.replace(
      //     'index.browser-sw.js',
      //     '/static/index.browser-sw.js'
      //   )
      // ))
      .pipe($.if(
        'index.browser-sw.html',
        $.replace(
          'src="resources/',
          'src="/static/'
        )
      ))
      .pipe($.if(
        'index.browser-sw.html',
        $.replace(
          'template_url=/resources/blank-project.zip',
          'template_url=/static/blank-project.zip'
        )
      ))
      .pipe($.if(
        'index.browser-sw.html',
        $.replace(
          'url("bower_components/',
          'url("/static/'
        )
      ))
      // add analytics script
      .pipe($.if('index.browser-sw.html', $.cheerio(($find, file, done) => {
        $find('body').append(GA_SCRIPT);
        done();
      })))
      // rename index.html file
      .pipe($.if('index.browser-sw.html', $.rename('index.html')))
      .pipe($.size({
        title: 'distribute',
        showFiles: true,
        // gzip: true
      }))
      .pipe(gulp.dest(DIST_DIR));
  });

  gulp.task('browser-sw:copy-resources', function () {

    var aceResources = gulp
      .src(TMP_DIR + '/bower_components/ace-builds/src-noconflict/**/*')
      .pipe(gulp.dest(DIST_DIR));

    var commonResources = gulp.src(TMP_DIR + '/resources/**/*')
      .pipe(gulp.dest(DIST_DIR + '/static'));

    var fonts = gulp.src([
      TMP_DIR + '/bower_components/open-sans-fontface/**/*',
      TMP_DIR + '/bower_components/source-code-pro/**/*',
    ], { base: TMP_DIR + '/bower_components' })
    .pipe(gulp.dest(DIST_DIR + '/static'));

    var merged = mergeStream(aceResources, commonResources);
    merged.add(fonts);

    return merged;
  });

  gulp.task('browser-sw:distribute', function () {
    fse.removeSync(TMP_DIR);
    fse.removeSync(DIST_DIR);

    return runSequence(
      'browser-sw:tmp',
      'browser-sw:polybuild',
      'browser-sw:copy-resources'
    );
  });

  /**
   * Serves the dist version
   * Emulates the file structure that should be in production.
   */
  gulp.task('browser-sw:serve-dist', function () {
    return browserSync.init({
      port: process.env.EDITOR_PORT || 3000,
      server: {
        baseDir: DIST_DIR,
        routes: {
          '/static': DIST_DIR,
        }
      },
      open: true,
    });
  });

};
