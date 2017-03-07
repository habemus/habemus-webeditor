// native


// third-party
const Bluebird = require('bluebird');
const Intercomm = require('intercomm');

const INSPECTOR_UI_ID = 'inspector-ui';

module.exports = function (options) {

  var hDevIntercomm = new Intercomm({
    // TODO: GENERATE UNIQUE ID
    id: INSPECTOR_UI_ID,
    type: 'server',
    apiVersion: '0.0.0',
    sendMessage: function (message) {
      console.log('sendMessage', message);
    }
  });

  // Set up a listener for messages posted from the service worker.
  navigator.serviceWorker.addEventListener('message', function (event) {
    // console.log('received message from service worker', event);
    var data = event.data;
    
    if (data.to === INSPECTOR_UI_ID) {
      hDevIntercomm.handleMessage(data);
    } else if (data.type === 'event') {
      hDevIntercomm.handleMessage(data);
    } else {
      console.warn('ignoring message on inspector-ui', event);
    }
    
  });

  return new Bluebird(function (resolve, reject) {
    /**
     * TEMPORARY
     */
    var hDev = {};

    hDev.subscribe = function (eventName, callback) {
      // console.log('subscribe', arguments);
      hDevIntercomm.on(eventName, callback);
      return Bluebird.resolve();
    };
    hDev.publish = function (eventName, data) {
      // console.log('publish', arguments);
      return hDevIntercomm.publish(eventName, data);
    };

    hDev.startWatching = function () {
      // console.log('startWatching', arguments);
      return Bluebird.resolve();
    };

    hDev.stopWatching = function () {
      // console.log('stopWatching', arguments);
      return Bluebird.resolve();
    };

    resolve(hDev);
  });

};
