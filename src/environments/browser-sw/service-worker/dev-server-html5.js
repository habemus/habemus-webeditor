// third-party
const createDevServerHTML5 = require('habemus-dev-server');
const devServerProcessorCSS = require('habemus-dev-server-processor-css');
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
    'text/css': devServerProcessorCSS
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
