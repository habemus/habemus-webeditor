// third-party
const Bluebird  = require('bluebird');
const fileSaver = require('file-saver');

module.exports = function (habemus, options) {

  /**
   * Reference to the hDev api.
   * @type {HDevAuthenticatedClient}
   */
  const hDev = habemus.services.hDev;

  /**
   * Reference to the ui element iframeBrowser
   */
  const iframeBrowser = habemus.ui.iframeBrowser;

  /**
   * Shortcut for translate fn
   */
  const _t = habemus.services.language.t;

  /**
   * Reference to the dialogs service.
   * 
   * @type {Object}
   *       - prompt
   *       - confirm
   *       - alert
   */
  const dialogs = habemus.services.dialogs;

  return function genFileMenu(tree) {
    return [
      {
        group: 'auxiliary',
        label: _t('file-tree-menu.preview'),
        callback: function (data) {
          data.menuElement.close();

          iframeBrowser.open(data.context.path);
        }
      },
      // {
      //   group: 'fs',
      //   label: 'download',
      //   // label: _t('file-tree-menu.download'),
      //   callback: function (data) {

      //     var filepath = data.context.path;
      //     var split    = filepath.split('/');
      //     var basename = split[split.length - 1];

      //     // TODO: analyze mimetype
      //     habemus.services.hDev.readFile(data.context.path).then(function (contents) {
      //       var blob = new Blob(contents, {
      //         type: 'text/plain;charset=utf-8'
      //       });

      //       fileSaver.saveAs(blob, basename);
      //     });
      //   },
      // },
      {
        group: 'fs',
        label: 'save',
        shortcut: 'Cmd + S',
        callback: function (data) {
          var filepath = data.context.path;

          habemus.ui.tabbedEditor.saveFile(filepath);
        }
      }
    ];
  }
};