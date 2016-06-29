const EditorContainer = require('./editor-container');

/**
 * TabbedEditor constructor
 * @param {Object} options
 */
function TabbedEditor(options) {

  if (!options.fileTree) { throw new Error('fileTree is required'); }
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.ace) { throw new Error('ace is required'); }

  this.fileTree = options.fileTree;
  this.hfs      = options.hfs;
  this.ace      = options.ace;

  /**
   * Path to the active file.
   * @type {Boolean}
   */
  this.activeFile = false;

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

    this.activeFile = filepath;

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
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
TabbedEditor.prototype.attach = function (containerElement) {
  containerElement.appendChild(this.tabs);

  this.editorContainer.attach(containerElement);

  this.containerElement = containerElement;
};

/**
 * Attempts to open an in-memory file editor
 * for the given filepath.
 *
 * If the file is not open, create the editor,
 * load it and then open its tab
 * 
 * @param  {String} filepath
 * @return {Bluebird -> tabData}
 */
TabbedEditor.prototype.openFile = function (filepath) {

  // check if the file is already open
  var tab = this.tabs.getTab(filepath);

  if (tab) {
    this.tabs.select(tab.id);
    return;
  }

  return this.editorContainer.createEditor(filepath)
    .then(function (fileEditor) {

      // create new tabData object
      var tabData = {
        // make the tab be identified by the path
        id: filepath,

        name: filepath,
        path: filepath,
      };

      // add to the tabs and select it
      this.tabs.createTab(tabData, { select: true });

      // associate the fileEditor events to the tab
      fileEditor.aceEditor.on('change', function () {

        if (fileEditor.changeManager.hasUnsavedChanges()) {

          this.tabs.setTabData(filepath, 'status', 'unsaved');

        } else {

          this.tabs.setTabData(filepath, 'status', '');

        }
      }.bind(this));
    }.bind(this));
};

/**
 * Closes the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.closeFile = function (filepath) {
  this.tabs.closeTab(filepath);
  this.editorContainer.destroyEditor(filepath);

  return Bluebird.resolve();
};

/**
 * Saves the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveFile = function (filepath) {
  return this.editorContainer.getEditor(filepath).save().then(function () {
    this.tabs.setTabData(filepath, 'status', '');
  }.bind(this));
};

/**
 * Saves the active file
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveActiveFile = function () {
  if (this.activeFile) {
    return this.saveFile(this.activeFile);
  } else {
    return Bluebird.resolve();
  }
};

/**
 * Closes the active file
 * @return {Bluebird}
 */
TabbedEditor.prototype.closeActiveFile = function () {
  if (this.activeFile) {
    return this.closeFile(this.activeFile);
  } else {
    return Bluebird.resolve();
  }
};

module.exports = TabbedEditor;
