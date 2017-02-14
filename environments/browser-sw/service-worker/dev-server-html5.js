// native
const fs = require('fs');
const path = require('path');

// third-party
const createDevServerHTML5 = require('dev-server-html5');
const express = require('express');

// instantiate the main app
var app = express();

// instantiate the file app
var devServerHTML5 = createDevServerHTML5({
  enableBrowserify: false,
  apiVersion: '0.0.0',
  supportDir: '.habemus',
  browserifyBundleRegistryURI: 'http://browserifyBundleRegistry',
});

app.use(
  '/preview',
  function (req, res, next) {
    // DEV!
    req.fsRoot = '/projects';
    
    console.log('received request for project!!!!!!', req);

    next();
  },
  devServerHTML5
);

module.exports = app;
