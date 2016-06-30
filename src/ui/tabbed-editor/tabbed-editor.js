// native dependencies
const util          = require('util');
const EventEmitter  = require('events');

// own dependencies
const EditorManager = require('./editor-manager');

// constants
const LS_KEY = 'habemus_editor_open_tabs';

/**
 * TabbedEditor constructor
 * @param {Object} options
 */
function TabbedEditor(options) {

  if (!options.hfs) { throw new Error('hfs is required'); }
  if (!options.ace) { throw new Error('ace is required'); }
  if (!options.localStorage) { throw new Error('localStorage is required'); }

  this.hfs = options.hfs;
  this.ace = options.ace;
  this.localStorage = options.localStorage;

  /**
   * Path to the active file.
   * @type {Boolean}
   */
  this.activeFilepath = false;

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
    var targetFilepath = tabs.selected;
    
    // keep reference to the path of the previous active file
    var previousActiveFilepath = this.activeFilepath;
    
    // open an editor and set it not to be persistent
    this.editorManager.openEditor(targetFilepath, {
      persistent: true
    }).then(function () {
      
      // set the new active filepath
      this._setActiveFilepath(targetFilepath);
      
    }.bind(this));

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

  // read last open tabs from localstorage and reopen the files
  var openTabs = this._lsReadOpenTabs();

  openTabs.forEach(function (filepath) {
    this.openFile(filepath);
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

util.inherits(TabbedEditor, EventEmitter);

// private methods
TabbedEditor.prototype._setActiveFilepath = function (filepath) {
  var previous = this.activeFilepath;
  
  this.activeFilepath = filepath;
  
  if (previous !== filepath) {
    this.emit(
      'active-filepath-changed',
      filepath,
      previous  
    )
  }
};

TabbedEditor.prototype._lsReadOpenTabs = function () {
  var openTabs = this.localStorage.getItem(LS_KEY);

  if (openTabs) {
    try {
      openTabs = JSON.parse(openTabs);
    } catch (e) {
      console.log('error reading open tabs from localStorage', e);
      openTabs = [];
    }
  } else {
    openTabs = [];
  }

  return openTabs;
};

TabbedEditor.prototype._lsStoreOpenTab = function (filepath) {
  var openTabs = this._lsReadOpenTabs();

  if (openTabs.indexOf(filepath) === -1) {
    openTabs.push(filepath);
  }

  this.localStorage.setItem(LS_KEY, JSON.stringify(openTabs));
};

TabbedEditor.prototype._lsRemoveOpenTab = function (filepath) {
  var openTabs = this._lsReadOpenTabs();

  var index = openTabs.indexOf(filepath);

  if (index !== -1) {
    openTabs.splice(index, 1);
  }

  this.localStorage.setItem(LS_KEY, JSON.stringify(openTabs));
};

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
  
  if (!filepath) {
    return Bluebird.reject(new Error('filepath is required'));
  }
  
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
    // set the active filepath manually
    this._setActiveFilepath(filepath);

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
  
  if (!filepath) { return Bluebird.reject(new Error('filepath is required')); }
  
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
      
      // set the activeFilepath manually
      this._setActiveFilepath(filepath);

      // mark the file as open in the localStorage
      this._lsStoreOpenTab(filepath);

      // associate the fileEditor events to the tab
      fileEditor.on('change', function () {

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
  // if tab exists, close it (the file may be in preview mode)
  if (this.tabs.getTab(filepath)) {
    this.tabs.closeTab(filepath);
  }
  
  // the editor always exists
  this.editorManager.destroyEditor(filepath);

  // remove the open tab from localstorage
  this._lsRemoveOpenTab(filepath);

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
  if (this.activeFilepath) {
    return this.saveFile(this.activeFilepath);
  } else {
    return Bluebird.resolve();
  }
};

/**
 * Closes the active file
 * @return {Bluebird}
 */
TabbedEditor.prototype.closeActiveFile = function () {
  if (this.activeFilepath) {
    return this.closeFile(this.activeFilepath);
  } else {
    return Bluebird.resolve();
  }
};

module.exports = TabbedEditor;
