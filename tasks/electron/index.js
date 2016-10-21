// native
const proc = require('child_process');

// third-party
const electron = require('electron-prebuilt');

module.exports = function (gulp, $, config) {
  gulp.task('develop-electron', () => {

    // LESS autorecompile
    gulp.watch(config.srcDir + '/**/*.less', ['less']);

    // spawn electron 
    var child = proc.spawn(electron, ['electron/main.js']);
  });
}