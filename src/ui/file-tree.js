// external habemus-modules
const happinessTree = require('happiness-tree');

module.exports = function (options) {

  var tree = happinessTree({
    hfs: options.hfs,
    rootName: 'my project'
  });

  tree.ui.attach(document.querySelector('#file-tree-container'));

  tree.model.fsLoadContents();

  return tree;
}