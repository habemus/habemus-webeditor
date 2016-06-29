/**
 * The main use of this script is to inject modules into the
 * renderer process.
 *
 * The modules injected are those that have different implementation
 * for the cloud/browser based version.
 */

// to modify the electron search path, we must push the aditional path
// to the globalPaths
// see:
// https://github.com/electron/electron/issues/11

require('module').globalPaths.push(__dirname + '/injected_node_modules');
