module.exports = function (habemus, options) {
  
  var tabMenu = document.createElement('hab-context-menu');
  tabMenu.set(
    'options',
    require('./options')(habemus, options)
  );
  document.body.appendChild(tabMenu);
  
  return tabMenu;
};
