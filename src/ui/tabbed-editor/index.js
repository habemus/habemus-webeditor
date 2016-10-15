const TabbedEditor = require('./tabbed-editor');

module.exports = function (habemus, options) {

  var tabbedEditor = new TabbedEditor({
    hDev: habemus.services.hDev,
    ace: window.ace,
    localStorage: habemus.services.projectConfigStorage,
  });

  tabbedEditor.attach(document.querySelector('#tabbed-editor'));

  return tabbedEditor;
}