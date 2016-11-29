module.exports = function (habemus, options) {
  
  var MENU_OPTIONS = [
    {
      label: 'test',
      callback: function (data) {
        data.menuElement.close();
        
        alert('test!');
      },
    },
    {
      label: 'menu',
      callback: function (data) {
        data.menuElement.close();
        
        alert('menu!')
      }
    },
    {
      label: 'sub-menu',
      type: 'submenu',
      options: [
        {
          label: 'submenu 1',
          callback: function (data) {
            data.menuElement.close();
          }
        },
        {
          label: 'submenu 2',
          callback: function (data) {
            data.menuElement.close();
          }
        }
      ],
    }
  ];
  
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
