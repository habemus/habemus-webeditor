module.exports = function (habemus, options) {

  /**
   * Shortcut for translate fn
   */
  const _t = habemus.services.language.t;
  
  var MENU_OPTIONS = [
    {
      label: 'close side bar',
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
      label: 'open side bar',
      hide: function (data) {
        // TODO: probably statusL will be deprecated as PUBLIC API
        return habemus.ui.structure.statusL !== 'collapsed';
      },
      callback: function (data) {
        data.menuElement.close();
        
        habemus.ui.structure.uncollapse('left');
      },
    }
  ];
  
  if (Array.isArray(habemus.services.config.projectMenuOptions)) {
    MENU_OPTIONS = MENU_OPTIONS.concat(habemus.services.config.projectMenuOptions);
  }
  
  return MENU_OPTIONS;
};
