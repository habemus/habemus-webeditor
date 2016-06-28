// native dependencies
const fs   = require('fs');
const path = require('path');

// third-party dependencies
const fse        = require('fs-extra');
const Bluebird   = require('bluebird');

// promisify some methods
const _writeFile = Bluebird.promisify(fs.writeFile);
const _readdir   = Bluebird.promisify(fs.readdir);
const _readFile  = Bluebird.promisify(fs.readFile);
const _lstat     = Bluebird.promisify(fs.lstat);
const _move      = Bluebird.promisify(fse.move);
const _remove    = Bluebird.promisify(fse.remove);

// constants
const FS_ROOT_PATH = path.join(__dirname, '../../tmp');

function wait(ms) {
  return new Bluebird((resolve, reject) => {
    setTimeout(resolve, 0);
  });
}

module.exports = function (options) {

  const hfs = {
    readdirStats: function (p) {
      // build the real path
      p = path.join(FS_ROOT_PATH, p);

      // simulate very bad connection
      return wait()
        .then(() => {
          return _readdir(p)
        })
        .then((contents) => {
          return Bluebird.all(contents.map((contentName) => {

            var contentPath = path.join(p, contentName);

            return _lstat(contentPath)
              .then((stat) => {

                // process the stat object before returning
                stat.basename = contentName;

                return stat;
              });
          }));
        });
    },

    remove: function (p) {
      p = path.join(FS_ROOT_PATH, p);

      return wait()
        .then(function () {
          return _remove(p);
        });
    },

    writeFile: function (p, contents) {
      p = path.join(FS_ROOT_PATH, p);

      console.log('create file ', p, ' with contents ', contents);

      return wait()
        .then(function () {
          return _writeFile(p, contents);
        });
    },

    move: function (src, dest) {
      src = path.join(FS_ROOT_PATH, src);
      dest = path.join(FS_ROOT_PATH, dest);

      return wait().then(function () {
        return _move(src, dest);
      });
    },

    readFile: function (p, options) {
      p = path.join(FS_ROOT_PATH, p);

      return wait().then(function () {
        return _readFile(p, options);
      });
    },

    publish: function (eventName, eventData) {
      console.log('event ', eventName, eventData);
    }
  };

  return Bluebird.resolve(hfs);
}