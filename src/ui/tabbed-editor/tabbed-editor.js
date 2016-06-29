const EditorManager = require('./editor-manager');

/**
 * TabbedEditor constructor
 * @param {Object} options
 */
function TabbedEditor(options) {

  // if (!options.fileTree) { throw new Error('fileTree is required'); }
  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.ace) { throw new Error('ace is required'); }

  // this.fileTree = options.fileTree;
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
  this.editorManager = new EditorManager({
    hfs: this.hfs,
    ace: this.ace,
  });

  /**
   * Listen to select events on the tabs element
   */
  this.tabs.addEventListener('iron-select', function (e) {
    var filepath = tabs.selected;

    this.activeFile = filepath;
    // open an editor and set it not to be persistent
    this.editorManager.openEditor(filepath, {
      persistent: true
    });

  }.bind(this));

  /**
   * When tabs emit a close-intention, destroy the editor and
   * confirm closing
   */
  this.tabs.addEventListener('close-intention', function (e) {

    var filepath = e.detail.item.path;

    // destroy the corresponding editor
    this.editorManager.destroyEditor(filepath);

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

  this.editorManager.attach(containerElement);

  this.containerElement = containerElement;
};

/**
 * Opens a non-persistent editor with the required file
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.viewFile = function (filepath) {

  if (this.tabs.getTab(filepath)) {
    this.tabs.select(filepath);
    return Bluebird.resolve();
  }

  // undo selection on tabs
  this.tabs.clearSelection();

  return this.editorManager.openEditor(filepath, {
    persistent: false
  })
  .then(function (fileEditor) {

    // once any changes happen on the file editor,
    // effectively open the file
    fileEditor.once('change', this.openFile.bind(this, filepath));

    return;
  }.bind(this));
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

  if (this.tabs.getTab(filepath)) {
    this.tabs.select(filepath);
    return Bluebird.resolve();
  }

  // open a persistent editor
  return this.editorManager.openEditor(filepath, { persistent: true })
    .then(function (fileEditor) {

      // create new tabData object
      var tabData = {
        // make the tab be identified by the path
        id: filepath,
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
  this.editorManager.destroyEditor(filepath);

  return Bluebird.resolve();
};

/**
 * Saves the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveFile = function (filepath) {
  return this.editorManager.getEditor(filepath).save().then(function () {
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
