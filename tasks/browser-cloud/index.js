module.exports = function (gulp, $, options) {
  require('./build')(gulp, $, options);
  require('./develop')(gulp, $, options);
};
