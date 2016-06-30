// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var tabbedEditor = require('./tabbed-editor')({
    hfs: habemus.services.hfs,
    ace: window.ace,
    localStorage: habemus.services.localStorage,
  });

  var fileTree = require('./file-tree')({
    hfs: habemus.services.hfs,
    tabbedEditor: tabbedEditor,
  });

  habemus.ui = {};
  habemus.ui.fileTree     = fileTree;
  habemus.ui.tabbedEditor = tabbedEditor;

  return Bluebird.resolve();
};