const IframeBrowser = require('./constructor');

module.exports = function (habemus, options) {
  
  var iframeBrowser = new IframeBrowser({
    hDev: habemus.services.hDev,
    structure: habemus.ui.structure,
  });

  iframeBrowser.attach(document.querySelector('#iframe-browser'));

  return iframeBrowser;
}