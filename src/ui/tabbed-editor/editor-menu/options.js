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
      label: 'show in sidebar',
      callback: function (data) {
        data.menuElement.close();
        
        // context is the fileEditor object
        var filepath = data.context && data.context.filepath;
        
        if (!filepath) {
          return;
        }
        
        return habemus.ui.fileTree.revealPath(data.context.filepath).then(function () {
          console.log('sidebar shown');
        });
      },
    },
    {
      label: 'show in preview',
      callback: function (data) {
        data.menuElement.close();

        habemus.ui.iframeBrowser.open(data.context.filepath);
      },
    },
    // {
    //   label: 'show in new tab',
    //   type: 'url',
    //   target: '_blank',
    //   url: function (data) {
    //     return habemus.services.hDev.projectRootURL + data.context.filepath;
    //   },
    //   callback: function (data) {
    //     data.menuElement.close();
    //   },
    // },
  ];
  
  return EDITOR_MENU_OPTIONS;
};
