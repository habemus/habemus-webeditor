// native
const util = require('util');

// third-party
const Intercomm = require('intercomm');

// h-deps
const HFs = require('@habemus/virtual-fs');

function HFsIntercomm(options) {
  /**
   * h-fs is exclusively a server node.
   * @type {String}
   */
  options.type = 'server';

  // initialize Intercomm
  Intercomm.call(this, options);

  if (!options.sw) {
    throw new Error('sw is required');
  }

  if (typeof options.rootPath !== 'string' || !options.rootPath) {
    throw new TypeError('rootPath MUST be a non-empty string');
  }

  /**
   * Store reference to the ServiceWorkerGlocalScope
   * @type {ServiceWorkerGlocalScope}
   */
  this.sw = options.sw;

  /**
   * Store the workspace's rootPath
   * @type {String}
   */
  this.rootPath = options.rootPath;

  /**
   * Instantiate the hFs and store it in the instance
   * @type {HFs}
   */
  var hFs = new HFs(this.rootPath);
  this.hFs = hFs;
  
  // expose the hFs api
  this.expose({
    createFile: hFs.createFile.bind(hFs),
    createDirectory: hFs.createDirectory.bind(hFs),
    readDirectory: hFs.readDirectory.bind(hFs),
    readFile: hFs.readFile.bind(hFs),
    updateFile: hFs.updateFile.bind(hFs),
    move: hFs.move.bind(hFs),
    remove: hFs.remove.bind(hFs),

    pathExists: hFs.pathExists.bind(hFs),
    startWatching: function (path) {
      // TODO: define what should be the way to handle fs
      // watching methods
      // in cloud version we do not watch files
    },
    stopWatching: function (path) {

    }
  });
  
  // map events to be published
  hFs.on('file-created', this.publish.bind(this, 'file-created'));
  hFs.on('file-removed', this.publish.bind(this, 'file-removed'));
  hFs.on('file-updated', this.publish.bind(this, 'file-updated'));
  hFs.on('directory-created', this.publish.bind(this, 'directory-created'));
  hFs.on('directory-removed', this.publish.bind(this, 'directory-removed'));
}
util.inherits(HFsIntercomm, Intercomm);

HFsIntercomm.prototype.sendMessage = function (message) {
  this.sw.clients.matchAll().then(function(clients) {
    
    clients.forEach(function(client) {
      client.postMessage(message.toJSON());
    });
  });
};

module.exports = HFsIntercomm;
