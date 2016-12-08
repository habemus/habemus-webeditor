// native dependencies
const util         = require('util');
const EventEmitter = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

const FileEditor = require('hab-ui-file-editor');

const CLEAN_UP_INTERVAL = 4000;
const CLEAN_UP_DELAY    = 10000;

/**
 * Editor container constructor
 * @param {Object} options
 *        - ace
 *        - hDev
 */
function EditorManager(options) {
  
  /**
   * Reference to the ace global variable
   */
  this.ace = options.ace;
  
  /**
   * The HFS Api to be used by all editors
   */
  this.hDev = options.hDev;
  
  /**
   * The editor manager wrapping element.
   * All editor elements will be appended to this element.
   */
  this.element = document.createElement('div');
  this.element.style.height = 'calc(100% - 40px)';

  /**
   * Array to store a reference to 
   * all fileEditors created
   * @type {Array}
   */
  this._fileEditors = [];
  
  /**
   * Set an interval for temporary fileEditor clean up
   */
  this._setCleanUpInterval(CLEAN_UP_INTERVAL);
}

util.inherits(EditorManager, EventEmitter);

/**
 * Editors may be flagged as temporary.
 * Temporary editors are cleaned up in the cleanup interval.
 */
EditorManager.prototype._setCleanUpInterval = function (ms) {
  this._cleanUpInterval = setInterval(function () {
    
    this._fileEditors.forEach(function (fileEditor) {
      if (!fileEditor.persistent &&
          (Date.now() - fileEditor.createdAt) > CLEAN_UP_DELAY && 
          fileEditor.element.getAttribute('hidden')) {
        // only destroy non-persistent and hidden editors
        // TODO: make the hidden flag become internal to the fileEditor
        this.destroyEditor(fileEditor.filepath);
      }
    }.bind(this));
    
  }.bind(this), ms);
};

EditorManager.prototype._clearCleanUpInterval = function (ms) {
  clearInterval(this._cleanUpInterval);
};

/**
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
EditorManager.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;
  this.containerElement.appendChild(this.element);
};

/**
 * Creates a file editor object
 * attaches to the container and adds to the _fileEditors array
 * 
 * Flags the editor's persistence
 */
EditorManager.prototype.createEditor = function (editorOptions) {
  // create an element for the editor
  var editorEl = document.createElement('div');
  editorEl.style.height = '100%';

  // instantiate a file editor
  var fileEditor = new FileEditor(
    this.ace,
    editorEl,
    this.hDev
  );

  /////////////////////
  // EVENT LISTENERS //
  editorEl.addEventListener('contextmenu', function (e) {
    this.emit('editor:contextmenu', {
      fileEditor: fileEditor,
      event: e,
    });
  }.bind(this));
  
  fileEditor.aceEditor.on('focus', function (e) {
    this.emit('editor:focus', {
      fileEditor: fileEditor,
      event: e,
    });
  }.bind(this));

  ////////////////////////
  // STYLES AND OPTIONS //
  
  // theme
  // fileEditor.aceEditor.setTheme('ace/theme/monokai');
  fileEditor.aceEditor.setTheme('ace/theme/habemus-dark');

  // apply styles
  fileEditor.element.style.fontFamily = 'Source Code Pro';
  // fileEditor.element.style.fontFamily = 'Monaco';
  // fileEditor.element.style.fontFamily = 'Menlo';
  fileEditor.element.style.fontSize = '15px';

  // set aceEditor options
  fileEditor.aceEditor.setOption('scrollPastEnd', true);
  fileEditor.aceEditor.setHighlightActiveLine(true);
  
  fileEditor.aceEditor.getSession().setTabSize(2);
  // STYLES AND OPTIONS //
  ////////////////////////

  // append it to the element container
  this.element.appendChild(editorEl);
  
  // set the persistence flag
  // by default the editor is not persistent
  fileEditor.persistent = editorOptions.persistent || false;
  
  // set the creation timestamp onto the fileEditor
  fileEditor.createdAt = Date.now();

  // save the editor to the editors array
  this._fileEditors.push(fileEditor);

  return fileEditor;
};

/**
 * Activates a given editor
 * throws error if there is no editor for the given filepath
 * @param  {String} filepath
 * @param  {Boolean} persistent
 */
EditorManager.prototype.openEditor = function (filepath, options) {

  if (!filepath) { throw new Error('filepath is required'); }
  if (!options || options.persistent === undefined) {
    throw new Error('options.persistent must be explicitly set');
  }

  // try to find existing editor for the filepath
  // if not found, create a new one
  var editor = this.getEditor(filepath);

  if (editor) {
    // editors that previously were not persistent
    // may become in this moment
    editor.persistent = options.persistent;

    this.showEditor(filepath, options);

    return Bluebird.resolve(editor);

  } else {

    // create a new editor
    editor = this.createEditor({
      filepath: filepath,
      persistent: options.persistent
    });

    return editor.load(filepath)
      .then(function () {

        // show the editor after loading
        this.showEditor(filepath, options);

        // return the editor at the end
        return editor;

      }.bind(this));
  }
};

/**
 * Shows the editor for the given filepath.
 * Once an editor is shown, all other editors
 * are hidden.
 * 
 * @param  {String} filepath
 */
EditorManager.prototype.showEditor = function (filepath, options) {
  options = options || {};

  var self = this;

  this._fileEditors.forEach(function (fileEditor) {
    if (fileEditor.filepath === filepath) {
      // show
      fileEditor.element.removeAttribute('hidden');

      // if focus is required, focus the editor
      if (options.focus) {
        // TODO: internalize focus method
        // into the fileEditor component
        fileEditor.aceEditor.focus();
      }

    } else {
      fileEditor.element.setAttribute('hidden', true);
    }
  });
};

/**
 * Retrieves the file editor for the given filepath
 * @param  {String} filepath
 * @return {FileEditor}
 */
EditorManager.prototype.getEditor = function (filepath) {
  return this._fileEditors.find(function (editor) {
    return editor.filepath === filepath;
  });
};

/**
 * Destroys the editor for the given filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
EditorManager.prototype.destroyEditor = function (filepath) {

  if (!filepath) { throw new Error('filepath is required'); }

  var editorIndex = this._fileEditors.findIndex(function (fileEditor) {
    return fileEditor.filepath === filepath;
  });

  if (editorIndex === -1) {
    throw new Error('editor element for the filepath ' + filepath + ' does not exist');
  }

  // splice it from the array
  var fileEditor = this._fileEditors.splice(editorIndex, 1)[0];
  
  // remove all eventListeners
  fileEditor.removeAllListeners();

  // TODO verify teardown of the editor
  fileEditor.element.remove();
  
  return Bluebird.resolve();
};

/**
 * Method to be called whenever the ace editor's viewport is resized
 */
EditorManager.prototype.notifyResize = function () {

  this._fileEditors.forEach(function (fileEditor) {
    fileEditor.aceEditor.resize();
  });

};

module.exports = EditorManager;
