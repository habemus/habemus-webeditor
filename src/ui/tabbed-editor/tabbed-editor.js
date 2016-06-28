const FileEditor = require('h-ui-file-editor');

function TabbedEditor(options) {

  if (!options.fileTree) { throw new Error('fileTree is required'); }
  if (!options.hfs) { throw new Error('hfs is required'); }

  var self = this;
  var fileTree = self.fileTree = options.fileTree;

  fileTree.ui.addTreeEventListener('click', 'leaf', function (data) {

    // create an element for the editor
    var editorEl = document.createElement('div');
    editorEl.style.height = '100%';

    self.editorContainer.appendChild(editorEl);
    var fileEditor = new FileEditor(window.ace, editorEl, options.hfs);
    fileEditor.aceEditor.setTheme('ace/theme/monokai');

    // create new file object
    var newFile = {
      // make the file object be identified by the path
      id: data.model.path,

      name: data.model.name,
      path: data.model.path,
      fileEditor: fileEditor,
    };

    newFile.fileEditor.load(data.model.path)
      .then(function () {

        self.tabs.push('files', newFile);
      });

  });

  var tabs = this.tabs = document.createElement('habemus-editor-tabs');
  tabs.set('files', [
    { id: 'f1', name: 'file-1', path: 'file-1' },
    { id: 'f2', name: 'file-2', path: 'file-2' },
    { id: 'f3', name: 'file-3', path: 'file-3' },
    { id: 'f4', name: 'file-4', path: 'file-4' },
  ]);


  this.editorContainer = document.createElement('div');
  this.editorContainer.style.height = 'calc(100vh - 40px)';
  this.editorContainer.style.position = 'relative';

  this.element = document.createElement('div');
  this.element.appendChild(tabs);
  this.element.appendChild(this.editorContainer);
}

TabbedEditor.prototype.createTab = function (filepath) {

};

TabbedEditor.prototype.destroyTab = function (filepath) {

};

TabbedEditor.prototype.attach = function (containerElement) {
  containerElement.appendChild(this.element);

  this.containerElement = containerElement;
}

module.exports = TabbedEditor;