// native
const url = require('url');

// own
const HFsIntercomm = require('./h-fs-intercomm');

const LOCAL_H_FS_ID = 'local-h-fs';

module.exports = function (sw, options) {
  
  var hFsIntercomm = new HFsIntercomm({
    id: LOCAL_H_FS_ID,
    apiVersion: '1.0.0',
    sw: sw,
    rootPath: '/projects',
  });
  
  sw.addEventListener('message', function (message) {
    
    var data = message.data;

    if (data.to === LOCAL_H_FS_ID) {
      
      hFsIntercomm.handleMessage(data);
      
    } else if (data.type === 'event') {

      if (data.from === 'editor-ui') {
        // republish event to all preview clients
        sw.clients.matchAll().then(function(clients) {
          
          clients.forEach(function(client) {

            var parsedUrl = url.parse(client.url);
            
            if (parsedUrl.path.startsWith('/preview')) {
              client.postMessage(data);
            }
          });
        });
      }

    } else {
      // ignore
      console.warn('ignoring received message', message);
    }
  });

};
