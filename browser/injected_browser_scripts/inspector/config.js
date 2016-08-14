// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');

// pick configurations from process envified variables
const HOST = process.env.HOST;
const H_DEV_CLOUD_URI = process.env.H_DEV_CLOUD_URI;

console.log(HOST);

/**
 * Auxiliary function that parses the workspace code
 * from the location given a base host.
 *
 * If no workspace code can be matched in the hostname,
 * attempts to fallback to use queryString 'code' parameter.
 * 
 * @param  {String} baseHost
 * @return {String}
 */
function parseWorkspaceCodeFromHost(baseHost) {

  /**
   * Variable to hold the resulting workspaceCode
   */
  var workspaceCode;
  
  /**
   * Regular expression that matches a subdomain
   * of the passed host.
   * @type {RegExp}
   */
  const CODE_REGEXP = new RegExp('(.+)\\.' + url.parse(baseHost).hostname + '$');
  
  var locationString = window.location.toString();
  var parsedURL      = url.parse(locationString, true);

  console.log(CODE_REGEXP);
  console.log(locationString);
  console.log(parsedURL.hostname);

  var match = parsedURL.hostname.match(CODE_REGEXP);

  if (match) {

    workspaceCode = match[1];

  } else {
    // could not parse the workspaceCode from the host name,
    // attempting to get from query string
    workspaceCode = parsedURL.query.code;
  }

  return workspaceCode;
}

/**
 * Loads configurations.
 * 
 * @return {Bluebird -> Object}
 */
function loadConfig() {
  if (!HOST) {
    throw new Error('HOST env var MUST be set');
  }

  if (!H_DEV_CLOUD_URI) {
    throw new Error('H_DEV_CLOUD_URI env var MUST be set');
  }

  var workspaceCode = parseWorkspaceCodeFromHost(HOST);

  if (!workspaceCode) {
    throw new Error('could not parse workspaceCode');
  }

  return Bluebird.resolve({
    apiVersion: '0.0.0',
    hDevCloudURI: H_DEV_CLOUD_URI,
    workspaceCode: workspaceCode,
  });
}

module.exports = loadConfig;
