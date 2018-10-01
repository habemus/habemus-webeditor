// hab
const HabUIInspector      = require('habemus-ui-inspector');
const AnonymousHWorkspaceClient = require('habemus-workspace-client/public/anonymous');

// own
const loadConfig = require('./config');

document.addEventListener('DOMContentLoaded', function (e) {

  loadConfig().then(function (config) {

    var hDevClient = new AnonymousHWorkspaceClient({
      apiVersion: config.apiVersion,
      serverURI: config.hWorkspaceURI
    });

    return hDevClient
      .connect(config.projectCode)
      .then(function () {
        var inspector = new HabUIInspector(hDevClient);
      });
  });

});
