module.exports = function (gulp, $, config) {
  require('./develop')(gulp, $, config);
  require('./distribute')(gulp, $, config);
};
