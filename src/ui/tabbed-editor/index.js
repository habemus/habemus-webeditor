const TabbedEditor = require('./tabbed-editor');

module.exports = function (habemus, options) {

  /**
   * TODO: study whether this is the ideal place
   * for configuring ace editor.
   * 
   * Let ace use another basePath if the option is defined
   * https://github.com/ajaxorg/ace/issues/1518
   *
   * <script src="libs.min.js" type="text/javascript" charset="utf-8"></script>
   * <script>
   *     ace.config.set('basePath', '/ace-builds/src-noconflict');
   *     var editor = ace.edit("editor");
   *     editor.setTheme("ace/theme/monokai");
   *     editor.getSession().setMode("ace/mode/javascript");
   * </script>
   */
  if (process.env.ACE_BASE_PATH) {
    window.ace.config.set('basePath', process.env.ACE_BASE_PATH);
  }

  var tabbedEditor = new TabbedEditor({
    hDev: habemus.services.hDev,
    ace: window.ace,
    localStorage: habemus.services.projectConfigStorage,
    habemusStructure: habemus.ui.structure,
  });
  
  var editorMenu = require('./editor-menu')(habemus, options);

  // the context menu can only be instantiated here, as this script is
  // the only one with full access to both file tree and tabbedEditor
  // TODO: study if this is the best implementation
  tabbedEditor.on('editor:contextmenu', function (data) {
    
    data.event.preventDefault();
    
    var position = {
      left: data.event.clientX,
      top: data.event.clientY
    };
    
    editorMenu.menuOpenWithContext(data.fileEditor, position);
  });
  
  tabbedEditor.on('editor:focus', function (data) {
    // habemus.ui.fileTree.uiSelect(data.fileEditor.filepath);
  });

  tabbedEditor.attach(document.querySelector('#tabbed-editor'));

  return tabbedEditor;
}