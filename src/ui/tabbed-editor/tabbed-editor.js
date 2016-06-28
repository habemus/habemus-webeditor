const FileEditor = require('h-ui-file-editor');

function TabbedEditor(options) {

  if (!options.fileTree) { throw new Error('fileTree is required'); }
  if (!options.hfs) { throw new Error('hfs is required'); }

  var fileTree = this.fileTree = options.fileTree;

  fileTree.ui.addTreeEventListener('click', 'leaf', function (data) {

    // create an element for the editor
    var editorEl = document.createElement('div');
    editorEl.style.height = '100%';

    this.editorContainer.appendChild(editorEl);

    console.log(data.model.path)

    // create new file object
    var newFile = {
      name: data.model.name,
      path: data.model.path,
      fileEditor: new FileEditor(window.ace, editorEl, options.hfs),
    };

    newFile.fileEditor.load(data.model.path)
      .then(function () {

        this.tabs.push('files', newFile);
      }.bind(this))

    // // read file contents
    // setTimeout(function () {


    // }.bind(this), 300);

  }.bind(this));

  var tabs = this.tabs = document.createElement('habemus-editor-tabs');
  tabs.set('files', []);


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