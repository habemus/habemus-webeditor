// third-party
const clipboard = require('clipboard-js');

module.exports = function (habemus, options) {

  // shortcut for the translation method
  var _t = habemus.services.language.t;
  
  var EDITOR_MENU_OPTIONS = [
    {
      group: 'priority',
      label: _t('file-editor-menu.copy'),
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
      group: 'priority',
      label: _t('file-editor-menu.save-file'),
      callback: function (data) {
        data.menuElement.close();
        
        var fileEditor = data.context;
        
        if (!fileEditor) {
          return;
        }

        return habemus.ui.tabbedEditor.saveFile(fileEditor.filepath);
      }
    },
    {
      label: _t('file-editor-menu.show-in-file-tree'),
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
      label: _t('file-editor-menu.show-in-preview-iframe'),
      callback: function (data) {
        data.menuElement.close();

        habemus.ui.iframeBrowser.open(data.context.filepath);
      },
    },

    // file-tree
    // {
    //   label: _t('file-editor-menu.hide-file-tree'),
    //   hide: function (data) {
    //     // TODO: probably statusL will be deprecated as PUBLIC API
    //     return habemus.ui.structure.statusL === 'collapsed';
    //   },
    //   callback: function (data) {
    //     data.menuElement.close();
    //     habemus.ui.structure.collapse('left');
    //   },
    // },
    // {
    //   label: _t('file-editor-menu.open-file-tree'),
    //   hide: function (data) {
    //     // TODO: probably statusL will be deprecated as PUBLIC API
    //     return habemus.ui.structure.statusL !== 'collapsed';
    //   },
    //   callback: function (data) {
    //     data.menuElement.close();
    //     habemus.ui.structure.uncollapse('left');
    //   },
    // },
  ];
  
  return EDITOR_MENU_OPTIONS;
};
