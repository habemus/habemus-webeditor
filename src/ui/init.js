// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var tabbedEditor = require('./tabbed-editor')({
    hDev: habemus.services.hDev,
    ace: window.ace,
    localStorage: habemus.services.localStorage,
  });

  var fileTree = require('./file-tree')({
    hDev: habemus.services.hDev,
    tabbedEditor: tabbedEditor,

    rootName: options.projectName,
  });

  habemus.ui = {};
  habemus.ui.fileTree     = fileTree;
  habemus.ui.tabbedEditor = tabbedEditor;

  return Bluebird.resolve();
};