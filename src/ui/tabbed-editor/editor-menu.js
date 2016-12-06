// third-party
const clipboard = require('clipboard-js');

module.exports = function (habemus, options) {
  
  var EDITOR_MENU_OPTIONS = [
    {
      label: 'copy',
      callback: function (data) {
        data.menuElement.close();
        
        var fileEditor = data.context;
        
        if (!fileEditor) {
          return;
        }
        
        // might break:
        // http://stackoverflow.com/questions/23996814/how-can-i-get-selected-text-in-ace-editor
        var selectedText = fileEditor.aceEditor.getSelectedText();
        
        return clipboard.copy(selectedText).then(function () {
          console.log('copied');
        });
      }
    },
    {
      label: 'reveal in sidebar',
      callback: function (data) {
        data.menuElement.close();
        
        // context is the fileEditor object
        var filepath = data.context && data.context.filepath;
        
        if (!filepath) {
          return;
        }
        
        return habemus.ui.fileTree.revealPath(data.context.filepath).then(function () {
          console.log('revealed');
        });
      },
    },
  ];
  
  var editorMenu = document.createElement('hab-context-menu');
  editorMenu.set('options', EDITOR_MENU_OPTIONS);
  document.body.appendChild(editorMenu);
  
  return editorMenu;
};
