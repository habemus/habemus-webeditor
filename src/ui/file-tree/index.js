// external habemus-modules
const happinessTree = require('habemus-ui-file-tree');

module.exports = function (habemus, options) {

  // reference to the tabbed editor instance
  var tabbedEditor = habemus.ui.tabbedEditor;
  if (!tabbedEditor) { throw new Error('tabbedEditor is required'); }

  // instantiate a tree navigator
  var tree = happinessTree({

    // apis
    hDev: habemus.services.hDev,
    uiDialogs: habemus.services.dialogs,
    uiNotifications: habemus.services.notification,

    rootName: habemus.services.config.projectName,

    // the menu generators
    dirMenu: require('./dir-menu')(habemus, options),
    fileMenu: require('./file-menu')(habemus, options),

    // translation function
    translate: habemus.services.language.t,

    config: {
      enablePreload: true,
      // TODO: configure maxFileUploadSize
      maxFileUploadSize: '20MB',
    }
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
  tree.uiAddTreeEventListener('contextmenu', 'leaf', function (data) {
    tabbedEditor.viewFile(data.model.path);
  });
  tabbedEditor.on('active-filepath-changed', function (current, previous) {
    try {
      // if the current filepath is in the tree
      // mark it as selected and deselect all others
      tree.uiSelect(current, {
        clearSelection: true
      });
    } catch (e) {
      // discard error. probably the node is not in the tree
    }
  });
  
  /**
   * Listen to collapse trigger events
   * TODO: improve code organization.
   * A 'left-panel' component might be required.
   */
  var collapseTrigger = document.querySelector('#left-panel-collapse-trigger');
  collapseTrigger.addEventListener('click', function (e) {
    habemus.ui.structure.uncollapse('left');
  });
  
  // run initial load
  tree.openDirectory('');

  return tree;
}