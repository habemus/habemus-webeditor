module.exports = function (habemus, options) {
  
  var editorMenu = document.createElement('hab-context-menu');
  editorMenu.set('optionGroups', [
    'priority',
    'auxiliary',
  ]);
  editorMenu.set(
    'options',
    require('./options')(habemus, options)
  );
  document.body.appendChild(editorMenu);
  
  return editorMenu;  
};
