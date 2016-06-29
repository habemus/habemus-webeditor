/**
 * The main use of this script is to inject modules into the
 * renderer process.
 *
 * The modules injected are those that have different implementation
 * for the cloud/browser based version.
 */

require('module').globalPaths.push(__dirname + '/injected_node_modules');
