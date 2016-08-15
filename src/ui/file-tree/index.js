// external habemus-modules
const happinessTree = require('happiness-tree');

module.exports = function (options) {

  if (!options.tabbedEditor) {
    throw new Error('tabbedEditor is required');
  }

  if (!options.iframeBrowser) {
    throw new Error('iframeBrowser is required');
  }

  // reference to the tabbed editor instance
  var tabbedEditor = options.tabbedEditor;

  // instantiate a tree navigator
  var tree = happinessTree({
    hDev: options.hDev,
    rootName: options.rootName,
    
    // the menu generators
    dirMenu: require('./dir-menu').bind(null, options),
    fileMenu: require('./file-menu').bind(null, options),
  });
  tree.attach(document.querySelector('#file-tree-container'));

  /**
   * Wire up the tree ui with the tabbedEditor
   */
  tree.uiAddTreeEventListener('dblclick', 'leaf', function (data) {
    tabbedEditor.openFile(data.model.path);
  });
  tree.uiAddTreeEventListener('click', 'leaf', function (data) {
    tabbedEditor.viewFile(data.model.path);
  });
  tabbedEditor.on('active-filepath-changed', function (current, previous) {

    if (tree.rootModel.getNodeByPath(current)) {

      // if the current filepath is in the tree
      // mark it as selected and deselect all others
      tree.uiSelect(current, {
        clearSelection: true
      });
    }
  });
  
  // run initial load
  tree.openDirectory('');

  return tree;
}