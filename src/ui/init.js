// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var structure = document.querySelector('#structure');

  var iframeBrowser = require('./iframe-browser')({
    hDev: habemus.services.hDev,
    structure: structure,
  });

  var tabbedEditor = require('./tabbed-editor')({
    hDev: habemus.services.hDev,
    ace: window.ace,
    localStorage: habemus.services.localStorage,
  });

  var fileTree = require('./file-tree')({
    hDev: habemus.services.hDev,
    tabbedEditor: tabbedEditor,
    iframeBrowser: iframeBrowser,

    rootName: options.projectName,
  });

  habemus.ui = {};
  habemus.ui.structure     = structure;
  habemus.ui.iframeBrowser = iframeBrowser;
  habemus.ui.fileTree      = fileTree;
  habemus.ui.tabbedEditor  = tabbedEditor;

  return Bluebird.resolve();
};