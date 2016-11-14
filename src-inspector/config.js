// third-party
const Bluebird = require('bluebird');

// habemus-editor url builder
const habemusEditorUrls = require('habemus-editor-urls');

// pick configurations from process envified variables
const H_WORKSPACE_URI = process.env.H_WORKSPACE_URI;

/**
 * Loads configurations.
 * 
 * @return {Bluebird -> Object}
 */
function loadConfig() {
  if (!H_WORKSPACE_URI) {
    throw new Error('H_WORKSPACE_URI env var MUST be set');
  }
  
  var locationString = window.location.toString();
  var projectCode = habemusEditorUrls.parse.workspacePreview(locationString).projectCode;

  if (!projectCode) {
    throw new Error('could not parse projectCode');
  }

  return Bluebird.resolve({
    apiVersion: '0.0.0',
    hWorkspaceURI: H_WORKSPACE_URI,
    projectCode: projectCode,
  });
}

module.exports = loadConfig;
