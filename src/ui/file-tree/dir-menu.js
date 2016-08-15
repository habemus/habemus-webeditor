// third-party
const clipboard = require('clipboard-js');

module.exports = function (options, tree) {

  /**
   * Reference to the hDev api.
   * @type {HDevAuthenticatedClient}
   */
  const hDev = options.hDev;

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
      label: 'remove',
      callback: function (data) {
        // close the context menu immediately
        data.menuElement.close();
        var nodeModel = data.context;

        var path = nodeModel.path;

        var msg = [
          'Confirm removing all files in the directory `',
          path,
          '` This action cannot be undone.'
        ].join('');

        dialogs.confirm(msg)
          .then(function confrmed() {

            return hDev.remove(path)
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
    }
  ];
};