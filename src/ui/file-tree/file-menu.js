// third-party
const Bluebird  = require('bluebird');

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
      }
    ];
  }
};