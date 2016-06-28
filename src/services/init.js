const initHFS = require('./hfs');

module.exports = function (habemus, options) {

  habemus.services = {};

  return initHFS(options)
    .then((hfs) => {
      habemus.services.hfs = hfs;
    });

};