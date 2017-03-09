// const 

// hab
const HabUIInspector = require('hab-ui-inspector');

const loadHDev = require('./h-dev');

document.addEventListener('DOMContentLoaded', function (e) {

  loadHDev({}).then(function (hDev) {
    var inspector = new HabUIInspector(hDev);
  });

});
