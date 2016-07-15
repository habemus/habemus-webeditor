const browserify = require('browserify');
const source     = require('vinyl-source-stream');
const buffer     = require('vinyl-buffer');
const gutil      = require('gulp-util');

const polybuild  = require('polybuild');

const fse        = require('fs-extra');

module.exports = function (gulp, $, config) {
  gulp.task('browser:js', function () {
    // set up the browserify instance on a task basis
    var b = browserify({
      entries: config.srcDir + '/index.js',
      debug: true,

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
      .pipe(source('index.bundle.js'))
      .pipe(buffer())
      .pipe(gulp.dest(config.srcDir));
      // .pipe(gulp.dest(config.root + '/tmp-browser'));
  });

  // TODO: copying bower_components not working
  // gulp.task('browser:resources', ['less'], function () {

  //   var resources = [
  //     config.srcDir + '/index.html',
  //     config.srcDir + '/index.bundle.css',
  //     config.srcDir + '/elements/**/*',
  //     config.srcDir + '/bower_components/**/*'
  //   ];

  //   return gulp.src(resources, { base: config.srcDir })
  //     .pipe(gulp.dest(config.root + '/tmp-browser'));
  // });

  gulp.task('browser:build', ['browser:js']);
};
