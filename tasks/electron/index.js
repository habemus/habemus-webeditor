// native
const proc = require('child_process');

// third-party
const electron = require('electron-prebuilt');

module.exports = function (gulp, $, config) {
  gulp.task('electron:develop', () => {

    // LESS autorecompile
    gulp.watch(config.srcDir + '/**/*.less', ['less']);

    // spawn electron
    var child = proc.spawn(electron, ['environments/electron/main.js'], {
      env: {
        NODE_ENV: 'development',
      }
    });
  });
  
  require('./distribute')(gulp, $, config);
}
