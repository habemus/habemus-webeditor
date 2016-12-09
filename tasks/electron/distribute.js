// native
const path = require('path');
const child_process = require('child_process');

// third-party
const runSequence      = require('run-sequence');
const fse              = require('fs-extra');
const electronPackager = require('electron-packager');
const Bluebird         = require('bluebird');

const jsRe = /.+\.js$/;

function isJs(file) {
  return jsRe.test(file.path);
}

module.exports = function (gulp, $, config) {

  const ELECTRON_DIST_DIR = config.distDir + '/electron';
  const ELECTRON_TMP_DIR  = config.root + '/tmp-electron';
  
  gulp.task('electron:copy-env', function () {
    return gulp.src('environments/electron/**/*')
      // .pipe(
      //   $.if(
      //     function isElectronMain(file) {
      //       return file.path === path.join(__dirname, '../../environments/electron/main.js');
      //     },
      //     $.replace('../../src/index.electron.html', 'index.html')
      //   )
      // )
      .pipe(gulp.dest(ELECTRON_TMP_DIR + '/environments/electron'));
  });
  
  gulp.task('electron:copy-src', function () {
    return gulp.src([
        'src/**/*',
        '!src/**/*.less',
        
        // browser-cloud dev files
        '!src/index.browser-cloud.html',
        '!src/index.browser-sw.html',
        '!src/index.browser-cloud-bundle.js',
      ], {
        // base: 'src',
      })
      // .pipe(
      //   $.if(
      //     function isIndexHTML(file) {
      //       return file.path === path.join(__dirname, '../../src/index.electron.html');
      //     },
      //     $.rename('index.html')
      //   )
      // )
      .pipe(gulp.dest(ELECTRON_TMP_DIR + '/src'))
  });
  
  gulp.task('electron:npm-install', function () {
    
    fse.ensureDirSync(path.join(__dirname, '../..'));
    
    fse.copySync(
      path.join(__dirname, '../../package.json'),
      ELECTRON_TMP_DIR + '/package.json'
    );
    
    return new Bluebird((resolve, reject) => {
      
      var ch = child_process.exec('npm install --production', {
        cwd: ELECTRON_TMP_DIR
      });
      
      ch.stdout.pipe(process.stdout);
      ch.stderr.pipe(process.stderr);
      
      ch.on('exit', function (code) {
        if (code === 0) {
          resolve();
        } else {
          reject('exited with error code ' + code);
        }
      });
      
    });
  });
  
  gulp.task('electron:copy', [
    'electron:copy-src',
    'electron:copy-env',
    'electron:npm-install'
  ]);
  
  gulp.task('electron:package', function () {
    return Bluebird.promisify(electronPackager)({
      dir: ELECTRON_TMP_DIR,
      out: ELECTRON_DIST_DIR,
    });
  });

  gulp.task('electron:distribute', function () {
    
    return runSequence(
      'electron:copy',
      'electron:package'
    );
    
  });
};
