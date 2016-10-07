// hab
const HabUIInspector      = require('hab-ui-inspector');
const AnonymousHDevClient = require('h-workspace-client/anonymous');

// own
const loadConfig = require('./config');

document.addEventListener('DOMContentLoaded', function (e) {

  loadConfig().then(function (config) {

    var hDevClient = new AnonymousHDevClient({
      apiVersion: config.apiVersion,
      serverURI: config.hDevCloudURI
    });

    return hDevClient
      .connect(config.workspaceCode)
      .then(function () {
        var inspector = new HabUIInspector(hDevClient);
      });
  });

});
