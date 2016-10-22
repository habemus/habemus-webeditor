// own
const HFsIntercomm = require('./h-fs-intercomm');

module.exports = function (sw, options) {
  
  var hFsIntercomm = new HFsIntercomm({
    sw: sw,
    rootPath: '/projects',
  });

  sw.on('message', function (message) {

    console.log('message received in service worker router', message)

  });

};
