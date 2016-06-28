const TabbedEditor = require('./tabbed-editor');

module.exports = function (options) {
  var tabbedEditor = new TabbedEditor(options);

  tabbedEditor.attach(document.querySelector('#tabbed-editor'));

  return tabbedEditor;
}