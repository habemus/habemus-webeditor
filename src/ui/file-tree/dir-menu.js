// third-party
const clipboard = require('clipboard-js');

module.exports = function (options, tree) {
  
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
    }
  ];
};