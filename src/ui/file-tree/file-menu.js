// third-party
const clipboard = require('clipboard-js');

module.exports = function (options, tree) {

  /**
   * Reference to the ui element iframeBrowser
   */
  const iframeBrowser = options.iframeBrowser;

  return [
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