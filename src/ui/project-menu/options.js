module.exports = function (habemus, options) {

  /**
   * Shortcut for translate fn
   */
  const _t = habemus.services.language.t;
  
  var MENU_OPTIONS = [
    {
      group: 'priority',
      label: 'open preview iframe',
      callback: function (data) {
        data.menuElement.close();
        habemus.ui.iframeBrowser.open();
      },
    },
    {
      group: 'priority',
      label: 'close file tree',
      hide: function (data) {
        // TODO: probably statusL will be deprecated as PUBLIC API
        return habemus.ui.structure.statusL === 'collapsed';
      },
      callback: function (data) {
        data.menuElement.close();
        
        habemus.ui.structure.collapse('left');
      },
    },
    {
      group: 'priority',
      label: 'open file tree',
      hide: function (data) {
        // TODO: probably statusL will be deprecated as PUBLIC API
        return habemus.ui.structure.statusL !== 'collapsed';
      },
      callback: function (data) {
        data.menuElement.close();
        
        habemus.ui.structure.uncollapse('left');
      },
    },
    {
      group: 'priority',
      label: 'save file',
      shortcut: 'Cmd+S',
      callback: function (data) {
        data.menuElement.close();
        habemus.ui.tabbedEditor.saveActiveFile();
      }
    },
    {
      group: 'priority',
      label: 'reload editor',
      shortcut: 'Cmd+R',
      callback: function (data) {
        data.menuElement.close();
        window.location.assign(window.location);
      }
    },
    {
      group: 'fs',
      label: 'new file',
      callback: function (data) {
        data.menuElement.close();
        // TODO: stop using rootModel directly
        return habemus.ui.fileTree.promptNewFile(habemus.ui.fileTree.rootModel);
      },
    },
    {
      group: 'fs',
      label: 'new directory',
      callback: function (data) {
        data.menuElement.close();
        // TODO: stop using rootModel directly
        return habemus.ui.fileTree.promptNewDirectory(habemus.ui.fileTree.rootModel);
      },
    },
    {
      group: 'fs',
      label: 'upload file',
      type: 'input:file',
      callback: function (data) {
        data.menuElement.close();
        
        // TODO: stop using rootModel directly
        var basepath = habemus.ui.fileTree.rootModel.path;
        var files    = data.files;

        if (!files) {
          return;
        }
        
        return habemus.ui.fileTree.upload.fromFilesArray(basepath, files);
      }
    },
    {
      group: 'fs',
      label: 'upload directory',
      type: 'input:directory',
      callback: function (data) {
        data.menuElement.close();
        
        // TODO: stop using rootModel directly
        var basepath = habemus.ui.fileTree.rootModel.path;
        var files    = data.files;

        if (!files) {
          return;
        }
        
        return habemus.ui.fileTree.upload.fromWebkitDirectoryInput(
          basepath,
          files
        );
      }
    },
    {
      group: 'support',
      label: 'chat with us at @slack!',
      type: 'url',
      target: 'habemus_web_editor_slack',
      url: 'https://habemusio.slack.com',
    }
  ];
  
  if (Array.isArray(habemus.services.config.projectMenuOptions)) {
    console.warn('habemus.services.config.projectMenuOptions will be deprecated');
    console.warn('please use `habemus.ui.projectMenu.addOptions(options)` instead');

    MENU_OPTIONS = MENU_OPTIONS.concat(habemus.services.config.projectMenuOptions);
  }
  
  return MENU_OPTIONS;
};
