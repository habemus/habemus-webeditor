const EditorContainer = require('./editor-container');

function TabbedEditor(options) {

  if (!options.fileTree) { throw new Error('fileTree is required'); }
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.ace) { throw new Error('ace is required'); }

  this.fileTree = options.fileTree;
  this.hfs      = options.hfs;
  this.ace      = options.ace;

  // tabs
  this.tabs = document.createElement('habemus-editor-tabs');

  // editor container manages open editors
  // it is not a Polymer element because ace-editor
  // appears to lose performance inside shady/shadow dom.
  // at least, it was not made for perfectly working inside shadow dom.
  // TODO: investigate ace editor and shadow/shady dom.
  this.editorContainer = new EditorContainer({
    hfs: this.hfs,
    ace: this.ace,
  });

  /**
   * Listen to select events on the fileTree ui
   */
  this.fileTree.ui.addTreeEventListener('dblclick', 'leaf', function (data) {

    var path = data.model.path;

    this.openFile(path);

  }.bind(this));

  /**
   * Listen to select events on the tabs element
   */
  this.tabs.addEventListener('iron-select', function (e) {
    var filepath = tabs.selected;
    this.editorContainer.activateEditor(filepath);
  }.bind(this));

  /**
   * When tabs emit a close-intention, destroy the editor and
   * confirm closing
   */
  this.tabs.addEventListener('close-intention', function (e) {

    var filepath = e.detail.item.path;

    // destroy the corresponding editor
    this.editorContainer.destroyEditor(filepath);

    console.log('closed', filepath)

    // confirm the close
    e.detail.confirm();
  }.bind(this));

  // tabs.addEventListener('create-intention', function (e) {
  //   setTimeout(function () {

  //     var tab = {
  //       id: 'f-new',

  //       name: 'untitled',
  //       path: 'somepath',

  //       status: 'preview',
  //     };

  //     e.detail.confirm(tab);

  //   }, 100);
  // });
}

/**
 * Attempts to open an in-memory file editor
 * for the given filepath.
 *
 * If the file is not open, create the editor,
 * load it and then open its tab
 * 
 * @param  {String} filepath
 * @return {Bluebird -> tabData}          [description]
 */
TabbedEditor.prototype.openFile = function (filepath) {

  // check if the file is already open
  var tab = this.tabs.getTab(filepath);

  if (tab) {
    this.tabs.select(tab.id);
    return;
  }

  return this.editorContainer.createEditor(filepath)
    .then(function () {

      // create new tabData object
      var tabData = {
        // make the tab be identified by the path
        id: filepath,

        name: filepath,
        path: filepath,
      };

      // add to the tabs and select it
      this.tabs.createTab(tabData, { select: true });
    }.bind(this));
};

TabbedEditor.prototype.closeFile = function (filepath) {

};

TabbedEditor.prototype.attach = function (containerElement) {
  containerElement.appendChild(this.tabs);

  this.editorContainer.attach(containerElement);

  this.containerElement = containerElement;
}

module.exports = TabbedEditor;