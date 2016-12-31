// native dependencies
const path = require('path');

// third-party dependencies
const gulp = require('gulp');

// Load all installed gulp plugins into $
var $ = require('gulp-load-plugins')();

// Internal dependencies
const config = require('./tasks/config');

/**
 * Load environment-agnostic gulp tasks
 */
require('./tasks/less')(gulp, $, config);
require('./tasks/i18n')(gulp, $, config);

/**
 * Load environment-specific gulp tasks
 */
require('./tasks/electron')(gulp, $, config);
require('./tasks/browser-cloud')(gulp, $, config);
require('./tasks/browser-sw')(gulp, $, config);
