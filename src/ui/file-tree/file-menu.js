// third-party
const clipboard = require('clipboard-js');
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
        label: _t('file-tree-menu.duplicate'),
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          var path = nodeModel.path;

          return Bluebird.all([
            dialogs.prompt(
              _t('file-tree-menu.duplicate-prompt'),
              {
                submit: _t('file-tree-menu.duplicate'),
                defaultValue: path + '-copy',
              }
            ),
            hDev.readFile(path),
          ])
          .then(function (results) {

            var targetPath = results[0];
            var contents   = results[1];

            if (!targetPath) {
              return Bluebird.reject(new Error('targetPath is required'));
            }

            return hDev.createFile(targetPath, contents);
          });
        }
      },
      {
        label: _t('file-tree-menu.remove'),
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          var path = nodeModel.path;

          var msg = _t('file-tree-menu.remove-confirm', {
            path: path,
          });

          dialogs.confirm(msg)
            .then(function confrmed() {

              return hDev.remove(path);
            }, function cancelled() {
              console.log('removal cancelled by user');
            })
            .catch(function (err) {
              alert('error removing');
              console.warn(err);
            });
        }
      },
      {
        label: _t('file-tree-menu.copy-path'),
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          clipboard.copy(nodeModel.path)
            .then(function () {
              console.log('copied')
            });
        }
      },
      {
        label: _t('file-tree-menu.open-in-new-tab'),
        type: 'url',
        target: '_blank',
        url: function (data) {
          var nodeModel = data.context;

          return nodeModel.getURL();
        }
      },
      {
        label: _t('file-tree-menu.preview'),
        callback: function (data) {
          data.menuElement.close();

          iframeBrowser.open(data.context.path);
        }
      }
    ];
  }
};