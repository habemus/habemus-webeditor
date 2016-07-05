// native dependencies
const util          = require('util');
const EventEmitter  = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const EditorManager = require('../editor-manager');

// constants
const LS_PREFIX = 'habemus_editor_tabbed_editor_';

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
  this.tabsEl = document.createElement('habemus-editor-tabs');

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
  this.tabsEl.addEventListener('iron-select', function (e) {
    var targetFilepath = tabs.selected;
    
    this.openFile(targetFilepath);

  }.bind(this));

  /**
   * When tabs emit a close-intention, destroy the editor and
   * confirm closing
   */
  this.tabsEl.addEventListener('close-intention', function (e) {

    this.closeFile(e.detail.item.path);

  }.bind(this));
  
  this.tabsEl.addEventListener('tabs-changed', function (e) {

    var tabs = this.tabsEl.get('tabs');
    this._lsSaveSessionData('tabs', tabs);
    
  }.bind(this));

  // read last session's data from localstorage
  // and restore it
  var lastSession = this._lsReadSessionData();

  this.restoreSession(lastSession);
}

util.inherits(TabbedEditor, EventEmitter);

/**
 * Reads session data from localStorage
 * @return {Object}
 *         - tabs
 *         - activeFilepath
 */
TabbedEditor.prototype._lsReadSessionData = function () {
  var sessionData = this.localStorage.getItem(LS_PREFIX + 'session');
  
  if (sessionData) {
    try {
      sessionData = JSON.parse(sessionData);
    } catch (e) {
      console.warn(
        'Error reading session data from localStorage. Reseting session.');
    }
  } else {
    sessionData = {};
  }
  
  return sessionData;
};

/**
 * Saves session data to the localStorage
 * @param  {String} dataKey
 * @param  {*} dataValue
 */
TabbedEditor.prototype._lsSaveSessionData = function (dataKey, dataValue) {
  if (!dataKey) { throw new Error('Key is required'); }

  var sessionData = this._lsReadSessionData();
  
  sessionData[dataKey] = dataValue;
  
  this.localStorage.setItem(LS_PREFIX + 'session', JSON.stringify(sessionData));
};

/**
 * Sets the activeFilepath property
 * emits event and saves data to the session on localStorage
 * if changes happen
 * @param {String} filepath
 */
TabbedEditor.prototype._setActiveFilepath = function (filepath) {
  var previous = this.activeFilepath;
  
  this.activeFilepath = filepath;
  
  if (previous !== filepath) {
    this._lsSaveSessionData('activeFilepath', filepath);
    this.emit('active-filepath-changed', filepath, previous);
  }
};

/**
 * Checks if there is any selected tab.
 * If none is selected, checks whether there are tabs available
 * and if there are, selects the last one.
 */
TabbedEditor.prototype._ensureSelectedTab = function () {
  
  var tabsEl = this.tabsEl;
  
  // run the selection ensuring in the process' nextTick
  // so that the tabs element is guaranteed to have been rendered
  setTimeout(function () {
    
    if (!tabsEl.selected && tabsEl.tabs.length > 0) {
      tabsEl.selectIndex(0);
    }
    
  }, 0);
  
};

/**
 * Restores a previous session
 * by opening tabs and selecting the previous
 * activeFilepath
 * @param {Array} tabs
 * @param {String} activeFilepath
 */
TabbedEditor.prototype.restoreSession = function (session) {

  var tabs = session.tabs || [];
  var activeFilepath = session.activeFilepath;

  // create the tabs and select the activeFilepath
  tabs.forEach(function (tabData) {

    if (!this.tabsEl.getTab(tabData.id)) {
      this.tabsEl.createTab(tabData, {
        select: (tabData.path === activeFilepath)
      });
    }

  }.bind(this));
  
  // ensure there is a selected tab
  this._ensureSelectedTab();
};

/**
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
TabbedEditor.prototype.attach = function (containerElement) {
  containerElement.appendChild(this.tabsEl);

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
  
  if (this.tabsEl.getTab(filepath)) {
    this.tabsEl.select(filepath);
    return Bluebird.resolve();
  }

  // undo selection on tabs
  this.tabsEl.clearSelection();

  // open a non-persistent editor and set focus to it
  return this.editorManager.openEditor(filepath, {
    persistent: false,
    focus: true
  })
  .then(function (fileEditor) {
    // set the active filepath manually
    // as this operation does not modify tab selection
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
 * @param  {Object} options
 *                  - select: Boolean
 * @return {Bluebird -> tabData}
 */
TabbedEditor.prototype.openFile = function (filepath) {
  
  if (!filepath) { return Bluebird.reject(new Error('filepath is required')); }

  if (this.tabsEl.getTab(filepath)) {
    // tab exists: ensure it is selected
    this.tabsEl.select(filepath);
    
  } else {
    // create the tab
    var newTabData = {
      path: filepath
    };
    
    // create the tab and select it
    this.tabsEl.createTab(newTabData, { select: true });
  }

  // open a persistent editor and set the focus to it
  return this.editorManager.openEditor(filepath, {
      persistent: true,
      focus: true,
    })
    .then(function (fileEditor) {

      this._setActiveFilepath(filepath);
      
      // associate the fileEditor events to the tab
      fileEditor.on('change', function () {
        if (fileEditor.changeManager.hasUnsavedChanges()) {
          this.tabsEl.setTabData(filepath, 'status', 'unsaved');
        } else {
          this.tabsEl.setTabData(filepath, 'status', '');
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

  var fileEditor = this.editorManager.getEditor(filepath);

  if (fileEditor && fileEditor.changeManager.hasUnsavedChanges()) {

    // TODO: prompt the user for confirmation instead of preventing close
    // prevent unsaved files from being closed
    alert(filepath + ' has unsaved changes');

    return Bluebird.reject(new Error('unsaved changes'));

  } else {

    // if tab exists, close it
    // (the file may be in preview mode)
    if (this.tabsEl.getTab(filepath)) {
      this.tabsEl.closeTab(filepath);
    }
    
    // ensure there is a selected tab
    this._ensureSelectedTab();

    // if fileEditor exists, destroy it
    // (the tab may have been opened with no corresponding editor)
    if (fileEditor) {
      return this.editorManager.destroyEditor(filepath);
    } else {
      return Bluebird.resolve();
    }
  }
};

/**
 * Saves the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveFile = function (filepath) {
  return this.editorManager.getEditor(filepath).save().then(function () {
    this.tabsEl.setTabData(filepath, 'status', '');
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
