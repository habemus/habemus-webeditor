module.exports = function (gulp, $, config) {
  require('./build')(gulp, $, config);
  require('./develop')(gulp, $, config);
};
