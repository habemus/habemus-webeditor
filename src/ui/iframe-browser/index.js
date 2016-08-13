const IframeBrowser = require('./constructor');

module.exports = function (options) {
  var iframeBrowser = new IframeBrowser(options);

  iframeBrowser.attach(document.querySelector('#iframe-browser'));

  return iframeBrowser;
}