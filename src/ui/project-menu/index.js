module.exports = function (habemus, options) {
  
  var menu = document.createElement('hab-context-menu');
  menu.set('optionGroups', [
    'priority',
    'fs',
    'project-management',
    'config',
  ]);
  menu.set(
    'options',
    require('./options')(habemus, options)
  );
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

  return menu;
};
