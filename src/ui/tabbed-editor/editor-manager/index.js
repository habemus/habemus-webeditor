// native dependencies
const EventEmitter = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

const FileEditor = require('h-ui-file-editor');

/**
 * Editor container constructor
 * @param {Object} options
 *        - ace
 *        - hfs
 */
function EditorManager(options) {
  
  /**
   * Reference to the ace global variable
   */
  this.ace = options.ace;
  
  /**
   * The HFS Api to be used by all editors
   */
  this.hfs = options.hfs;
  
  /**
   * The editor manager wrapping element.
   * All editor elements will be appended to this element.
   */
  this.element = document.createElement('div');
  this.element.style.height = 'calc(100vh - 32px)';

  /**
   * Array to store a reference to 
   * all fileEditors created
   * @type {Array}
   */
  this._fileEditors = [];
}

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
 */
EditorManager.prototype.createEditor = function () {
  // create an element for the editor
  var editorEl = document.createElement('div');
  editorEl.style.height = '100%';

  // instantiate a file editor
  var fileEditor = new FileEditor(
    this.ace,
    editorEl,
    this.hfs
  );

  ////////////////////////
  // STYLES AND OPTIONS //
  
  // theme
  fileEditor.aceEditor.setTheme('ace/theme/monokai');

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

    // console.log('editor exists');

    this.showEditor(filepath);

    return Bluebird.resolve(editor);

  } else {

    // create a new editor
    editor = this.createEditor();
    editor.persistent = options.persistent;

    // console.log(filepath, 'created new editor')

    return editor.load(filepath)
      .then(function () {

        // console.log(filepath, 'loaded editor');

        // show the editor after loading
        this.showEditor(filepath);

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
 * Once an editor is hidden, we should check if it is a persistent
 * editor or a temporary one.
 * If it is a temporary editor, schedule its complete teardown
 * and removal.
 * 
 * @param  {String} filepath
 */
EditorManager.prototype.showEditor = function (filepath) {

  var self = this;

  this._fileEditors.forEach(function (fileEditor) {
    if (fileEditor.filepath === filepath) {

      // console.log(filepath, 'show')

      // show
      fileEditor.element.removeAttribute('hidden');

    } else {

      // console.log(filepath, fileEditor.filepath, 'hide');

      if (!fileEditor.persistent) {
        // destroy the editor on the event loop's nextTick
        // in order not to interfere in the current loop
        setTimeout(function () {
          self.destroyEditor(fileEditor.filepath);
        }, 0);
        fileEditor.element.setAttribute('hidden', true);
      } else {
        // the editor is persistent, only needs to be hidden
        fileEditor.element.setAttribute('hidden', true);
      }
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

  // TODO verify teardown of the editor
  fileEditor.element.remove();

  // console.log(filepath, 'removed editor')
};

module.exports = EditorManager;
