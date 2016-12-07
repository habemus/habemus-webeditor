module.exports = function (habemus, options) {

  /**
   * Shortcut for translate fn
   */
  const _t = habemus.services.language.t;
  
  var MENU_OPTIONS = [
    {
      label: 'close side bar',
      callback: function (data) {
        data.menuElement.close();
        
        habemus.ui.structure.collapse('left');
      },
    },
  ];
  
  if (Array.isArray(habemus.services.config.projectMenuOptions)) {
    MENU_OPTIONS = MENU_OPTIONS.concat(habemus.services.config.projectMenuOptions);
  }
  
  var menu = document.createElement('hab-context-menu');
  menu.set('options', MENU_OPTIONS);
  document.body.appendChild(menu);
  
  /**
   * Element that triggers the menu interaction
   */
  var menuTrigger = document.querySelector('#menu-trigger');
  
  menuTrigger.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    var rect = menuTrigger.getBoundingClientRect();

    var position = {
      left: rect.left,
      top: rect.bottom + 3,
    };
    
    menu.menuOpenWithContext({}, position);
  });
};
