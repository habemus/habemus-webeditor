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
    
    console.log(data.to, hFsIntercomm.id);
    
    if (data.to === LOCAL_H_FS_ID) {
      
      hFsIntercomm.handleMessage(data);
      
    } else {
      // ignore
      console.warn('ignoring received message', message);
    }
  });

};
