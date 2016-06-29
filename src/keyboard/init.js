// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var listener = new window.keypress.Listener();

  function _saveActiveFile() {
    habemus.ui.tabbedEditor.saveActiveFile();
  }

  function _closeActiveFile() {
    habemus.ui.tabbedEditor.closeActiveFile();
  }

  listener.simple_combo('cmd s', _saveActiveFile);
  listener.simple_combo('ctrl s', _saveActiveFile);

  listener.simple_combo('cmd w', _closeActiveFile);
  listener.simple_combo('ctrl w', _closeActiveFile);

  return Bluebird.resolve();
};