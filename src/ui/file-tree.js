// external habemus-modules
const happinessTree = require('happiness-tree');

module.exports = function (options) {

  if (!options.tabbedEditor) {
    throw new Error('tabbedEditor is required');
  }

  // reference to the tabbed editor instance
  var tabbedEditor = options.tabbedEditor;

  // instantiate a tree navigator
  var tree = happinessTree({
    hfs: options.hfs,
    rootName: 'my project'
  });
  tree.ui.attach(document.querySelector('#file-tree-container'));

  /**
   * Wire up the tree ui with the tabbedEditor
   */
  tree.ui.addTreeEventListener('dblclick', 'leaf', function (data) {
    tabbedEditor.openFile(data.model.path);
  });
  tree.ui.addTreeEventListener('click', 'leaf', function (data) {
    tabbedEditor.viewFile(data.model.path);
  });
  
  // run initial load
  tree.model.fsRead();

  return tree;
}