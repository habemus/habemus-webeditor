// native
const path = require('path');

// third-party
const clipboard = require('clipboard-js');

module.exports = function (habemus, options) {
  
  var TAB_MENU_OPTIONS = [
    {
      label: function (data) {
        return 'show in sidebar (' + path.dirname(data.context.path) + ')';
      },
      callback: function (data) {
        data.menuElement.close();
        
        // context is the tab object
        var filepath = data.context && data.context.path;
        
        if (!filepath) {
          return;
        }
        
        return habemus.ui.fileTree.revealPath(filepath).then(function () {
          console.log('sidebar shown');
        });
      },
    },
    {
      label: 'show in preview',
      callback: function (data) {
        data.menuElement.close();
        
        // context is the tab object
        var filepath = data.context && data.context.path;
        
        if (!filepath) {
          return;
        }
        
        habemus.ui.iframeBrowser.open(filepath);
      },
    },
    {
      label: 'close',
      callback: function (data) {
        data.menuElement.close();
                
        // context is the tab object
        var filepath = data.context && data.context.path;
        
        if (!filepath) {
          return;
        }
        
        habemus.ui.tabbedEditor.closeFile(filepath);
      }
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
  
  return TAB_MENU_OPTIONS;
};
