// third-party
const createDevServerHTML5 = require('dev-server-html5');
const express = require('express');

// instantiate the main app
var app = express();

// instantiate the file app
var devServerHTML5 = createDevServerHTML5({
  apiVersion: '0.0.0',
  supportDir: '.habemus',
  htmlInjectors: [
    '<script charset="utf8" type="application/javascript" src="/inspector.js"></script>'
  ],
  processors: {
    'text/css': require('dev-server-html5/processors/css/autoprefixer'),
  }
});

app.use(
  '/preview',
  function (req, res, next) {
    /**
     * Fixed fsRoot at /projects
     * @type {String}
     */
    req.fsRoot = '/projects';
    next();
  },
  devServerHTML5
);

module.exports = app;
