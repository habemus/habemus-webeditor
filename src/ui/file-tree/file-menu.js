// third-party
const clipboard = require('clipboard-js');
const Bluebird  = require('bluebird');

module.exports = function (options, tree) {

  /**
   * Reference to the hDev api.
   * @type {HDevAuthenticatedClient}
   */
  const hDev = options.hDev;

  /**
   * Reference to the ui element iframeBrowser
   */
  const iframeBrowser = options.iframeBrowser;

  /**
   * Reference to the dialogs service.
   * 
   * @type {Object}
   *       - prompt
   *       - confirm
   *       - alert
   */
  const dialogs = options.dialogs;

  return [
    {
      label: 'duplicate',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        return Bluebird.all([
          dialogs.prompt('Duplicate path', {
            submit: 'duplicate',
            defaultValue: path + '-copy',
          }),
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
      label: 'remove',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = [
          'Confirm removing `',
          path,
          '` This action cannot be undone.'
        ].join('');

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
      label: 'copy path',
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
      label: 'open in browser',
      type: 'url',
      target: '_blank',
      url: function (data) {
        var nodeModel = data.context;

        return nodeModel.getURL();
      }
    },
    {
      label: 'open in iframe',
      callback: function (data) {
        data.menuElement.close();

        iframeBrowser.open(data.context.path);
      }
    }
  ];
};