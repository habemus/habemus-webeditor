module.exports = function (habemus, options) {

  /**
   * Shortcut for translate fn
   */
  const _t = habemus.services.language.t;
  
  var MENU_OPTIONS = [
    {
      label: 'open preview iframe',
      callback: function (data) {
        data.menuElement.close();
        habemus.ui.iframeBrowser.open();
      },
    },
    {
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
      label: 'save file',
      shortcut: 'Cmd+S',
      callback: function (data) {
        data.menuElement.close();
        habemus.ui.tabbedEditor.saveActiveFile();
      }
    },
    {
      label: 'reload editor',
      shortcut: 'Cmd+R',
      callback: function (data) {
        data.menuElement.close();
        window.location.assign(window.location);
      }
    },
    {
      type: 'divider',
    },
    {
      type: 'url',
      label: 'go to dashboard',
      url: 'https://habemus.io/dashboard',
    }
  ];
  
  if (Array.isArray(habemus.services.config.projectMenuOptions)) {
    MENU_OPTIONS = MENU_OPTIONS.concat(habemus.services.config.projectMenuOptions);
  }
  
  return MENU_OPTIONS;
};
