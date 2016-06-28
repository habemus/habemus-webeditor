const Bluebird = require('bluebird');

const FileEditor = require('h-ui-file-editor');

/**
 * Editor container constructor
 */
function EditorContainer(options) {

  this.ace = options.ace;
  this.hfs = options.hfs;

  this.element = document.createElement('div');
  this.element.style.height = 'calc(100vh - 32px)';

  this._editors = [];
}

/**
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
EditorContainer.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;
  this.containerElement.appendChild(this.element);
};

/**
 * Checks if an editor already exists and returns it if it does.
 * If it doesn't, creates a new instance of the editor and returns
 * @param  {String} filepath
 * @return {Bluebird -> FileEditor}
 */
// EditorContainer.prototype.ensureEditorExists = function (filepath) {
//   if (!filepath) { throw new Error('filepath is required'); }

//   var editor = this._editors.find(function (editor) {
//     return editor.filepath === filepath;
//   });

//   if (editor) {
//     return Bluebird.resolve(editor);
//   } else {
//     return this.createEditor(filepath);
//   }
// };

/**
 * Create an editor
 * @return {Promise -> UIFileEditor}
 */
EditorContainer.prototype.createEditor = function (filepath) {

  if (!filepath) { throw new Error('filepath is required'); }

  // create an element for the editor
  var editorEl = document.createElement('div');
  // set the filepath so that iron pages correctly identifies it
  editorEl.setAttribute('data-filepath', filepath);
  editorEl.style.height = '100%';

  // instantiate a file editor
  var fileEditor = new FileEditor(
    this.ace,
    editorEl,
    this.hfs
  );
  fileEditor.aceEditor.setTheme('ace/theme/monokai');

  // append it to the element container
  this.element.appendChild(editorEl);

  // save the editor to the editors array
  this._editors.push(fileEditor);

  return fileEditor.load(filepath)
    .then(function () {
      return fileEditor;
    });
};

/**
 * Activates a given editor
 * throws error if there is no editor for the given filepath
 * @param  {String} filepath
 */
EditorContainer.prototype.activateEditor = function (filepath) {

  // console.log('activate', filepath)

  if (!filepath) { throw new Error('filepath is required'); }

  var exists = false;

  Array.prototype.forEach.call(this.element.childNodes, function (editorEl) {
    if (editorEl.getAttribute('data-filepath') === filepath) {
      // found
      exists = true;

      editorEl.style.display = 'block';
    } else {
      editorEl.style.display = 'none';
    }
  });

  if (!exists) {
    throw new Error('editor for file ' + filepath + ' does not exist')
  }
};

/**
 * Destroys the editor for the given filepath
 * @param  {String} filepath
 */
EditorContainer.prototype.destroyEditor = function (filepath) {

  if (!filepath) { throw new Error('filepath is required'); }

  var editorEl = this.element.querySelector('[data-filepath="' + filepath + '"]');

  if (!editorEl) {
    throw new Error('editor element for the filepath ' + filepath + ' does not exist');
  }

  // TODO verify teardown of the editor

  editorEl.remove();
};

module.exports = EditorContainer;
