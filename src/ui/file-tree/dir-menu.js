// third-party
const clipboard = require('clipboard-js');
const Bluebird  = require('bluebird');

// own
const browserReadFile = require('../../lib/browser-read-file');

function _wait(ms) {
  return new Bluebird(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

module.exports = function (habemus, options) {

  // defaults to 20MB
  const maxFileUploadSize = options.maxFileUploadSize || 20971520;

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
   * Auxiliary function that reads the contents from a browser
   * file object and writes it to the hDev api.
   * 
   * @param  {String} basepath
   * @param  {File} file
   * @return {Bluebird}
   */
  function _uploadFile(basepath, file) {

    var fileName = file.name;
    var fileSize = file.size;

    if (!fileName) {
      /**
       * No name
       */
      habemus.services.notification.error.show({
        text: 'Could not identify the name of the selected file.',
        duration: 4000, 
      });

      return;
    }

    if (fileSize > maxFileUploadSize) {
      /**
       * Max size]
       */
      habemus.services.notification.error.show({
        text: 'The file "' + fileName + '" exeeds the max upload size',
        duration: 4000, 
      });

      return;
    }

    habemus.services.notification.loading.show({
      text: 'Reading "' + fileName + '"...',
      duration: Math.Infinity
    });

    return _wait(500).then(function () {

      return browserReadFile(file);

    }).then(function (fileContents) {

      habemus.services.notification.loading.show({
        text: 'Uploading "' + fileName + '"',
        duration: Math.Infinity,
      })

      var filepath = basepath + '/' + fileName;

      return hDev.createFile(filepath, fileContents);
    })
    .then(function () {

      habemus.services.notification.loading.hide();
      habemus.services.notification.success.show({
        text: '"' + fileName + '" successfully uploaded',
        duration: 3000,
      });

      // aritificially delay some milliseconds so that
      // the experience is better
      return _wait(500);
    })
    .catch(function (err) {

      habemus.services.notification.loading.hide();
      habemus.services.notification.error.show({
        text: 'Upload failed: ' + err.name,
        duration: 3000
      });

      console.warn(err);

      return _wait(2000);
    });
  }

  /**
   * Reference to the dialogs service.
   * 
   * @type {Object}
   *       - prompt
   *       - confirm
   *       - alert
   */
  const dialogs = habemus.services.dialogs;

  return function genDirMenu(tree) {
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
      },
      // {
      //   label: 'open in browser',
      //   type: 'url',
      //   target: '_blank',
      //   url: function (data) {
      //     var nodeModel = data.context;
      //     
      //     // TODO: study best way of dealing with getURL that seems
      //     // to be available only at file nodes.
      //     return nodeModel.getURL();
      //   }
      // },
      // {
      //   label: 'open in iframe',
      //   callback: function (data) {
      //     data.menuElement.close();

      //     iframeBrowser.open(data.context.path);
      //   }
      // },
      {
        label: 'upload',
        type: 'input:file',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;
          var basepath  = nodeModel.path;

          var files = data.files;

          if (!files) {
            return;
          }

          return files.reduce(function (lastUploadPromise, file) {

            return lastUploadPromise.then(function () {
              return _uploadFile(basepath, file);
            });

          }, Bluebird.resolve());

        },
      }
    ];
  };
};
