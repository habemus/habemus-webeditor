// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var fileTree = require('./file-tree')({
    hfs: habemus.services.hfs,
  });
  var tabbedEditor = require('./tabbed-editor')({
    fileTree: fileTree,
    hfs: habemus.services.hfs,
    ace: window.ace
  });

  return Bluebird.resolve();
};