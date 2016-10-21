(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.habemus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const TRAILING_SLASH_RE = /\/$/;
const LEADING_SLASH_RE  = /^\//;
const HTTP_PROTOCOL_RE = /^https?:\/\//;

exports.TRAILING_SLASH_RE = TRAILING_SLASH_RE;
exports.LEADING_SLASH_RE = LEADING_SLASH_RE;

exports.trimTrailingSlash = function (str) {
  return str.replace(TRAILING_SLASH_RE, '');
};

exports.HTTP_PROTOCOL_RE = HTTP_PROTOCOL_RE;

exports.hasHTTP = function (str) {
  return HTTP_PROTOCOL_RE.test(str);
};

exports.trimHTTP = function (str) {
  return str.replace(HTTP_PROTOCOL_RE, '');
};

exports.ensureHTTP = function (str) {
  return HTTP_PROTOCOL_RE.test(str) ? str : 'http://' + str;
};

exports.prefixRegExp = function (str) {
  return new RegExp('^' + str + '(.*)$');
};

exports.matchPrefix = function (prefix, str) {
  return str.match(exports.prefixRegExp(prefix), '');
};

exports.suffixRegExp = function (str) {
  return new RegExp('^(.*?)' + str + '$');
};

exports.matchSuffix = function (suffix, str) {
  return str.match(exports.suffixRegExp(suffix), '');
};

exports.curryAll = function (obj, options) {

  var res = {};

  for (var prop in obj) {
    if (typeof obj[prop] === 'function') {
      res[prop] = obj[prop].bind(null, options);
    }
  }

  return res;
}
},{}],2:[function(require,module,exports){
// native
const url = require('url');

// own
const aux     = require('../aux');
const prodFmt = require('../format');

/**
 * Formats the url for previewing a workspace's files.
 * 
 * @param  {Object} options
 *         - hWorkspaceServerURI
 *         - workspacePreviewHost
 * @param  {String} projectCode
 * @return {String}
 */
exports.workspacePreview = function (options, projectCode) {
  if (!options.hWorkspaceServerURI) {
    throw new Error('hWorkspaceServerURI is required');
  }

  if (!projectCode) {
    throw new Error('projectCode is required');
  }

  hWorkspaceServerURI = aux.trimTrailingSlash(options.hWorkspaceServerURI);

  var domain = aux.trimHTTP(prodFmt.workspacePreview(options, projectCode));

  return hWorkspaceServerURI + '/workspace/' + domain;
};

/**
 * Formats the url for accessing the workspace of a given projectCode
 * 
 * @param  {Object} options
 *         - uiWorkspaceURI
 * @param  {Object} projectCode
 * @return {String}
 */
exports.workspace = function (options, projectCode) {
  if (!options.uiWorkspaceURI) {
    throw new Error('uiWorkspaceURI is required');
  }

  return aux.trimTrailingSlash(options.uiWorkspaceURI) + '?code=' + projectCode;
};

/**
 * Formats the url for accessing the hosted website of a given
 * projectCode, optionally at a given versionCode
 * 
 * @param  {Object} options
 *         - websiteHost
 *         - hWebsiteServerURI
 * @param  {String} projectCode
 * @param  {String} versionCode
 * @return {String}
 */
exports.websiteHabemusDomain = function (options, projectCode, versionCode) {
  if (!options.hWebsiteServerURI) {
    throw new Error('hWebsiteServerURI is required');
  }

  if (!projectCode) {
    throw new Error('projectCode is required');
  }

  var domain = prodFmt.websiteHabemusDomain(options, projectCode, versionCode, {
    domainOnly: true
  });

  // to see how node.js url format works:
  // https://nodejs.org/api/url.html#url_url_format_urlobject

  // return the formatted url
  return aux.trimTrailingSlash(options.hWebsiteServerURI) + '/website/' + domain;
};

exports.websiteCustomDomain = function (options, domain) {

  if (!options.hWebsiteServerURI) {
    throw new Error('hWebsiteServerURI is required');
  }

  if (!domain) {
    throw new Error('domain is required');
  }

  domain = aux.trimHTTP(domain);

  return aux.trimTrailingSlash(options.hWebsiteServerURI) + '/website/' + domain;
};

},{"../aux":1,"../format":5,"url":85}],3:[function(require,module,exports){
// aux
const aux = require('../aux');

/**
 * Creates a curried version of all hURLsDev methods.
 * 
 * @param  {Object} options
 * @return {Object}
 */
var hURLsDev = function (options) {
  return {
    format: aux.curryAll(require('./format'), options),
    parse: aux.curryAll(require('./parse'), options),
  };
};

module.exports = hURLsDev;

},{"../aux":1,"./format":2,"./parse":4}],4:[function(require,module,exports){
// native
const url = require('url');

// own
const aux = require('../aux');

const prodParse = require('../parse');


/**
 * Parses the projectCode out of a given url
 * 
 * @param  {Object} options
 * @param  {String} srcURL
 * @return {String}
 */
exports.workspace = function (options, srcURL) {
  if (!srcURL) {
    throw new Error('srcURL is required');
  }

  var parsed = url.parse(srcURL, true);

  return {
    projectCode: parsed.query.code,
  };
};

/**
 * Parses the projectCode out of a given url
 * 
 * @param  {Object} options
 *         - hWorkspaceServerURI
 * @param  {String} projectCode
 * @return {String}
 */
exports.workspacePreview = function (options, srcURL) {
  if (!options.hWorkspaceServerURI) {
    throw new Error('hWorkspaceServerURI is required');
  }

  var prefixMatchRes = aux.matchPrefix(
    aux.trimHTTP(aux.trimTrailingSlash(options.hWorkspaceServerURI)) + '/workspace/',
    aux.trimHTTP(srcURL)
  );

  if (!prefixMatchRes) {
    return {
      projectCode: null
    };
  } else {
    var matchRes = aux.trimTrailingSlash(prefixMatchRes[1]);
    // domain is always the first part
    var domain = matchRes.split('/')[0];

    return prodParse.workspacePreview(options, domain);
  }
};


/**
 * Parses the projectCode and versionCode out of an habemus url
 * 
 * @param  {Object} options
 *         - websiteHost
 *         - hWebsiteServerURI
 * @param  {String} srcURL
 * @return {String}
 */
exports.websiteHabemusDomain = function (options, srcURL, parseOptions) {
  if (!options.hWebsiteServerURI) {
    throw new Error('hWebsiteServerURI is required');
  }

  if (!srcURL) {
    throw new Error('srcURL is required');
  }

  parseOptions = parseOptions || {};
  var domainOnly = parseOptions.domainOnly || false;

  if (domainOnly) {
    return prodParse.websiteHabemusDomain(options, srcURL);

  } else {

    var match = aux.matchPrefix(
      aux.trimHTTP(aux.trimTrailingSlash(options.hWebsiteServerURI)) + '/website/',
      aux.trimHTTP(aux.trimTrailingSlash(srcURL))
    );

    var domain = match ? match[1] : null;

    if (!domain) {
      return {
        projectCode: null,
        versionCode: null,
      };
    } else {
      return prodParse.websiteHabemusDomain(options, domain);
    }
  }
};

},{"../aux":1,"../parse":6,"url":85}],5:[function(require,module,exports){
// native
const url = require('url');

// own
const aux = require('./aux');


/**
 * Formats the url for accessing the workspace of a given projectCode
 * 
 * @param  {Object} options
 *         - workspaceHost
 * @param  {Object} projectCode
 * @return {String}
 */
exports.workspace = function (options, projectCode) {
  if (!options.workspaceHost) {
    throw new Error('workspaceHost is required');
  }

  if (!projectCode) {
    throw new Error('projectCode is required');
  }

  var res = aux.trimTrailingSlash(options.workspaceHost);
  res = aux.ensureHTTP(res);

  return res + '/workspace/' + projectCode;
};

/**
 * Formats the url for previewing a workspace's files.
 * 
 * @param  {Object} options
 *         - workspacePreviewHost
 * @param  {String} projectCode
 * @return {String}
 */
exports.workspacePreview = function (options, projectCode) {
  if (!options.workspacePreviewHost) {
    throw new Error('workspacePreviewHost is required');
  }

  var host = aux.ensureHTTP(options.workspacePreviewHost);

  var parsed = url.parse(host);
  
  // modify the host by adding a subdomain equivalent to the
  // projectCode
  parsed.host = projectCode + '.' + parsed.host;

  // to see how node.js url format works:
  // https://nodejs.org/api/url.html#url_url_format_urlobject

  // return the formatted url
  return aux.trimTrailingSlash(url.format(parsed));
};


/**
 * Formats the url for accessing the hosted website of a given
 * projectCode, optionally at a given versionCode
 * 
 * @param  {Object} options
 *         - websiteHost
 * @param  {String} projectCode
 * @param  {String} versionCode
 * @return {String}
 */
exports.websiteHabemusDomain = function (options, projectCode, versionCode, formatOptions) {
  if (!options.websiteHost) {
    throw new Error('websiteHost is required');
  }

  if (!projectCode) {
    throw new Error('projectCode is required');
  }

  formatOptions = formatOptions || {};

  var domainOnly = formatOptions.domainOnly || false;

  var host;
  var res;

  if (domainOnly) {

    host = aux.trimHTTP(options.websiteHost);

    res = projectCode + '.' + host;

    if (versionCode) {
      res = versionCode + '.' + res;
    }

  } else {

    host = aux.ensureHTTP(options.websiteHost);

    var parsed = url.parse(host);
    
    // modify the host by adding a subdomain equivalent to the
    // projectCode
    parsed.host = projectCode + '.' + parsed.host;

    if (versionCode) {
      parsed.host = versionCode + '.' + parsed.host;
    }

    // to see how node.js url format works:
    // https://nodejs.org/api/url.html#url_url_format_urlobject
    res = url.format(parsed);
  }

  return aux.trimTrailingSlash(res);
};

exports.websiteCustomDomain = function (options, domain, formatOptions) {

  if (!domain) {
    throw new Error('domain is required');
  }

  formatOptions = formatOptions || {};

  return formatOptions.domainOnly ? aux.trimHTTP(domain) : aux.ensureHTTP(domain);
};

},{"./aux":1,"url":85}],6:[function(require,module,exports){
// native
const url = require('url');

// own
const aux = require('./aux');


/**
 * Parses the projectCode out of a given url
 * 
 * @param  {Object} options
 *         - workspaceHost
 * @param  {String} srcURL
 * @return {Object}
 */
exports.workspace = function (options, srcURL) {
  if (!options.workspaceHost) {
    throw new Error('workspaceHost is required');
  }

  if (!srcURL) {
    throw new Error('srcURL is required');
  }

  var match = aux.matchPrefix(
    aux.trimHTTP(aux.trimTrailingSlash(options.workspaceHost)) + '/workspace/',
    aux.trimHTTP(srcURL)
  );

  return {
    projectCode: match ? match[1] : null,
  };
};

/**
 * Parses the projectCode out of the given url
 * 
 * @param  {Object} options
 *         - workspacePreviewHost
 * @param  {String} srcURL
 * @return {String}
 */
exports.workspacePreview = function (options, srcURL) {
  if (!options.workspacePreviewHost) {
    throw new Error('workspacePreviewHost is required');
  }

  var match = aux.matchSuffix(
    '.' + aux.trimHTTP(aux.trimTrailingSlash(options.workspacePreviewHost)),
    aux.trimHTTP(aux.trimTrailingSlash(srcURL))
  );

  return {
    projectCode: match ? match[1] : null
  };
};


/**
 * Parses the projectCode and versionCode out of a given url
 * 
 * @param  {Object} options
 *         - websiteHost
 * @param  {String} srcURL
 * @return {String}
 */
exports.websiteHabemusDomain = function (options, srcURL) {
  if (!options.websiteHost) {
    throw new Error('websiteHost is required');
  }

  if (!srcURL) {
    throw new Error('srcURL is required');
  }

  var projectCode;
  var versionCode;

  // retrieve the string that has the versionCode and projectCode
  // candidates
  var match = aux.matchSuffix(
    '.' + aux.trimHTTP(aux.trimTrailingSlash(options.websiteHost)),
    aux.trimHTTP(aux.trimTrailingSlash(srcURL))
  );

  var dataString = match ? match[1] : null;

  if (!dataString) {
    projectCode = null;
    versionCode = null;
  } else {
    var split = dataString.split('.');

    if (split.length === 2) {
      // version and project
      versionCode = split[0];
      projectCode = split[1];

    } else if (split.length === 1) {
      // project only
      versionCode = null;
      projectCode = split[0];

    } else {
      // does not match anything
      versionCode = null;
      projectCode = null;
    }
  }

  return {
    projectCode: projectCode,
    versionCode: versionCode,
  };
};

},{"./aux":1,"url":85}],7:[function(require,module,exports){
"use strict";
// native
const url = require('url');

// third-party
const Bluebird = require('bluebird');

// injected
const habemusEditorUrls = require('habemus-editor-urls');

const pkg = require('../../../../package.json');

module.exports = function (habemus, options) {

  console.log('load configs for `browser-sw` environment');

  var locationString = window.location.toString();

  // get project code from the url
  var projectCode = habemusEditorUrls.parse.workspace(locationString).projectCode;
  if (!projectCode) {
    var err = new Error('could not parse projectCode');

    // error is equivalent to `NotFound`
    err.name = 'NotFound';

    throw err;
  }

  return new Bluebird(function (resolve, reject) {
    resolve({
      apiVersion: pkg.version,
      projectId: projectCode,
      projectName: projectCode,
    });
  });

};

},{"../../../../package.json":90,"bluebird":11,"habemus-editor-urls":"habemus-editor-urls","url":85}],8:[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

// injected
const habemusEditorUrls = require('habemus-editor-urls');

module.exports = function (habemus, options) {

  const projectId = habemus.services.config.projectId;

  return new Bluebird(function (resolve, reject) {

    var hDev = {};

    hDev.projectRootURL = habemusEditorUrls.format.workspacePreview(projectId);

    // functions
    hDev.pathExists = function (path) {
      console.log('pathExists', path);

      return Bluebird.resolve(false);
    };

    hDev.remove = function (path) {
      console.log('remove', path);

      return Bluebird.resolve();
    };

    hDev.move = function (path) {
      console.log('move', arguments);

      return Bluebird.resolve();
    };

    hDev.readDirectory = function (dirpath) {
      console.log('readDirectory', arguments);
      return Bluebird.resolve([]);
    };

    hDev.createFile = function (filepath, contents) {
      console.log('createFile', arguments);

      return Bluebird.resolve();
    };

    hDev.createDirectory = function (dirpath) {
      console.log('createDirectory', arguments);

      return Bluebird.resolve();
    };

    hDev.subscribe = function () {
      console.log('subscribe', arguments);

      return Bluebird.resolve();
    };

    hDev.startWatching = function () {
      console.log('startWatching', arguments);
      return Bluebird.resolve();
    };

    hDev.stopWatching = function () {
      console.log('stopWatching', arguments);
      return Bluebird.resolve();
    };

    resolve(hDev);
  });

};

},{"bluebird":11,"habemus-editor-urls":"habemus-editor-urls"}],9:[function(require,module,exports){
(function (process,__filename){
/** vim: et:ts=4:sw=4:sts=4
 * @license amdefine 1.0.0 Copyright (c) 2011-2015, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/amdefine for details
 */

/*jslint node: true */
/*global module, process */
'use strict';

/**
 * Creates a define for node.
 * @param {Object} module the "module" object that is defined by Node for the
 * current module.
 * @param {Function} [requireFn]. Node's require function for the current module.
 * It only needs to be passed in Node versions before 0.5, when module.require
 * did not exist.
 * @returns {Function} a define function that is usable for the current node
 * module.
 */
function amdefine(module, requireFn) {
    'use strict';
    var defineCache = {},
        loaderCache = {},
        alreadyCalled = false,
        path = require('path'),
        makeRequire, stringRequire;

    /**
     * Trims the . and .. from an array of path segments.
     * It will keep a leading path segment if a .. will become
     * the first path segment, to help with module name lookups,
     * which act like paths, but can be remapped. But the end result,
     * all paths that use this function should look normalized.
     * NOTE: this method MODIFIES the input array.
     * @param {Array} ary the array of path segments.
     */
    function trimDots(ary) {
        var i, part;
        for (i = 0; ary[i]; i+= 1) {
            part = ary[i];
            if (part === '.') {
                ary.splice(i, 1);
                i -= 1;
            } else if (part === '..') {
                if (i === 1 && (ary[2] === '..' || ary[0] === '..')) {
                    //End of the line. Keep at least one non-dot
                    //path segment at the front so it can be mapped
                    //correctly to disk. Otherwise, there is likely
                    //no path mapping for a path starting with '..'.
                    //This can still fail, but catches the most reasonable
                    //uses of ..
                    break;
                } else if (i > 0) {
                    ary.splice(i - 1, 2);
                    i -= 2;
                }
            }
        }
    }

    function normalize(name, baseName) {
        var baseParts;

        //Adjust any relative paths.
        if (name && name.charAt(0) === '.') {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                baseParts = baseName.split('/');
                baseParts = baseParts.slice(0, baseParts.length - 1);
                baseParts = baseParts.concat(name.split('/'));
                trimDots(baseParts);
                name = baseParts.join('/');
            }
        }

        return name;
    }

    /**
     * Create the normalize() function passed to a loader plugin's
     * normalize method.
     */
    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(id) {
        function load(value) {
            loaderCache[id] = value;
        }

        load.fromText = function (id, text) {
            //This one is difficult because the text can/probably uses
            //define, and any relative paths and requires should be relative
            //to that id was it would be found on disk. But this would require
            //bootstrapping a module/require fairly deeply from node core.
            //Not sure how best to go about that yet.
            throw new Error('amdefine does not implement load.fromText');
        };

        return load;
    }

    makeRequire = function (systemRequire, exports, module, relId) {
        function amdRequire(deps, callback) {
            if (typeof deps === 'string') {
                //Synchronous, single module require('')
                return stringRequire(systemRequire, exports, module, deps, relId);
            } else {
                //Array of dependencies with a callback.

                //Convert the dependencies to modules.
                deps = deps.map(function (depName) {
                    return stringRequire(systemRequire, exports, module, depName, relId);
                });

                //Wait for next tick to call back the require call.
                if (callback) {
                    process.nextTick(function () {
                        callback.apply(null, deps);
                    });
                }
            }
        }

        amdRequire.toUrl = function (filePath) {
            if (filePath.indexOf('.') === 0) {
                return normalize(filePath, path.dirname(module.filename));
            } else {
                return filePath;
            }
        };

        return amdRequire;
    };

    //Favor explicit value, passed in if the module wants to support Node 0.4.
    requireFn = requireFn || function req() {
        return module.require.apply(module, arguments);
    };

    function runFactory(id, deps, factory) {
        var r, e, m, result;

        if (id) {
            e = loaderCache[id] = {};
            m = {
                id: id,
                uri: __filename,
                exports: e
            };
            r = makeRequire(requireFn, e, m, id);
        } else {
            //Only support one define call per file
            if (alreadyCalled) {
                throw new Error('amdefine with no module ID cannot be called more than once per file.');
            }
            alreadyCalled = true;

            //Use the real variables from node
            //Use module.exports for exports, since
            //the exports in here is amdefine exports.
            e = module.exports;
            m = module;
            r = makeRequire(requireFn, e, m, module.id);
        }

        //If there are dependencies, they are strings, so need
        //to convert them to dependency values.
        if (deps) {
            deps = deps.map(function (depName) {
                return r(depName);
            });
        }

        //Call the factory with the right dependencies.
        if (typeof factory === 'function') {
            result = factory.apply(m.exports, deps);
        } else {
            result = factory;
        }

        if (result !== undefined) {
            m.exports = result;
            if (id) {
                loaderCache[id] = m.exports;
            }
        }
    }

    stringRequire = function (systemRequire, exports, module, id, relId) {
        //Split the ID by a ! so that
        var index = id.indexOf('!'),
            originalId = id,
            prefix, plugin;

        if (index === -1) {
            id = normalize(id, relId);

            //Straight module lookup. If it is one of the special dependencies,
            //deal with it, otherwise, delegate to node.
            if (id === 'require') {
                return makeRequire(systemRequire, exports, module, relId);
            } else if (id === 'exports') {
                return exports;
            } else if (id === 'module') {
                return module;
            } else if (loaderCache.hasOwnProperty(id)) {
                return loaderCache[id];
            } else if (defineCache[id]) {
                runFactory.apply(null, defineCache[id]);
                return loaderCache[id];
            } else {
                if(systemRequire) {
                    return systemRequire(originalId);
                } else {
                    throw new Error('No module with ID: ' + id);
                }
            }
        } else {
            //There is a plugin in play.
            prefix = id.substring(0, index);
            id = id.substring(index + 1, id.length);

            plugin = stringRequire(systemRequire, exports, module, prefix, relId);

            if (plugin.normalize) {
                id = plugin.normalize(id, makeNormalize(relId));
            } else {
                //Normalize the ID normally.
                id = normalize(id, relId);
            }

            if (loaderCache[id]) {
                return loaderCache[id];
            } else {
                plugin.load(id, makeRequire(systemRequire, exports, module, relId), makeLoad(id), {});

                return loaderCache[id];
            }
        }
    };

    //Create a define function specific to the module asking for amdefine.
    function define(id, deps, factory) {
        if (Array.isArray(id)) {
            factory = deps;
            deps = id;
            id = undefined;
        } else if (typeof id !== 'string') {
            factory = id;
            id = deps = undefined;
        }

        if (deps && !Array.isArray(deps)) {
            factory = deps;
            deps = undefined;
        }

        if (!deps) {
            deps = ['require', 'exports', 'module'];
        }

        //Set up properties for this module. If an ID, then use
        //internal cache. If no ID, then use the external variables
        //for this node module.
        if (id) {
            //Put the module in deep freeze until there is a
            //require call for it.
            defineCache[id] = [id, deps, factory];
        } else {
            runFactory(id, deps, factory);
        }
    }

    //define.require, which has access to all the values in the
    //cache. Useful for AMD modules that all have IDs in the file,
    //but need to finally export a value to node based on one of those
    //IDs.
    define.require = function (id) {
        if (loaderCache[id]) {
            return loaderCache[id];
        }

        if (defineCache[id]) {
            runFactory.apply(null, defineCache[id]);
            return loaderCache[id];
        }
    };

    define.amd = {};

    return define;
}

module.exports = amdefine;

}).call(this,require('_process'),"/node_modules/amdefine/amdefine.js")
},{"_process":65,"path":64}],10:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],11:[function(require,module,exports){
(function (process,global){
/* @preserve
 * The MIT License (MIT)
 * 
 * Copyright (c) 2013-2015 Petka Antonov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */
/**
 * bluebird build version 3.4.6
 * Features enabled: core, race, call_get, generators, map, nodeify, promisify, props, reduce, settle, some, using, timers, filter, any, each
*/
!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Promise=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof _dereq_=="function"&&_dereq_;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof _dereq_=="function"&&_dereq_;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var SomePromiseArray = Promise._SomePromiseArray;
function any(promises) {
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(1);
    ret.setUnwrap();
    ret.init();
    return promise;
}

Promise.any = function (promises) {
    return any(promises);
};

Promise.prototype.any = function () {
    return any(this);
};

};

},{}],2:[function(_dereq_,module,exports){
"use strict";
var firstLineError;
try {throw new Error(); } catch (e) {firstLineError = e;}
var schedule = _dereq_("./schedule");
var Queue = _dereq_("./queue");
var util = _dereq_("./util");

function Async() {
    this._customScheduler = false;
    this._isTickUsed = false;
    this._lateQueue = new Queue(16);
    this._normalQueue = new Queue(16);
    this._haveDrainedQueues = false;
    this._trampolineEnabled = true;
    var self = this;
    this.drainQueues = function () {
        self._drainQueues();
    };
    this._schedule = schedule;
}

Async.prototype.setScheduler = function(fn) {
    var prev = this._schedule;
    this._schedule = fn;
    this._customScheduler = true;
    return prev;
};

Async.prototype.hasCustomScheduler = function() {
    return this._customScheduler;
};

Async.prototype.enableTrampoline = function() {
    this._trampolineEnabled = true;
};

Async.prototype.disableTrampolineIfNecessary = function() {
    if (util.hasDevTools) {
        this._trampolineEnabled = false;
    }
};

Async.prototype.haveItemsQueued = function () {
    return this._isTickUsed || this._haveDrainedQueues;
};


Async.prototype.fatalError = function(e, isNode) {
    if (isNode) {
        process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
            "\n");
        process.exit(2);
    } else {
        this.throwLater(e);
    }
};

Async.prototype.throwLater = function(fn, arg) {
    if (arguments.length === 1) {
        arg = fn;
        fn = function () { throw arg; };
    }
    if (typeof setTimeout !== "undefined") {
        setTimeout(function() {
            fn(arg);
        }, 0);
    } else try {
        this._schedule(function() {
            fn(arg);
        });
    } catch (e) {
        throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
};

function AsyncInvokeLater(fn, receiver, arg) {
    this._lateQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncInvoke(fn, receiver, arg) {
    this._normalQueue.push(fn, receiver, arg);
    this._queueTick();
}

function AsyncSettlePromises(promise) {
    this._normalQueue._pushOne(promise);
    this._queueTick();
}

if (!util.hasDevTools) {
    Async.prototype.invokeLater = AsyncInvokeLater;
    Async.prototype.invoke = AsyncInvoke;
    Async.prototype.settlePromises = AsyncSettlePromises;
} else {
    Async.prototype.invokeLater = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvokeLater.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                setTimeout(function() {
                    fn.call(receiver, arg);
                }, 100);
            });
        }
    };

    Async.prototype.invoke = function (fn, receiver, arg) {
        if (this._trampolineEnabled) {
            AsyncInvoke.call(this, fn, receiver, arg);
        } else {
            this._schedule(function() {
                fn.call(receiver, arg);
            });
        }
    };

    Async.prototype.settlePromises = function(promise) {
        if (this._trampolineEnabled) {
            AsyncSettlePromises.call(this, promise);
        } else {
            this._schedule(function() {
                promise._settlePromises();
            });
        }
    };
}

Async.prototype.invokeFirst = function (fn, receiver, arg) {
    this._normalQueue.unshift(fn, receiver, arg);
    this._queueTick();
};

Async.prototype._drainQueue = function(queue) {
    while (queue.length() > 0) {
        var fn = queue.shift();
        if (typeof fn !== "function") {
            fn._settlePromises();
            continue;
        }
        var receiver = queue.shift();
        var arg = queue.shift();
        fn.call(receiver, arg);
    }
};

Async.prototype._drainQueues = function () {
    this._drainQueue(this._normalQueue);
    this._reset();
    this._haveDrainedQueues = true;
    this._drainQueue(this._lateQueue);
};

Async.prototype._queueTick = function () {
    if (!this._isTickUsed) {
        this._isTickUsed = true;
        this._schedule(this.drainQueues);
    }
};

Async.prototype._reset = function () {
    this._isTickUsed = false;
};

module.exports = Async;
module.exports.firstLineError = firstLineError;

},{"./queue":26,"./schedule":29,"./util":36}],3:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise, debug) {
var calledBind = false;
var rejectThis = function(_, e) {
    this._reject(e);
};

var targetRejected = function(e, context) {
    context.promiseRejectionQueued = true;
    context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
};

var bindingResolved = function(thisArg, context) {
    if (((this._bitField & 50397184) === 0)) {
        this._resolveCallback(context.target);
    }
};

var bindingRejected = function(e, context) {
    if (!context.promiseRejectionQueued) this._reject(e);
};

Promise.prototype.bind = function (thisArg) {
    if (!calledBind) {
        calledBind = true;
        Promise.prototype._propagateFrom = debug.propagateFromFunction();
        Promise.prototype._boundValue = debug.boundValueFunction();
    }
    var maybePromise = tryConvertToPromise(thisArg);
    var ret = new Promise(INTERNAL);
    ret._propagateFrom(this, 1);
    var target = this._target();
    ret._setBoundTo(maybePromise);
    if (maybePromise instanceof Promise) {
        var context = {
            promiseRejectionQueued: false,
            promise: ret,
            target: target,
            bindingPromise: maybePromise
        };
        target._then(INTERNAL, targetRejected, undefined, ret, context);
        maybePromise._then(
            bindingResolved, bindingRejected, undefined, ret, context);
        ret._setOnCancel(maybePromise);
    } else {
        ret._resolveCallback(target);
    }
    return ret;
};

Promise.prototype._setBoundTo = function (obj) {
    if (obj !== undefined) {
        this._bitField = this._bitField | 2097152;
        this._boundTo = obj;
    } else {
        this._bitField = this._bitField & (~2097152);
    }
};

Promise.prototype._isBound = function () {
    return (this._bitField & 2097152) === 2097152;
};

Promise.bind = function (thisArg, value) {
    return Promise.resolve(value).bind(thisArg);
};
};

},{}],4:[function(_dereq_,module,exports){
"use strict";
var old;
if (typeof Promise !== "undefined") old = Promise;
function noConflict() {
    try { if (Promise === bluebird) Promise = old; }
    catch (e) {}
    return bluebird;
}
var bluebird = _dereq_("./promise")();
bluebird.noConflict = noConflict;
module.exports = bluebird;

},{"./promise":22}],5:[function(_dereq_,module,exports){
"use strict";
var cr = Object.create;
if (cr) {
    var callerCache = cr(null);
    var getterCache = cr(null);
    callerCache[" size"] = getterCache[" size"] = 0;
}

module.exports = function(Promise) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var isIdentifier = util.isIdentifier;

var getMethodCaller;
var getGetter;
if (!true) {
var makeMethodCaller = function (methodName) {
    return new Function("ensureMethod", "                                    \n\
        return function(obj) {                                               \n\
            'use strict'                                                     \n\
            var len = this.length;                                           \n\
            ensureMethod(obj, 'methodName');                                 \n\
            switch(len) {                                                    \n\
                case 1: return obj.methodName(this[0]);                      \n\
                case 2: return obj.methodName(this[0], this[1]);             \n\
                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
                case 0: return obj.methodName();                             \n\
                default:                                                     \n\
                    return obj.methodName.apply(obj, this);                  \n\
            }                                                                \n\
        };                                                                   \n\
        ".replace(/methodName/g, methodName))(ensureMethod);
};

var makeGetter = function (propertyName) {
    return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
};

var getCompiled = function(name, compiler, cache) {
    var ret = cache[name];
    if (typeof ret !== "function") {
        if (!isIdentifier(name)) {
            return null;
        }
        ret = compiler(name);
        cache[name] = ret;
        cache[" size"]++;
        if (cache[" size"] > 512) {
            var keys = Object.keys(cache);
            for (var i = 0; i < 256; ++i) delete cache[keys[i]];
            cache[" size"] = keys.length - 256;
        }
    }
    return ret;
};

getMethodCaller = function(name) {
    return getCompiled(name, makeMethodCaller, callerCache);
};

getGetter = function(name) {
    return getCompiled(name, makeGetter, getterCache);
};
}

function ensureMethod(obj, methodName) {
    var fn;
    if (obj != null) fn = obj[methodName];
    if (typeof fn !== "function") {
        var message = "Object " + util.classString(obj) + " has no method '" +
            util.toString(methodName) + "'";
        throw new Promise.TypeError(message);
    }
    return fn;
}

function caller(obj) {
    var methodName = this.pop();
    var fn = ensureMethod(obj, methodName);
    return fn.apply(obj, this);
}
Promise.prototype.call = function (methodName) {
    var args = [].slice.call(arguments, 1);;
    if (!true) {
        if (canEvaluate) {
            var maybeCaller = getMethodCaller(methodName);
            if (maybeCaller !== null) {
                return this._then(
                    maybeCaller, undefined, undefined, args, undefined);
            }
        }
    }
    args.push(methodName);
    return this._then(caller, undefined, undefined, args, undefined);
};

function namedGetter(obj) {
    return obj[this];
}
function indexedGetter(obj) {
    var index = +this;
    if (index < 0) index = Math.max(0, index + obj.length);
    return obj[index];
}
Promise.prototype.get = function (propertyName) {
    var isIndex = (typeof propertyName === "number");
    var getter;
    if (!isIndex) {
        if (canEvaluate) {
            var maybeGetter = getGetter(propertyName);
            getter = maybeGetter !== null ? maybeGetter : namedGetter;
        } else {
            getter = namedGetter;
        }
    } else {
        getter = indexedGetter;
    }
    return this._then(getter, undefined, undefined, propertyName, undefined);
};
};

},{"./util":36}],6:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, PromiseArray, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

Promise.prototype["break"] = Promise.prototype.cancel = function() {
    if (!debug.cancellation()) return this._warn("cancellation is disabled");

    var promise = this;
    var child = promise;
    while (promise._isCancellable()) {
        if (!promise._cancelBy(child)) {
            if (child._isFollowing()) {
                child._followee().cancel();
            } else {
                child._cancelBranched();
            }
            break;
        }

        var parent = promise._cancellationParent;
        if (parent == null || !parent._isCancellable()) {
            if (promise._isFollowing()) {
                promise._followee().cancel();
            } else {
                promise._cancelBranched();
            }
            break;
        } else {
            if (promise._isFollowing()) promise._followee().cancel();
            promise._setWillBeCancelled();
            child = promise;
            promise = parent;
        }
    }
};

Promise.prototype._branchHasCancelled = function() {
    this._branchesRemainingToCancel--;
};

Promise.prototype._enoughBranchesHaveCancelled = function() {
    return this._branchesRemainingToCancel === undefined ||
           this._branchesRemainingToCancel <= 0;
};

Promise.prototype._cancelBy = function(canceller) {
    if (canceller === this) {
        this._branchesRemainingToCancel = 0;
        this._invokeOnCancel();
        return true;
    } else {
        this._branchHasCancelled();
        if (this._enoughBranchesHaveCancelled()) {
            this._invokeOnCancel();
            return true;
        }
    }
    return false;
};

Promise.prototype._cancelBranched = function() {
    if (this._enoughBranchesHaveCancelled()) {
        this._cancel();
    }
};

Promise.prototype._cancel = function() {
    if (!this._isCancellable()) return;
    this._setCancelled();
    async.invoke(this._cancelPromises, this, undefined);
};

Promise.prototype._cancelPromises = function() {
    if (this._length() > 0) this._settlePromises();
};

Promise.prototype._unsetOnCancel = function() {
    this._onCancelField = undefined;
};

Promise.prototype._isCancellable = function() {
    return this.isPending() && !this._isCancelled();
};

Promise.prototype.isCancellable = function() {
    return this.isPending() && !this.isCancelled();
};

Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
    if (util.isArray(onCancelCallback)) {
        for (var i = 0; i < onCancelCallback.length; ++i) {
            this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
        }
    } else if (onCancelCallback !== undefined) {
        if (typeof onCancelCallback === "function") {
            if (!internalOnly) {
                var e = tryCatch(onCancelCallback).call(this._boundValue());
                if (e === errorObj) {
                    this._attachExtraTrace(e.e);
                    async.throwLater(e.e);
                }
            }
        } else {
            onCancelCallback._resultCancelled(this);
        }
    }
};

Promise.prototype._invokeOnCancel = function() {
    var onCancelCallback = this._onCancel();
    this._unsetOnCancel();
    async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
};

Promise.prototype._invokeInternalOnCancel = function() {
    if (this._isCancellable()) {
        this._doInvokeOnCancel(this._onCancel(), true);
        this._unsetOnCancel();
    }
};

Promise.prototype._resultCancelled = function() {
    this.cancel();
};

};

},{"./util":36}],7:[function(_dereq_,module,exports){
"use strict";
module.exports = function(NEXT_FILTER) {
var util = _dereq_("./util");
var getKeys = _dereq_("./es5").keys;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function catchFilter(instances, cb, promise) {
    return function(e) {
        var boundTo = promise._boundValue();
        predicateLoop: for (var i = 0; i < instances.length; ++i) {
            var item = instances[i];

            if (item === Error ||
                (item != null && item.prototype instanceof Error)) {
                if (e instanceof item) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (typeof item === "function") {
                var matchesPredicate = tryCatch(item).call(boundTo, e);
                if (matchesPredicate === errorObj) {
                    return matchesPredicate;
                } else if (matchesPredicate) {
                    return tryCatch(cb).call(boundTo, e);
                }
            } else if (util.isObject(e)) {
                var keys = getKeys(item);
                for (var j = 0; j < keys.length; ++j) {
                    var key = keys[j];
                    if (item[key] != e[key]) {
                        continue predicateLoop;
                    }
                }
                return tryCatch(cb).call(boundTo, e);
            }
        }
        return NEXT_FILTER;
    };
}

return catchFilter;
};

},{"./es5":13,"./util":36}],8:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var longStackTraces = false;
var contextStack = [];

Promise.prototype._promiseCreated = function() {};
Promise.prototype._pushContext = function() {};
Promise.prototype._popContext = function() {return null;};
Promise._peekContext = Promise.prototype._peekContext = function() {};

function Context() {
    this._trace = new Context.CapturedTrace(peekContext());
}
Context.prototype._pushContext = function () {
    if (this._trace !== undefined) {
        this._trace._promiseCreated = null;
        contextStack.push(this._trace);
    }
};

Context.prototype._popContext = function () {
    if (this._trace !== undefined) {
        var trace = contextStack.pop();
        var ret = trace._promiseCreated;
        trace._promiseCreated = null;
        return ret;
    }
    return null;
};

function createContext() {
    if (longStackTraces) return new Context();
}

function peekContext() {
    var lastIndex = contextStack.length - 1;
    if (lastIndex >= 0) {
        return contextStack[lastIndex];
    }
    return undefined;
}
Context.CapturedTrace = null;
Context.create = createContext;
Context.deactivateLongStackTraces = function() {};
Context.activateLongStackTraces = function() {
    var Promise_pushContext = Promise.prototype._pushContext;
    var Promise_popContext = Promise.prototype._popContext;
    var Promise_PeekContext = Promise._peekContext;
    var Promise_peekContext = Promise.prototype._peekContext;
    var Promise_promiseCreated = Promise.prototype._promiseCreated;
    Context.deactivateLongStackTraces = function() {
        Promise.prototype._pushContext = Promise_pushContext;
        Promise.prototype._popContext = Promise_popContext;
        Promise._peekContext = Promise_PeekContext;
        Promise.prototype._peekContext = Promise_peekContext;
        Promise.prototype._promiseCreated = Promise_promiseCreated;
        longStackTraces = false;
    };
    longStackTraces = true;
    Promise.prototype._pushContext = Context.prototype._pushContext;
    Promise.prototype._popContext = Context.prototype._popContext;
    Promise._peekContext = Promise.prototype._peekContext = peekContext;
    Promise.prototype._promiseCreated = function() {
        var ctx = this._peekContext();
        if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
    };
};
return Context;
};

},{}],9:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, Context) {
var getDomain = Promise._getDomain;
var async = Promise._async;
var Warning = _dereq_("./errors").Warning;
var util = _dereq_("./util");
var canAttachTrace = util.canAttachTrace;
var unhandledRejectionHandled;
var possiblyUnhandledRejection;
var bluebirdFramePattern =
    /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
var stackFramePattern = null;
var formatStack = null;
var indentStackFrames = false;
var printWarning;
var debugging = !!(util.env("BLUEBIRD_DEBUG") != 0 &&
                        (true ||
                         util.env("BLUEBIRD_DEBUG") ||
                         util.env("NODE_ENV") === "development"));

var warnings = !!(util.env("BLUEBIRD_WARNINGS") != 0 &&
    (debugging || util.env("BLUEBIRD_WARNINGS")));

var longStackTraces = !!(util.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
    (debugging || util.env("BLUEBIRD_LONG_STACK_TRACES")));

var wForgottenReturn = util.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
    (warnings || !!util.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

Promise.prototype.suppressUnhandledRejections = function() {
    var target = this._target();
    target._bitField = ((target._bitField & (~1048576)) |
                      524288);
};

Promise.prototype._ensurePossibleRejectionHandled = function () {
    if ((this._bitField & 524288) !== 0) return;
    this._setRejectionIsUnhandled();
    async.invokeLater(this._notifyUnhandledRejection, this, undefined);
};

Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
    fireRejectionEvent("rejectionHandled",
                                  unhandledRejectionHandled, undefined, this);
};

Promise.prototype._setReturnedNonUndefined = function() {
    this._bitField = this._bitField | 268435456;
};

Promise.prototype._returnedNonUndefined = function() {
    return (this._bitField & 268435456) !== 0;
};

Promise.prototype._notifyUnhandledRejection = function () {
    if (this._isRejectionUnhandled()) {
        var reason = this._settledValue();
        this._setUnhandledRejectionIsNotified();
        fireRejectionEvent("unhandledRejection",
                                      possiblyUnhandledRejection, reason, this);
    }
};

Promise.prototype._setUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField | 262144;
};

Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
    this._bitField = this._bitField & (~262144);
};

Promise.prototype._isUnhandledRejectionNotified = function () {
    return (this._bitField & 262144) > 0;
};

Promise.prototype._setRejectionIsUnhandled = function () {
    this._bitField = this._bitField | 1048576;
};

Promise.prototype._unsetRejectionIsUnhandled = function () {
    this._bitField = this._bitField & (~1048576);
    if (this._isUnhandledRejectionNotified()) {
        this._unsetUnhandledRejectionIsNotified();
        this._notifyUnhandledRejectionIsHandled();
    }
};

Promise.prototype._isRejectionUnhandled = function () {
    return (this._bitField & 1048576) > 0;
};

Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
    return warn(message, shouldUseOwnTrace, promise || this);
};

Promise.onPossiblyUnhandledRejection = function (fn) {
    var domain = getDomain();
    possiblyUnhandledRejection =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

Promise.onUnhandledRejectionHandled = function (fn) {
    var domain = getDomain();
    unhandledRejectionHandled =
        typeof fn === "function" ? (domain === null ?
                                            fn : util.domainBind(domain, fn))
                                 : undefined;
};

var disableLongStackTraces = function() {};
Promise.longStackTraces = function () {
    if (async.haveItemsQueued() && !config.longStackTraces) {
        throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    if (!config.longStackTraces && longStackTracesIsSupported()) {
        var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
        var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
        config.longStackTraces = true;
        disableLongStackTraces = function() {
            if (async.haveItemsQueued() && !config.longStackTraces) {
                throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
            }
            Promise.prototype._captureStackTrace = Promise_captureStackTrace;
            Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
            Context.deactivateLongStackTraces();
            async.enableTrampoline();
            config.longStackTraces = false;
        };
        Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
        Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
        Context.activateLongStackTraces();
        async.disableTrampolineIfNecessary();
    }
};

Promise.hasLongStackTraces = function () {
    return config.longStackTraces && longStackTracesIsSupported();
};

var fireDomEvent = (function() {
    try {
        if (typeof CustomEvent === "function") {
            var event = new CustomEvent("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new CustomEvent(name.toLowerCase(), {
                    detail: event,
                    cancelable: true
                });
                return !util.global.dispatchEvent(domEvent);
            };
        } else if (typeof Event === "function") {
            var event = new Event("CustomEvent");
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = new Event(name.toLowerCase(), {
                    cancelable: true
                });
                domEvent.detail = event;
                return !util.global.dispatchEvent(domEvent);
            };
        } else {
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("testingtheevent", false, true, {});
            util.global.dispatchEvent(event);
            return function(name, event) {
                var domEvent = document.createEvent("CustomEvent");
                domEvent.initCustomEvent(name.toLowerCase(), false, true,
                    event);
                return !util.global.dispatchEvent(domEvent);
            };
        }
    } catch (e) {}
    return function() {
        return false;
    };
})();

var fireGlobalEvent = (function() {
    if (util.isNode) {
        return function() {
            return process.emit.apply(process, arguments);
        };
    } else {
        if (!util.global) {
            return function() {
                return false;
            };
        }
        return function(name) {
            var methodName = "on" + name.toLowerCase();
            var method = util.global[methodName];
            if (!method) return false;
            method.apply(util.global, [].slice.call(arguments, 1));
            return true;
        };
    }
})();

function generatePromiseLifecycleEventObject(name, promise) {
    return {promise: promise};
}

var eventToObjectGenerator = {
    promiseCreated: generatePromiseLifecycleEventObject,
    promiseFulfilled: generatePromiseLifecycleEventObject,
    promiseRejected: generatePromiseLifecycleEventObject,
    promiseResolved: generatePromiseLifecycleEventObject,
    promiseCancelled: generatePromiseLifecycleEventObject,
    promiseChained: function(name, promise, child) {
        return {promise: promise, child: child};
    },
    warning: function(name, warning) {
        return {warning: warning};
    },
    unhandledRejection: function (name, reason, promise) {
        return {reason: reason, promise: promise};
    },
    rejectionHandled: generatePromiseLifecycleEventObject
};

var activeFireEvent = function (name) {
    var globalEventFired = false;
    try {
        globalEventFired = fireGlobalEvent.apply(null, arguments);
    } catch (e) {
        async.throwLater(e);
        globalEventFired = true;
    }

    var domEventFired = false;
    try {
        domEventFired = fireDomEvent(name,
                    eventToObjectGenerator[name].apply(null, arguments));
    } catch (e) {
        async.throwLater(e);
        domEventFired = true;
    }

    return domEventFired || globalEventFired;
};

Promise.config = function(opts) {
    opts = Object(opts);
    if ("longStackTraces" in opts) {
        if (opts.longStackTraces) {
            Promise.longStackTraces();
        } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
            disableLongStackTraces();
        }
    }
    if ("warnings" in opts) {
        var warningsOption = opts.warnings;
        config.warnings = !!warningsOption;
        wForgottenReturn = config.warnings;

        if (util.isObject(warningsOption)) {
            if ("wForgottenReturn" in warningsOption) {
                wForgottenReturn = !!warningsOption.wForgottenReturn;
            }
        }
    }
    if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
        if (async.haveItemsQueued()) {
            throw new Error(
                "cannot enable cancellation after promises are in use");
        }
        Promise.prototype._clearCancellationData =
            cancellationClearCancellationData;
        Promise.prototype._propagateFrom = cancellationPropagateFrom;
        Promise.prototype._onCancel = cancellationOnCancel;
        Promise.prototype._setOnCancel = cancellationSetOnCancel;
        Promise.prototype._attachCancellationCallback =
            cancellationAttachCancellationCallback;
        Promise.prototype._execute = cancellationExecute;
        propagateFromFunction = cancellationPropagateFrom;
        config.cancellation = true;
    }
    if ("monitoring" in opts) {
        if (opts.monitoring && !config.monitoring) {
            config.monitoring = true;
            Promise.prototype._fireEvent = activeFireEvent;
        } else if (!opts.monitoring && config.monitoring) {
            config.monitoring = false;
            Promise.prototype._fireEvent = defaultFireEvent;
        }
    }
};

function defaultFireEvent() { return false; }

Promise.prototype._fireEvent = defaultFireEvent;
Promise.prototype._execute = function(executor, resolve, reject) {
    try {
        executor(resolve, reject);
    } catch (e) {
        return e;
    }
};
Promise.prototype._onCancel = function () {};
Promise.prototype._setOnCancel = function (handler) { ; };
Promise.prototype._attachCancellationCallback = function(onCancel) {
    ;
};
Promise.prototype._captureStackTrace = function () {};
Promise.prototype._attachExtraTrace = function () {};
Promise.prototype._clearCancellationData = function() {};
Promise.prototype._propagateFrom = function (parent, flags) {
    ;
    ;
};

function cancellationExecute(executor, resolve, reject) {
    var promise = this;
    try {
        executor(resolve, reject, function(onCancel) {
            if (typeof onCancel !== "function") {
                throw new TypeError("onCancel must be a function, got: " +
                                    util.toString(onCancel));
            }
            promise._attachCancellationCallback(onCancel);
        });
    } catch (e) {
        return e;
    }
}

function cancellationAttachCancellationCallback(onCancel) {
    if (!this._isCancellable()) return this;

    var previousOnCancel = this._onCancel();
    if (previousOnCancel !== undefined) {
        if (util.isArray(previousOnCancel)) {
            previousOnCancel.push(onCancel);
        } else {
            this._setOnCancel([previousOnCancel, onCancel]);
        }
    } else {
        this._setOnCancel(onCancel);
    }
}

function cancellationOnCancel() {
    return this._onCancelField;
}

function cancellationSetOnCancel(onCancel) {
    this._onCancelField = onCancel;
}

function cancellationClearCancellationData() {
    this._cancellationParent = undefined;
    this._onCancelField = undefined;
}

function cancellationPropagateFrom(parent, flags) {
    if ((flags & 1) !== 0) {
        this._cancellationParent = parent;
        var branchesRemainingToCancel = parent._branchesRemainingToCancel;
        if (branchesRemainingToCancel === undefined) {
            branchesRemainingToCancel = 0;
        }
        parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
    }
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}

function bindingPropagateFrom(parent, flags) {
    if ((flags & 2) !== 0 && parent._isBound()) {
        this._setBoundTo(parent._boundTo);
    }
}
var propagateFromFunction = bindingPropagateFrom;

function boundValueFunction() {
    var ret = this._boundTo;
    if (ret !== undefined) {
        if (ret instanceof Promise) {
            if (ret.isFulfilled()) {
                return ret.value();
            } else {
                return undefined;
            }
        }
    }
    return ret;
}

function longStackTracesCaptureStackTrace() {
    this._trace = new CapturedTrace(this._peekContext());
}

function longStackTracesAttachExtraTrace(error, ignoreSelf) {
    if (canAttachTrace(error)) {
        var trace = this._trace;
        if (trace !== undefined) {
            if (ignoreSelf) trace = trace._parent;
        }
        if (trace !== undefined) {
            trace.attachExtraTrace(error);
        } else if (!error.__stackCleaned__) {
            var parsed = parseStackAndMessage(error);
            util.notEnumerableProp(error, "stack",
                parsed.message + "\n" + parsed.stack.join("\n"));
            util.notEnumerableProp(error, "__stackCleaned__", true);
        }
    }
}

function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                               parent) {
    if (returnValue === undefined && promiseCreated !== null &&
        wForgottenReturn) {
        if (parent !== undefined && parent._returnedNonUndefined()) return;
        if ((promise._bitField & 65535) === 0) return;

        if (name) name = name + " ";
        var handlerLine = "";
        var creatorLine = "";
        if (promiseCreated._trace) {
            var traceLines = promiseCreated._trace.stack.split("\n");
            var stack = cleanStack(traceLines);
            for (var i = stack.length - 1; i >= 0; --i) {
                var line = stack[i];
                if (!nodeFramePattern.test(line)) {
                    var lineMatches = line.match(parseLinePattern);
                    if (lineMatches) {
                        handlerLine  = "at " + lineMatches[1] +
                            ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                    }
                    break;
                }
            }

            if (stack.length > 0) {
                var firstUserLine = stack[0];
                for (var i = 0; i < traceLines.length; ++i) {

                    if (traceLines[i] === firstUserLine) {
                        if (i > 0) {
                            creatorLine = "\n" + traceLines[i - 1];
                        }
                        break;
                    }
                }

            }
        }
        var msg = "a promise was created in a " + name +
            "handler " + handlerLine + "but was not returned from it, " +
            "see http://goo.gl/rRqMUw" +
            creatorLine;
        promise._warn(msg, true, promiseCreated);
    }
}

function deprecated(name, replacement) {
    var message = name +
        " is deprecated and will be removed in a future version.";
    if (replacement) message += " Use " + replacement + " instead.";
    return warn(message);
}

function warn(message, shouldUseOwnTrace, promise) {
    if (!config.warnings) return;
    var warning = new Warning(message);
    var ctx;
    if (shouldUseOwnTrace) {
        promise._attachExtraTrace(warning);
    } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
        ctx.attachExtraTrace(warning);
    } else {
        var parsed = parseStackAndMessage(warning);
        warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
    }

    if (!activeFireEvent("warning", warning)) {
        formatAndLogError(warning, "", true);
    }
}

function reconstructStack(message, stacks) {
    for (var i = 0; i < stacks.length - 1; ++i) {
        stacks[i].push("From previous event:");
        stacks[i] = stacks[i].join("\n");
    }
    if (i < stacks.length) {
        stacks[i] = stacks[i].join("\n");
    }
    return message + "\n" + stacks.join("\n");
}

function removeDuplicateOrEmptyJumps(stacks) {
    for (var i = 0; i < stacks.length; ++i) {
        if (stacks[i].length === 0 ||
            ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
            stacks.splice(i, 1);
            i--;
        }
    }
}

function removeCommonRoots(stacks) {
    var current = stacks[0];
    for (var i = 1; i < stacks.length; ++i) {
        var prev = stacks[i];
        var currentLastIndex = current.length - 1;
        var currentLastLine = current[currentLastIndex];
        var commonRootMeetPoint = -1;

        for (var j = prev.length - 1; j >= 0; --j) {
            if (prev[j] === currentLastLine) {
                commonRootMeetPoint = j;
                break;
            }
        }

        for (var j = commonRootMeetPoint; j >= 0; --j) {
            var line = prev[j];
            if (current[currentLastIndex] === line) {
                current.pop();
                currentLastIndex--;
            } else {
                break;
            }
        }
        current = prev;
    }
}

function cleanStack(stack) {
    var ret = [];
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        var isTraceLine = "    (No stack trace)" === line ||
            stackFramePattern.test(line);
        var isInternalFrame = isTraceLine && shouldIgnore(line);
        if (isTraceLine && !isInternalFrame) {
            if (indentStackFrames && line.charAt(0) !== " ") {
                line = "    " + line;
            }
            ret.push(line);
        }
    }
    return ret;
}

function stackFramesAsArray(error) {
    var stack = error.stack.replace(/\s+$/g, "").split("\n");
    for (var i = 0; i < stack.length; ++i) {
        var line = stack[i];
        if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
            break;
        }
    }
    if (i > 0) {
        stack = stack.slice(i);
    }
    return stack;
}

function parseStackAndMessage(error) {
    var stack = error.stack;
    var message = error.toString();
    stack = typeof stack === "string" && stack.length > 0
                ? stackFramesAsArray(error) : ["    (No stack trace)"];
    return {
        message: message,
        stack: cleanStack(stack)
    };
}

function formatAndLogError(error, title, isSoft) {
    if (typeof console !== "undefined") {
        var message;
        if (util.isObject(error)) {
            var stack = error.stack;
            message = title + formatStack(stack, error);
        } else {
            message = title + String(error);
        }
        if (typeof printWarning === "function") {
            printWarning(message, isSoft);
        } else if (typeof console.log === "function" ||
            typeof console.log === "object") {
            console.log(message);
        }
    }
}

function fireRejectionEvent(name, localHandler, reason, promise) {
    var localEventFired = false;
    try {
        if (typeof localHandler === "function") {
            localEventFired = true;
            if (name === "rejectionHandled") {
                localHandler(promise);
            } else {
                localHandler(reason, promise);
            }
        }
    } catch (e) {
        async.throwLater(e);
    }

    if (name === "unhandledRejection") {
        if (!activeFireEvent(name, reason, promise) && !localEventFired) {
            formatAndLogError(reason, "Unhandled rejection ");
        }
    } else {
        activeFireEvent(name, promise);
    }
}

function formatNonError(obj) {
    var str;
    if (typeof obj === "function") {
        str = "[function " +
            (obj.name || "anonymous") +
            "]";
    } else {
        str = obj && typeof obj.toString === "function"
            ? obj.toString() : util.toString(obj);
        var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
        if (ruselessToString.test(str)) {
            try {
                var newStr = JSON.stringify(obj);
                str = newStr;
            }
            catch(e) {

            }
        }
        if (str.length === 0) {
            str = "(empty array)";
        }
    }
    return ("(<" + snip(str) + ">, no stack trace)");
}

function snip(str) {
    var maxChars = 41;
    if (str.length < maxChars) {
        return str;
    }
    return str.substr(0, maxChars - 3) + "...";
}

function longStackTracesIsSupported() {
    return typeof captureStackTrace === "function";
}

var shouldIgnore = function() { return false; };
var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
function parseLineInfo(line) {
    var matches = line.match(parseLineInfoRegex);
    if (matches) {
        return {
            fileName: matches[1],
            line: parseInt(matches[2], 10)
        };
    }
}

function setBounds(firstLineError, lastLineError) {
    if (!longStackTracesIsSupported()) return;
    var firstStackLines = firstLineError.stack.split("\n");
    var lastStackLines = lastLineError.stack.split("\n");
    var firstIndex = -1;
    var lastIndex = -1;
    var firstFileName;
    var lastFileName;
    for (var i = 0; i < firstStackLines.length; ++i) {
        var result = parseLineInfo(firstStackLines[i]);
        if (result) {
            firstFileName = result.fileName;
            firstIndex = result.line;
            break;
        }
    }
    for (var i = 0; i < lastStackLines.length; ++i) {
        var result = parseLineInfo(lastStackLines[i]);
        if (result) {
            lastFileName = result.fileName;
            lastIndex = result.line;
            break;
        }
    }
    if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
        firstFileName !== lastFileName || firstIndex >= lastIndex) {
        return;
    }

    shouldIgnore = function(line) {
        if (bluebirdFramePattern.test(line)) return true;
        var info = parseLineInfo(line);
        if (info) {
            if (info.fileName === firstFileName &&
                (firstIndex <= info.line && info.line <= lastIndex)) {
                return true;
            }
        }
        return false;
    };
}

function CapturedTrace(parent) {
    this._parent = parent;
    this._promisesCreated = 0;
    var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
    captureStackTrace(this, CapturedTrace);
    if (length > 32) this.uncycle();
}
util.inherits(CapturedTrace, Error);
Context.CapturedTrace = CapturedTrace;

CapturedTrace.prototype.uncycle = function() {
    var length = this._length;
    if (length < 2) return;
    var nodes = [];
    var stackToIndex = {};

    for (var i = 0, node = this; node !== undefined; ++i) {
        nodes.push(node);
        node = node._parent;
    }
    length = this._length = i;
    for (var i = length - 1; i >= 0; --i) {
        var stack = nodes[i].stack;
        if (stackToIndex[stack] === undefined) {
            stackToIndex[stack] = i;
        }
    }
    for (var i = 0; i < length; ++i) {
        var currentStack = nodes[i].stack;
        var index = stackToIndex[currentStack];
        if (index !== undefined && index !== i) {
            if (index > 0) {
                nodes[index - 1]._parent = undefined;
                nodes[index - 1]._length = 1;
            }
            nodes[i]._parent = undefined;
            nodes[i]._length = 1;
            var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

            if (index < length - 1) {
                cycleEdgeNode._parent = nodes[index + 1];
                cycleEdgeNode._parent.uncycle();
                cycleEdgeNode._length =
                    cycleEdgeNode._parent._length + 1;
            } else {
                cycleEdgeNode._parent = undefined;
                cycleEdgeNode._length = 1;
            }
            var currentChildLength = cycleEdgeNode._length + 1;
            for (var j = i - 2; j >= 0; --j) {
                nodes[j]._length = currentChildLength;
                currentChildLength++;
            }
            return;
        }
    }
};

CapturedTrace.prototype.attachExtraTrace = function(error) {
    if (error.__stackCleaned__) return;
    this.uncycle();
    var parsed = parseStackAndMessage(error);
    var message = parsed.message;
    var stacks = [parsed.stack];

    var trace = this;
    while (trace !== undefined) {
        stacks.push(cleanStack(trace.stack.split("\n")));
        trace = trace._parent;
    }
    removeCommonRoots(stacks);
    removeDuplicateOrEmptyJumps(stacks);
    util.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
    util.notEnumerableProp(error, "__stackCleaned__", true);
};

var captureStackTrace = (function stackDetection() {
    var v8stackFramePattern = /^\s*at\s*/;
    var v8stackFormatter = function(stack, error) {
        if (typeof stack === "string") return stack;

        if (error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    if (typeof Error.stackTraceLimit === "number" &&
        typeof Error.captureStackTrace === "function") {
        Error.stackTraceLimit += 6;
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        var captureStackTrace = Error.captureStackTrace;

        shouldIgnore = function(line) {
            return bluebirdFramePattern.test(line);
        };
        return function(receiver, ignoreUntil) {
            Error.stackTraceLimit += 6;
            captureStackTrace(receiver, ignoreUntil);
            Error.stackTraceLimit -= 6;
        };
    }
    var err = new Error();

    if (typeof err.stack === "string" &&
        err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
        stackFramePattern = /@/;
        formatStack = v8stackFormatter;
        indentStackFrames = true;
        return function captureStackTrace(o) {
            o.stack = new Error().stack;
        };
    }

    var hasStackAfterThrow;
    try { throw new Error(); }
    catch(e) {
        hasStackAfterThrow = ("stack" in e);
    }
    if (!("stack" in err) && hasStackAfterThrow &&
        typeof Error.stackTraceLimit === "number") {
        stackFramePattern = v8stackFramePattern;
        formatStack = v8stackFormatter;
        return function captureStackTrace(o) {
            Error.stackTraceLimit += 6;
            try { throw new Error(); }
            catch(e) { o.stack = e.stack; }
            Error.stackTraceLimit -= 6;
        };
    }

    formatStack = function(stack, error) {
        if (typeof stack === "string") return stack;

        if ((typeof error === "object" ||
            typeof error === "function") &&
            error.name !== undefined &&
            error.message !== undefined) {
            return error.toString();
        }
        return formatNonError(error);
    };

    return null;

})([]);

if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
    printWarning = function (message) {
        console.warn(message);
    };
    if (util.isNode && process.stderr.isTTY) {
        printWarning = function(message, isSoft) {
            var color = isSoft ? "\u001b[33m" : "\u001b[31m";
            console.warn(color + message + "\u001b[0m\n");
        };
    } else if (!util.isNode && typeof (new Error().stack) === "string") {
        printWarning = function(message, isSoft) {
            console.warn("%c" + message,
                        isSoft ? "color: darkorange" : "color: red");
        };
    }
}

var config = {
    warnings: warnings,
    longStackTraces: false,
    cancellation: false,
    monitoring: false
};

if (longStackTraces) Promise.longStackTraces();

return {
    longStackTraces: function() {
        return config.longStackTraces;
    },
    warnings: function() {
        return config.warnings;
    },
    cancellation: function() {
        return config.cancellation;
    },
    monitoring: function() {
        return config.monitoring;
    },
    propagateFromFunction: function() {
        return propagateFromFunction;
    },
    boundValueFunction: function() {
        return boundValueFunction;
    },
    checkForgottenReturns: checkForgottenReturns,
    setBounds: setBounds,
    warn: warn,
    deprecated: deprecated,
    CapturedTrace: CapturedTrace,
    fireDomEvent: fireDomEvent,
    fireGlobalEvent: fireGlobalEvent
};
};

},{"./errors":12,"./util":36}],10:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function returner() {
    return this.value;
}
function thrower() {
    throw this.reason;
}

Promise.prototype["return"] =
Promise.prototype.thenReturn = function (value) {
    if (value instanceof Promise) value.suppressUnhandledRejections();
    return this._then(
        returner, undefined, undefined, {value: value}, undefined);
};

Promise.prototype["throw"] =
Promise.prototype.thenThrow = function (reason) {
    return this._then(
        thrower, undefined, undefined, {reason: reason}, undefined);
};

Promise.prototype.catchThrow = function (reason) {
    if (arguments.length <= 1) {
        return this._then(
            undefined, thrower, undefined, {reason: reason}, undefined);
    } else {
        var _reason = arguments[1];
        var handler = function() {throw _reason;};
        return this.caught(reason, handler);
    }
};

Promise.prototype.catchReturn = function (value) {
    if (arguments.length <= 1) {
        if (value instanceof Promise) value.suppressUnhandledRejections();
        return this._then(
            undefined, returner, undefined, {value: value}, undefined);
    } else {
        var _value = arguments[1];
        if (_value instanceof Promise) _value.suppressUnhandledRejections();
        var handler = function() {return _value;};
        return this.caught(value, handler);
    }
};
};

},{}],11:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseReduce = Promise.reduce;
var PromiseAll = Promise.all;

function promiseAllThis() {
    return PromiseAll(this);
}

function PromiseMapSeries(promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
}

Promise.prototype.each = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, this, undefined);
};

Promise.prototype.mapSeries = function (fn) {
    return PromiseReduce(this, fn, INTERNAL, INTERNAL);
};

Promise.each = function (promises, fn) {
    return PromiseReduce(promises, fn, INTERNAL, 0)
              ._then(promiseAllThis, undefined, undefined, promises, undefined);
};

Promise.mapSeries = PromiseMapSeries;
};


},{}],12:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var Objectfreeze = es5.freeze;
var util = _dereq_("./util");
var inherits = util.inherits;
var notEnumerableProp = util.notEnumerableProp;

function subError(nameProperty, defaultMessage) {
    function SubError(message) {
        if (!(this instanceof SubError)) return new SubError(message);
        notEnumerableProp(this, "message",
            typeof message === "string" ? message : defaultMessage);
        notEnumerableProp(this, "name", nameProperty);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        } else {
            Error.call(this);
        }
    }
    inherits(SubError, Error);
    return SubError;
}

var _TypeError, _RangeError;
var Warning = subError("Warning", "warning");
var CancellationError = subError("CancellationError", "cancellation error");
var TimeoutError = subError("TimeoutError", "timeout error");
var AggregateError = subError("AggregateError", "aggregate error");
try {
    _TypeError = TypeError;
    _RangeError = RangeError;
} catch(e) {
    _TypeError = subError("TypeError", "type error");
    _RangeError = subError("RangeError", "range error");
}

var methods = ("join pop push shift unshift slice filter forEach some " +
    "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

for (var i = 0; i < methods.length; ++i) {
    if (typeof Array.prototype[methods[i]] === "function") {
        AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
    }
}

es5.defineProperty(AggregateError.prototype, "length", {
    value: 0,
    configurable: false,
    writable: true,
    enumerable: true
});
AggregateError.prototype["isOperational"] = true;
var level = 0;
AggregateError.prototype.toString = function() {
    var indent = Array(level * 4 + 1).join(" ");
    var ret = "\n" + indent + "AggregateError of:" + "\n";
    level++;
    indent = Array(level * 4 + 1).join(" ");
    for (var i = 0; i < this.length; ++i) {
        var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
        var lines = str.split("\n");
        for (var j = 0; j < lines.length; ++j) {
            lines[j] = indent + lines[j];
        }
        str = lines.join("\n");
        ret += str + "\n";
    }
    level--;
    return ret;
};

function OperationalError(message) {
    if (!(this instanceof OperationalError))
        return new OperationalError(message);
    notEnumerableProp(this, "name", "OperationalError");
    notEnumerableProp(this, "message", message);
    this.cause = message;
    this["isOperational"] = true;

    if (message instanceof Error) {
        notEnumerableProp(this, "message", message.message);
        notEnumerableProp(this, "stack", message.stack);
    } else if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

}
inherits(OperationalError, Error);

var errorTypes = Error["__BluebirdErrorTypes__"];
if (!errorTypes) {
    errorTypes = Objectfreeze({
        CancellationError: CancellationError,
        TimeoutError: TimeoutError,
        OperationalError: OperationalError,
        RejectionError: OperationalError,
        AggregateError: AggregateError
    });
    es5.defineProperty(Error, "__BluebirdErrorTypes__", {
        value: errorTypes,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

module.exports = {
    Error: Error,
    TypeError: _TypeError,
    RangeError: _RangeError,
    CancellationError: errorTypes.CancellationError,
    OperationalError: errorTypes.OperationalError,
    TimeoutError: errorTypes.TimeoutError,
    AggregateError: errorTypes.AggregateError,
    Warning: Warning
};

},{"./es5":13,"./util":36}],13:[function(_dereq_,module,exports){
var isES5 = (function(){
    "use strict";
    return this === undefined;
})();

if (isES5) {
    module.exports = {
        freeze: Object.freeze,
        defineProperty: Object.defineProperty,
        getDescriptor: Object.getOwnPropertyDescriptor,
        keys: Object.keys,
        names: Object.getOwnPropertyNames,
        getPrototypeOf: Object.getPrototypeOf,
        isArray: Array.isArray,
        isES5: isES5,
        propertyIsWritable: function(obj, prop) {
            var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
            return !!(!descriptor || descriptor.writable || descriptor.set);
        }
    };
} else {
    var has = {}.hasOwnProperty;
    var str = {}.toString;
    var proto = {}.constructor.prototype;

    var ObjectKeys = function (o) {
        var ret = [];
        for (var key in o) {
            if (has.call(o, key)) {
                ret.push(key);
            }
        }
        return ret;
    };

    var ObjectGetDescriptor = function(o, key) {
        return {value: o[key]};
    };

    var ObjectDefineProperty = function (o, key, desc) {
        o[key] = desc.value;
        return o;
    };

    var ObjectFreeze = function (obj) {
        return obj;
    };

    var ObjectGetPrototypeOf = function (obj) {
        try {
            return Object(obj).constructor.prototype;
        }
        catch (e) {
            return proto;
        }
    };

    var ArrayIsArray = function (obj) {
        try {
            return str.call(obj) === "[object Array]";
        }
        catch(e) {
            return false;
        }
    };

    module.exports = {
        isArray: ArrayIsArray,
        keys: ObjectKeys,
        names: ObjectKeys,
        defineProperty: ObjectDefineProperty,
        getDescriptor: ObjectGetDescriptor,
        freeze: ObjectFreeze,
        getPrototypeOf: ObjectGetPrototypeOf,
        isES5: isES5,
        propertyIsWritable: function() {
            return true;
        }
    };
}

},{}],14:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var PromiseMap = Promise.map;

Promise.prototype.filter = function (fn, options) {
    return PromiseMap(this, fn, options, INTERNAL);
};

Promise.filter = function (promises, fn, options) {
    return PromiseMap(promises, fn, options, INTERNAL);
};
};

},{}],15:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, tryConvertToPromise) {
var util = _dereq_("./util");
var CancellationError = Promise.CancellationError;
var errorObj = util.errorObj;

function PassThroughHandlerContext(promise, type, handler) {
    this.promise = promise;
    this.type = type;
    this.handler = handler;
    this.called = false;
    this.cancelPromise = null;
}

PassThroughHandlerContext.prototype.isFinallyHandler = function() {
    return this.type === 0;
};

function FinallyHandlerCancelReaction(finallyHandler) {
    this.finallyHandler = finallyHandler;
}

FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
    checkCancel(this.finallyHandler);
};

function checkCancel(ctx, reason) {
    if (ctx.cancelPromise != null) {
        if (arguments.length > 1) {
            ctx.cancelPromise._reject(reason);
        } else {
            ctx.cancelPromise._cancel();
        }
        ctx.cancelPromise = null;
        return true;
    }
    return false;
}

function succeed() {
    return finallyHandler.call(this, this.promise._target()._settledValue());
}
function fail(reason) {
    if (checkCancel(this, reason)) return;
    errorObj.e = reason;
    return errorObj;
}
function finallyHandler(reasonOrValue) {
    var promise = this.promise;
    var handler = this.handler;

    if (!this.called) {
        this.called = true;
        var ret = this.isFinallyHandler()
            ? handler.call(promise._boundValue())
            : handler.call(promise._boundValue(), reasonOrValue);
        if (ret !== undefined) {
            promise._setReturnedNonUndefined();
            var maybePromise = tryConvertToPromise(ret, promise);
            if (maybePromise instanceof Promise) {
                if (this.cancelPromise != null) {
                    if (maybePromise._isCancelled()) {
                        var reason =
                            new CancellationError("late cancellation observer");
                        promise._attachExtraTrace(reason);
                        errorObj.e = reason;
                        return errorObj;
                    } else if (maybePromise.isPending()) {
                        maybePromise._attachCancellationCallback(
                            new FinallyHandlerCancelReaction(this));
                    }
                }
                return maybePromise._then(
                    succeed, fail, undefined, this, undefined);
            }
        }
    }

    if (promise.isRejected()) {
        checkCancel(this);
        errorObj.e = reasonOrValue;
        return errorObj;
    } else {
        checkCancel(this);
        return reasonOrValue;
    }
}

Promise.prototype._passThrough = function(handler, type, success, fail) {
    if (typeof handler !== "function") return this.then();
    return this._then(success,
                      fail,
                      undefined,
                      new PassThroughHandlerContext(this, type, handler),
                      undefined);
};

Promise.prototype.lastly =
Promise.prototype["finally"] = function (handler) {
    return this._passThrough(handler,
                             0,
                             finallyHandler,
                             finallyHandler);
};

Promise.prototype.tap = function (handler) {
    return this._passThrough(handler, 1, finallyHandler);
};

return PassThroughHandlerContext;
};

},{"./util":36}],16:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          apiRejection,
                          INTERNAL,
                          tryConvertToPromise,
                          Proxyable,
                          debug) {
var errors = _dereq_("./errors");
var TypeError = errors.TypeError;
var util = _dereq_("./util");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
var yieldHandlers = [];

function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
    for (var i = 0; i < yieldHandlers.length; ++i) {
        traceParent._pushContext();
        var result = tryCatch(yieldHandlers[i])(value);
        traceParent._popContext();
        if (result === errorObj) {
            traceParent._pushContext();
            var ret = Promise.reject(errorObj.e);
            traceParent._popContext();
            return ret;
        }
        var maybePromise = tryConvertToPromise(result, traceParent);
        if (maybePromise instanceof Promise) return maybePromise;
    }
    return null;
}

function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
    if (debug.cancellation()) {
        var internal = new Promise(INTERNAL);
        var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
        this._promise = internal.lastly(function() {
            return _finallyPromise;
        });
        internal._captureStackTrace();
        internal._setOnCancel(this);
    } else {
        var promise = this._promise = new Promise(INTERNAL);
        promise._captureStackTrace();
    }
    this._stack = stack;
    this._generatorFunction = generatorFunction;
    this._receiver = receiver;
    this._generator = undefined;
    this._yieldHandlers = typeof yieldHandler === "function"
        ? [yieldHandler].concat(yieldHandlers)
        : yieldHandlers;
    this._yieldedPromise = null;
    this._cancellationPhase = false;
}
util.inherits(PromiseSpawn, Proxyable);

PromiseSpawn.prototype._isResolved = function() {
    return this._promise === null;
};

PromiseSpawn.prototype._cleanup = function() {
    this._promise = this._generator = null;
    if (debug.cancellation() && this._finallyPromise !== null) {
        this._finallyPromise._fulfill();
        this._finallyPromise = null;
    }
};

PromiseSpawn.prototype._promiseCancelled = function() {
    if (this._isResolved()) return;
    var implementsReturn = typeof this._generator["return"] !== "undefined";

    var result;
    if (!implementsReturn) {
        var reason = new Promise.CancellationError(
            "generator .return() sentinel");
        Promise.coroutine.returnSentinel = reason;
        this._promise._attachExtraTrace(reason);
        this._promise._pushContext();
        result = tryCatch(this._generator["throw"]).call(this._generator,
                                                         reason);
        this._promise._popContext();
    } else {
        this._promise._pushContext();
        result = tryCatch(this._generator["return"]).call(this._generator,
                                                          undefined);
        this._promise._popContext();
    }
    this._cancellationPhase = true;
    this._yieldedPromise = null;
    this._continue(result);
};

PromiseSpawn.prototype._promiseFulfilled = function(value) {
    this._yieldedPromise = null;
    this._promise._pushContext();
    var result = tryCatch(this._generator.next).call(this._generator, value);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._promiseRejected = function(reason) {
    this._yieldedPromise = null;
    this._promise._attachExtraTrace(reason);
    this._promise._pushContext();
    var result = tryCatch(this._generator["throw"])
        .call(this._generator, reason);
    this._promise._popContext();
    this._continue(result);
};

PromiseSpawn.prototype._resultCancelled = function() {
    if (this._yieldedPromise instanceof Promise) {
        var promise = this._yieldedPromise;
        this._yieldedPromise = null;
        promise.cancel();
    }
};

PromiseSpawn.prototype.promise = function () {
    return this._promise;
};

PromiseSpawn.prototype._run = function () {
    this._generator = this._generatorFunction.call(this._receiver);
    this._receiver =
        this._generatorFunction = undefined;
    this._promiseFulfilled(undefined);
};

PromiseSpawn.prototype._continue = function (result) {
    var promise = this._promise;
    if (result === errorObj) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._rejectCallback(result.e, false);
        }
    }

    var value = result.value;
    if (result.done === true) {
        this._cleanup();
        if (this._cancellationPhase) {
            return promise.cancel();
        } else {
            return promise._resolveCallback(value);
        }
    } else {
        var maybePromise = tryConvertToPromise(value, this._promise);
        if (!(maybePromise instanceof Promise)) {
            maybePromise =
                promiseFromYieldHandler(maybePromise,
                                        this._yieldHandlers,
                                        this._promise);
            if (maybePromise === null) {
                this._promiseRejected(
                    new TypeError(
                        "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", value) +
                        "From coroutine:\u000a" +
                        this._stack.split("\n").slice(1, -7).join("\n")
                    )
                );
                return;
            }
        }
        maybePromise = maybePromise._target();
        var bitField = maybePromise._bitField;
        ;
        if (((bitField & 50397184) === 0)) {
            this._yieldedPromise = maybePromise;
            maybePromise._proxy(this, null);
        } else if (((bitField & 33554432) !== 0)) {
            Promise._async.invoke(
                this._promiseFulfilled, this, maybePromise._value()
            );
        } else if (((bitField & 16777216) !== 0)) {
            Promise._async.invoke(
                this._promiseRejected, this, maybePromise._reason()
            );
        } else {
            this._promiseCancelled();
        }
    }
};

Promise.coroutine = function (generatorFunction, options) {
    if (typeof generatorFunction !== "function") {
        throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var yieldHandler = Object(options).yieldHandler;
    var PromiseSpawn$ = PromiseSpawn;
    var stack = new Error().stack;
    return function () {
        var generator = generatorFunction.apply(this, arguments);
        var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                      stack);
        var ret = spawn.promise();
        spawn._generator = generator;
        spawn._promiseFulfilled(undefined);
        return ret;
    };
};

Promise.coroutine.addYieldHandler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    yieldHandlers.push(fn);
};

Promise.spawn = function (generatorFunction) {
    debug.deprecated("Promise.spawn()", "Promise.coroutine()");
    if (typeof generatorFunction !== "function") {
        return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var spawn = new PromiseSpawn(generatorFunction, this);
    var ret = spawn.promise();
    spawn._run(Promise.spawn);
    return ret;
};
};

},{"./errors":12,"./util":36}],17:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
         getDomain) {
var util = _dereq_("./util");
var canEvaluate = util.canEvaluate;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var reject;

if (!true) {
if (canEvaluate) {
    var thenCallback = function(i) {
        return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
    };

    var promiseSetter = function(i) {
        return new Function("promise", "holder", "                           \n\
            'use strict';                                                    \n\
            holder.pIndex = promise;                                         \n\
            ".replace(/Index/g, i));
    };

    var generateHolderClass = function(total) {
        var props = new Array(total);
        for (var i = 0; i < props.length; ++i) {
            props[i] = "this.p" + (i+1);
        }
        var assignment = props.join(" = ") + " = null;";
        var cancellationCode= "var promise;\n" + props.map(function(prop) {
            return "                                                         \n\
                promise = " + prop + ";                                      \n\
                if (promise instanceof Promise) {                            \n\
                    promise.cancel();                                        \n\
                }                                                            \n\
            ";
        }).join("\n");
        var passedArguments = props.join(", ");
        var name = "Holder$" + total;


        var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
            'use strict';                                                    \n\
            function [TheName](fn) {                                         \n\
                [TheProperties]                                              \n\
                this.fn = fn;                                                \n\
                this.asyncNeeded = true;                                     \n\
                this.now = 0;                                                \n\
            }                                                                \n\
                                                                             \n\
            [TheName].prototype._callFunction = function(promise) {          \n\
                promise._pushContext();                                      \n\
                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
                promise._popContext();                                       \n\
                if (ret === errorObj) {                                      \n\
                    promise._rejectCallback(ret.e, false);                   \n\
                } else {                                                     \n\
                    promise._resolveCallback(ret);                           \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype.checkFulfillment = function(promise) {       \n\
                var now = ++this.now;                                        \n\
                if (now === [TheTotal]) {                                    \n\
                    if (this.asyncNeeded) {                                  \n\
                        async.invoke(this._callFunction, this, promise);     \n\
                    } else {                                                 \n\
                        this._callFunction(promise);                         \n\
                    }                                                        \n\
                                                                             \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype._resultCancelled = function() {              \n\
                [CancellationCode]                                           \n\
            };                                                               \n\
                                                                             \n\
            return [TheName];                                                \n\
        }(tryCatch, errorObj, Promise, async);                               \n\
        ";

        code = code.replace(/\[TheName\]/g, name)
            .replace(/\[TheTotal\]/g, total)
            .replace(/\[ThePassedArguments\]/g, passedArguments)
            .replace(/\[TheProperties\]/g, assignment)
            .replace(/\[CancellationCode\]/g, cancellationCode);

        return new Function("tryCatch", "errorObj", "Promise", "async", code)
                           (tryCatch, errorObj, Promise, async);
    };

    var holderClasses = [];
    var thenCallbacks = [];
    var promiseSetters = [];

    for (var i = 0; i < 8; ++i) {
        holderClasses.push(generateHolderClass(i + 1));
        thenCallbacks.push(thenCallback(i + 1));
        promiseSetters.push(promiseSetter(i + 1));
    }

    reject = function (reason) {
        this._reject(reason);
    };
}}

Promise.join = function () {
    var last = arguments.length - 1;
    var fn;
    if (last > 0 && typeof arguments[last] === "function") {
        fn = arguments[last];
        if (!true) {
            if (last <= 8 && canEvaluate) {
                var ret = new Promise(INTERNAL);
                ret._captureStackTrace();
                var HolderClass = holderClasses[last - 1];
                var holder = new HolderClass(fn);
                var callbacks = thenCallbacks;

                for (var i = 0; i < last; ++i) {
                    var maybePromise = tryConvertToPromise(arguments[i], ret);
                    if (maybePromise instanceof Promise) {
                        maybePromise = maybePromise._target();
                        var bitField = maybePromise._bitField;
                        ;
                        if (((bitField & 50397184) === 0)) {
                            maybePromise._then(callbacks[i], reject,
                                               undefined, ret, holder);
                            promiseSetters[i](maybePromise, holder);
                            holder.asyncNeeded = false;
                        } else if (((bitField & 33554432) !== 0)) {
                            callbacks[i].call(ret,
                                              maybePromise._value(), holder);
                        } else if (((bitField & 16777216) !== 0)) {
                            ret._reject(maybePromise._reason());
                        } else {
                            ret._cancel();
                        }
                    } else {
                        callbacks[i].call(ret, maybePromise, holder);
                    }
                }

                if (!ret._isFateSealed()) {
                    if (holder.asyncNeeded) {
                        var domain = getDomain();
                        if (domain !== null) {
                            holder.fn = util.domainBind(domain, holder.fn);
                        }
                    }
                    ret._setAsyncGuaranteed();
                    ret._setOnCancel(holder);
                }
                return ret;
            }
        }
    }
    var args = [].slice.call(arguments);;
    if (fn) args.pop();
    var ret = new PromiseArray(args).promise();
    return fn !== undefined ? ret.spread(fn) : ret;
};

};

},{"./util":36}],18:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;
var async = Promise._async;

function MappingPromiseArray(promises, fn, limit, _filter) {
    this.constructor$(promises);
    this._promise._captureStackTrace();
    var domain = getDomain();
    this._callback = domain === null ? fn : util.domainBind(domain, fn);
    this._preservedValues = _filter === INTERNAL
        ? new Array(this.length())
        : null;
    this._limit = limit;
    this._inFlight = 0;
    this._queue = [];
    async.invoke(this._asyncInit, this, undefined);
}
util.inherits(MappingPromiseArray, PromiseArray);

MappingPromiseArray.prototype._asyncInit = function() {
    this._init$(undefined, -2);
};

MappingPromiseArray.prototype._init = function () {};

MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var values = this._values;
    var length = this.length();
    var preservedValues = this._preservedValues;
    var limit = this._limit;

    if (index < 0) {
        index = (index * -1) - 1;
        values[index] = value;
        if (limit >= 1) {
            this._inFlight--;
            this._drainQueue();
            if (this._isResolved()) return true;
        }
    } else {
        if (limit >= 1 && this._inFlight >= limit) {
            values[index] = value;
            this._queue.push(index);
            return false;
        }
        if (preservedValues !== null) preservedValues[index] = value;

        var promise = this._promise;
        var callback = this._callback;
        var receiver = promise._boundValue();
        promise._pushContext();
        var ret = tryCatch(callback).call(receiver, value, index, length);
        var promiseCreated = promise._popContext();
        debug.checkForgottenReturns(
            ret,
            promiseCreated,
            preservedValues !== null ? "Promise.filter" : "Promise.map",
            promise
        );
        if (ret === errorObj) {
            this._reject(ret.e);
            return true;
        }

        var maybePromise = tryConvertToPromise(ret, this._promise);
        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            var bitField = maybePromise._bitField;
            ;
            if (((bitField & 50397184) === 0)) {
                if (limit >= 1) this._inFlight++;
                values[index] = maybePromise;
                maybePromise._proxy(this, (index + 1) * -1);
                return false;
            } else if (((bitField & 33554432) !== 0)) {
                ret = maybePromise._value();
            } else if (((bitField & 16777216) !== 0)) {
                this._reject(maybePromise._reason());
                return true;
            } else {
                this._cancel();
                return true;
            }
        }
        values[index] = ret;
    }
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= length) {
        if (preservedValues !== null) {
            this._filter(values, preservedValues);
        } else {
            this._resolve(values);
        }
        return true;
    }
    return false;
};

MappingPromiseArray.prototype._drainQueue = function () {
    var queue = this._queue;
    var limit = this._limit;
    var values = this._values;
    while (queue.length > 0 && this._inFlight < limit) {
        if (this._isResolved()) return;
        var index = queue.pop();
        this._promiseFulfilled(values[index], index);
    }
};

MappingPromiseArray.prototype._filter = function (booleans, values) {
    var len = values.length;
    var ret = new Array(len);
    var j = 0;
    for (var i = 0; i < len; ++i) {
        if (booleans[i]) ret[j++] = values[i];
    }
    ret.length = j;
    this._resolve(ret);
};

MappingPromiseArray.prototype.preservedValues = function () {
    return this._preservedValues;
};

function map(promises, fn, options, _filter) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }

    var limit = 0;
    if (options !== undefined) {
        if (typeof options === "object" && options !== null) {
            if (typeof options.concurrency !== "number") {
                return Promise.reject(
                    new TypeError("'concurrency' must be a number but it is " +
                                    util.classString(options.concurrency)));
            }
            limit = options.concurrency;
        } else {
            return Promise.reject(new TypeError(
                            "options argument must be an object but it is " +
                             util.classString(options)));
        }
    }
    limit = typeof limit === "number" &&
        isFinite(limit) && limit >= 1 ? limit : 0;
    return new MappingPromiseArray(promises, fn, limit, _filter).promise();
}

Promise.prototype.map = function (fn, options) {
    return map(this, fn, options, null);
};

Promise.map = function (promises, fn, options, _filter) {
    return map(promises, fn, options, _filter);
};


};

},{"./util":36}],19:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

Promise.method = function (fn) {
    if (typeof fn !== "function") {
        throw new Promise.TypeError("expecting a function but got " + util.classString(fn));
    }
    return function () {
        var ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._pushContext();
        var value = tryCatch(fn).apply(this, arguments);
        var promiseCreated = ret._popContext();
        debug.checkForgottenReturns(
            value, promiseCreated, "Promise.method", ret);
        ret._resolveFromSyncValue(value);
        return ret;
    };
};

Promise.attempt = Promise["try"] = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._pushContext();
    var value;
    if (arguments.length > 1) {
        debug.deprecated("calling Promise.try with more than 1 argument");
        var arg = arguments[1];
        var ctx = arguments[2];
        value = util.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                  : tryCatch(fn).call(ctx, arg);
    } else {
        value = tryCatch(fn)();
    }
    var promiseCreated = ret._popContext();
    debug.checkForgottenReturns(
        value, promiseCreated, "Promise.try", ret);
    ret._resolveFromSyncValue(value);
    return ret;
};

Promise.prototype._resolveFromSyncValue = function (value) {
    if (value === util.errorObj) {
        this._rejectCallback(value.e, false);
    } else {
        this._resolveCallback(value, true);
    }
};
};

},{"./util":36}],20:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var maybeWrapAsError = util.maybeWrapAsError;
var errors = _dereq_("./errors");
var OperationalError = errors.OperationalError;
var es5 = _dereq_("./es5");

function isUntypedError(obj) {
    return obj instanceof Error &&
        es5.getPrototypeOf(obj) === Error.prototype;
}

var rErrorKey = /^(?:name|message|stack|cause)$/;
function wrapAsOperationalError(obj) {
    var ret;
    if (isUntypedError(obj)) {
        ret = new OperationalError(obj);
        ret.name = obj.name;
        ret.message = obj.message;
        ret.stack = obj.stack;
        var keys = es5.keys(obj);
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!rErrorKey.test(key)) {
                ret[key] = obj[key];
            }
        }
        return ret;
    }
    util.markAsOriginatingFromRejection(obj);
    return obj;
}

function nodebackForPromise(promise, multiArgs) {
    return function(err, value) {
        if (promise === null) return;
        if (err) {
            var wrapped = wrapAsOperationalError(maybeWrapAsError(err));
            promise._attachExtraTrace(wrapped);
            promise._reject(wrapped);
        } else if (!multiArgs) {
            promise._fulfill(value);
        } else {
            var args = [].slice.call(arguments, 1);;
            promise._fulfill(args);
        }
        promise = null;
    };
}

module.exports = nodebackForPromise;

},{"./errors":12,"./es5":13,"./util":36}],21:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
var util = _dereq_("./util");
var async = Promise._async;
var tryCatch = util.tryCatch;
var errorObj = util.errorObj;

function spreadAdapter(val, nodeback) {
    var promise = this;
    if (!util.isArray(val)) return successAdapter.call(promise, val, nodeback);
    var ret =
        tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

function successAdapter(val, nodeback) {
    var promise = this;
    var receiver = promise._boundValue();
    var ret = val === undefined
        ? tryCatch(nodeback).call(receiver, null)
        : tryCatch(nodeback).call(receiver, null, val);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}
function errorAdapter(reason, nodeback) {
    var promise = this;
    if (!reason) {
        var newReason = new Error(reason + "");
        newReason.cause = reason;
        reason = newReason;
    }
    var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
    if (ret === errorObj) {
        async.throwLater(ret.e);
    }
}

Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                     options) {
    if (typeof nodeback == "function") {
        var adapter = successAdapter;
        if (options !== undefined && Object(options).spread) {
            adapter = spreadAdapter;
        }
        this._then(
            adapter,
            errorAdapter,
            undefined,
            this,
            nodeback
        );
    }
    return this;
};
};

},{"./util":36}],22:[function(_dereq_,module,exports){
"use strict";
module.exports = function() {
var makeSelfResolutionError = function () {
    return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var reflectHandler = function() {
    return new Promise.PromiseInspection(this._target());
};
var apiRejection = function(msg) {
    return Promise.reject(new TypeError(msg));
};
function Proxyable() {}
var UNDEFINED_BINDING = {};
var util = _dereq_("./util");

var getDomain;
if (util.isNode) {
    getDomain = function() {
        var ret = process.domain;
        if (ret === undefined) ret = null;
        return ret;
    };
} else {
    getDomain = function() {
        return null;
    };
}
util.notEnumerableProp(Promise, "_getDomain", getDomain);

var es5 = _dereq_("./es5");
var Async = _dereq_("./async");
var async = new Async();
es5.defineProperty(Promise, "_async", {value: async});
var errors = _dereq_("./errors");
var TypeError = Promise.TypeError = errors.TypeError;
Promise.RangeError = errors.RangeError;
var CancellationError = Promise.CancellationError = errors.CancellationError;
Promise.TimeoutError = errors.TimeoutError;
Promise.OperationalError = errors.OperationalError;
Promise.RejectionError = errors.OperationalError;
Promise.AggregateError = errors.AggregateError;
var INTERNAL = function(){};
var APPLY = {};
var NEXT_FILTER = {};
var tryConvertToPromise = _dereq_("./thenables")(Promise, INTERNAL);
var PromiseArray =
    _dereq_("./promise_array")(Promise, INTERNAL,
                               tryConvertToPromise, apiRejection, Proxyable);
var Context = _dereq_("./context")(Promise);
 /*jshint unused:false*/
var createContext = Context.create;
var debug = _dereq_("./debuggability")(Promise, Context);
var CapturedTrace = debug.CapturedTrace;
var PassThroughHandlerContext =
    _dereq_("./finally")(Promise, tryConvertToPromise);
var catchFilter = _dereq_("./catch_filter")(NEXT_FILTER);
var nodebackForPromise = _dereq_("./nodeback");
var errorObj = util.errorObj;
var tryCatch = util.tryCatch;
function check(self, executor) {
    if (typeof executor !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(executor));
    }
    if (self.constructor !== Promise) {
        throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
}

function Promise(executor) {
    this._bitField = 0;
    this._fulfillmentHandler0 = undefined;
    this._rejectionHandler0 = undefined;
    this._promise0 = undefined;
    this._receiver0 = undefined;
    if (executor !== INTERNAL) {
        check(this, executor);
        this._resolveFromExecutor(executor);
    }
    this._promiseCreated();
    this._fireEvent("promiseCreated", this);
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
    var len = arguments.length;
    if (len > 1) {
        var catchInstances = new Array(len - 1),
            j = 0, i;
        for (i = 0; i < len - 1; ++i) {
            var item = arguments[i];
            if (util.isObject(item)) {
                catchInstances[j++] = item;
            } else {
                return apiRejection("expecting an object but got " +
                    "A catch statement predicate " + util.classString(item));
            }
        }
        catchInstances.length = j;
        fn = arguments[i];
        return this.then(undefined, catchFilter(catchInstances, fn, this));
    }
    return this.then(undefined, fn);
};

Promise.prototype.reflect = function () {
    return this._then(reflectHandler,
        reflectHandler, undefined, this, undefined);
};

Promise.prototype.then = function (didFulfill, didReject) {
    if (debug.warnings() && arguments.length > 0 &&
        typeof didFulfill !== "function" &&
        typeof didReject !== "function") {
        var msg = ".then() only accepts functions but was passed: " +
                util.classString(didFulfill);
        if (arguments.length > 1) {
            msg += ", " + util.classString(didReject);
        }
        this._warn(msg);
    }
    return this._then(didFulfill, didReject, undefined, undefined, undefined);
};

Promise.prototype.done = function (didFulfill, didReject) {
    var promise =
        this._then(didFulfill, didReject, undefined, undefined, undefined);
    promise._setIsFinal();
};

Promise.prototype.spread = function (fn) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    return this.all()._then(fn, undefined, undefined, APPLY, undefined);
};

Promise.prototype.toJSON = function () {
    var ret = {
        isFulfilled: false,
        isRejected: false,
        fulfillmentValue: undefined,
        rejectionReason: undefined
    };
    if (this.isFulfilled()) {
        ret.fulfillmentValue = this.value();
        ret.isFulfilled = true;
    } else if (this.isRejected()) {
        ret.rejectionReason = this.reason();
        ret.isRejected = true;
    }
    return ret;
};

Promise.prototype.all = function () {
    if (arguments.length > 0) {
        this._warn(".all() was passed arguments but it does not take any");
    }
    return new PromiseArray(this).promise();
};

Promise.prototype.error = function (fn) {
    return this.caught(util.originatesFromRejection, fn);
};

Promise.getNewLibraryCopy = module.exports;

Promise.is = function (val) {
    return val instanceof Promise;
};

Promise.fromNode = Promise.fromCallback = function(fn) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                         : false;
    var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
    if (result === errorObj) {
        ret._rejectCallback(result.e, true);
    }
    if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
    return ret;
};

Promise.all = function (promises) {
    return new PromiseArray(promises).promise();
};

Promise.cast = function (obj) {
    var ret = tryConvertToPromise(obj);
    if (!(ret instanceof Promise)) {
        ret = new Promise(INTERNAL);
        ret._captureStackTrace();
        ret._setFulfilled();
        ret._rejectionHandler0 = obj;
    }
    return ret;
};

Promise.resolve = Promise.fulfilled = Promise.cast;

Promise.reject = Promise.rejected = function (reason) {
    var ret = new Promise(INTERNAL);
    ret._captureStackTrace();
    ret._rejectCallback(reason, true);
    return ret;
};

Promise.setScheduler = function(fn) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    return async.setScheduler(fn);
};

Promise.prototype._then = function (
    didFulfill,
    didReject,
    _,    receiver,
    internalData
) {
    var haveInternalData = internalData !== undefined;
    var promise = haveInternalData ? internalData : new Promise(INTERNAL);
    var target = this._target();
    var bitField = target._bitField;

    if (!haveInternalData) {
        promise._propagateFrom(this, 3);
        promise._captureStackTrace();
        if (receiver === undefined &&
            ((this._bitField & 2097152) !== 0)) {
            if (!((bitField & 50397184) === 0)) {
                receiver = this._boundValue();
            } else {
                receiver = target === this ? undefined : this._boundTo;
            }
        }
        this._fireEvent("promiseChained", this, promise);
    }

    var domain = getDomain();
    if (!((bitField & 50397184) === 0)) {
        var handler, value, settler = target._settlePromiseCtx;
        if (((bitField & 33554432) !== 0)) {
            value = target._rejectionHandler0;
            handler = didFulfill;
        } else if (((bitField & 16777216) !== 0)) {
            value = target._fulfillmentHandler0;
            handler = didReject;
            target._unsetRejectionIsUnhandled();
        } else {
            settler = target._settlePromiseLateCancellationObserver;
            value = new CancellationError("late cancellation observer");
            target._attachExtraTrace(value);
            handler = didReject;
        }

        async.invoke(settler, target, {
            handler: domain === null ? handler
                : (typeof handler === "function" &&
                    util.domainBind(domain, handler)),
            promise: promise,
            receiver: receiver,
            value: value
        });
    } else {
        target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
    }

    return promise;
};

Promise.prototype._length = function () {
    return this._bitField & 65535;
};

Promise.prototype._isFateSealed = function () {
    return (this._bitField & 117506048) !== 0;
};

Promise.prototype._isFollowing = function () {
    return (this._bitField & 67108864) === 67108864;
};

Promise.prototype._setLength = function (len) {
    this._bitField = (this._bitField & -65536) |
        (len & 65535);
};

Promise.prototype._setFulfilled = function () {
    this._bitField = this._bitField | 33554432;
    this._fireEvent("promiseFulfilled", this);
};

Promise.prototype._setRejected = function () {
    this._bitField = this._bitField | 16777216;
    this._fireEvent("promiseRejected", this);
};

Promise.prototype._setFollowing = function () {
    this._bitField = this._bitField | 67108864;
    this._fireEvent("promiseResolved", this);
};

Promise.prototype._setIsFinal = function () {
    this._bitField = this._bitField | 4194304;
};

Promise.prototype._isFinal = function () {
    return (this._bitField & 4194304) > 0;
};

Promise.prototype._unsetCancelled = function() {
    this._bitField = this._bitField & (~65536);
};

Promise.prototype._setCancelled = function() {
    this._bitField = this._bitField | 65536;
    this._fireEvent("promiseCancelled", this);
};

Promise.prototype._setWillBeCancelled = function() {
    this._bitField = this._bitField | 8388608;
};

Promise.prototype._setAsyncGuaranteed = function() {
    if (async.hasCustomScheduler()) return;
    this._bitField = this._bitField | 134217728;
};

Promise.prototype._receiverAt = function (index) {
    var ret = index === 0 ? this._receiver0 : this[
            index * 4 - 4 + 3];
    if (ret === UNDEFINED_BINDING) {
        return undefined;
    } else if (ret === undefined && this._isBound()) {
        return this._boundValue();
    }
    return ret;
};

Promise.prototype._promiseAt = function (index) {
    return this[
            index * 4 - 4 + 2];
};

Promise.prototype._fulfillmentHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 0];
};

Promise.prototype._rejectionHandlerAt = function (index) {
    return this[
            index * 4 - 4 + 1];
};

Promise.prototype._boundValue = function() {};

Promise.prototype._migrateCallback0 = function (follower) {
    var bitField = follower._bitField;
    var fulfill = follower._fulfillmentHandler0;
    var reject = follower._rejectionHandler0;
    var promise = follower._promise0;
    var receiver = follower._receiverAt(0);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._migrateCallbackAt = function (follower, index) {
    var fulfill = follower._fulfillmentHandlerAt(index);
    var reject = follower._rejectionHandlerAt(index);
    var promise = follower._promiseAt(index);
    var receiver = follower._receiverAt(index);
    if (receiver === undefined) receiver = UNDEFINED_BINDING;
    this._addCallbacks(fulfill, reject, promise, receiver, null);
};

Promise.prototype._addCallbacks = function (
    fulfill,
    reject,
    promise,
    receiver,
    domain
) {
    var index = this._length();

    if (index >= 65535 - 4) {
        index = 0;
        this._setLength(0);
    }

    if (index === 0) {
        this._promise0 = promise;
        this._receiver0 = receiver;
        if (typeof fulfill === "function") {
            this._fulfillmentHandler0 =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this._rejectionHandler0 =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    } else {
        var base = index * 4 - 4;
        this[base + 2] = promise;
        this[base + 3] = receiver;
        if (typeof fulfill === "function") {
            this[base + 0] =
                domain === null ? fulfill : util.domainBind(domain, fulfill);
        }
        if (typeof reject === "function") {
            this[base + 1] =
                domain === null ? reject : util.domainBind(domain, reject);
        }
    }
    this._setLength(index + 1);
    return index;
};

Promise.prototype._proxy = function (proxyable, arg) {
    this._addCallbacks(undefined, undefined, arg, proxyable, null);
};

Promise.prototype._resolveCallback = function(value, shouldBind) {
    if (((this._bitField & 117506048) !== 0)) return;
    if (value === this)
        return this._rejectCallback(makeSelfResolutionError(), false);
    var maybePromise = tryConvertToPromise(value, this);
    if (!(maybePromise instanceof Promise)) return this._fulfill(value);

    if (shouldBind) this._propagateFrom(maybePromise, 2);

    var promise = maybePromise._target();

    if (promise === this) {
        this._reject(makeSelfResolutionError());
        return;
    }

    var bitField = promise._bitField;
    if (((bitField & 50397184) === 0)) {
        var len = this._length();
        if (len > 0) promise._migrateCallback0(this);
        for (var i = 1; i < len; ++i) {
            promise._migrateCallbackAt(this, i);
        }
        this._setFollowing();
        this._setLength(0);
        this._setFollowee(promise);
    } else if (((bitField & 33554432) !== 0)) {
        this._fulfill(promise._value());
    } else if (((bitField & 16777216) !== 0)) {
        this._reject(promise._reason());
    } else {
        var reason = new CancellationError("late cancellation observer");
        promise._attachExtraTrace(reason);
        this._reject(reason);
    }
};

Promise.prototype._rejectCallback =
function(reason, synchronous, ignoreNonErrorWarnings) {
    var trace = util.ensureErrorObject(reason);
    var hasStack = trace === reason;
    if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
        var message = "a promise was rejected with a non-error: " +
            util.classString(reason);
        this._warn(message, true);
    }
    this._attachExtraTrace(trace, synchronous ? hasStack : false);
    this._reject(reason);
};

Promise.prototype._resolveFromExecutor = function (executor) {
    var promise = this;
    this._captureStackTrace();
    this._pushContext();
    var synchronous = true;
    var r = this._execute(executor, function(value) {
        promise._resolveCallback(value);
    }, function (reason) {
        promise._rejectCallback(reason, synchronous);
    });
    synchronous = false;
    this._popContext();

    if (r !== undefined) {
        promise._rejectCallback(r, true);
    }
};

Promise.prototype._settlePromiseFromHandler = function (
    handler, receiver, value, promise
) {
    var bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;
    promise._pushContext();
    var x;
    if (receiver === APPLY) {
        if (!value || typeof value.length !== "number") {
            x = errorObj;
            x.e = new TypeError("cannot .spread() a non-array: " +
                                    util.classString(value));
        } else {
            x = tryCatch(handler).apply(this._boundValue(), value);
        }
    } else {
        x = tryCatch(handler).call(receiver, value);
    }
    var promiseCreated = promise._popContext();
    bitField = promise._bitField;
    if (((bitField & 65536) !== 0)) return;

    if (x === NEXT_FILTER) {
        promise._reject(value);
    } else if (x === errorObj) {
        promise._rejectCallback(x.e, false);
    } else {
        debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
        promise._resolveCallback(x);
    }
};

Promise.prototype._target = function() {
    var ret = this;
    while (ret._isFollowing()) ret = ret._followee();
    return ret;
};

Promise.prototype._followee = function() {
    return this._rejectionHandler0;
};

Promise.prototype._setFollowee = function(promise) {
    this._rejectionHandler0 = promise;
};

Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
    var isPromise = promise instanceof Promise;
    var bitField = this._bitField;
    var asyncGuaranteed = ((bitField & 134217728) !== 0);
    if (((bitField & 65536) !== 0)) {
        if (isPromise) promise._invokeInternalOnCancel();

        if (receiver instanceof PassThroughHandlerContext &&
            receiver.isFinallyHandler()) {
            receiver.cancelPromise = promise;
            if (tryCatch(handler).call(receiver, value) === errorObj) {
                promise._reject(errorObj.e);
            }
        } else if (handler === reflectHandler) {
            promise._fulfill(reflectHandler.call(receiver));
        } else if (receiver instanceof Proxyable) {
            receiver._promiseCancelled(promise);
        } else if (isPromise || promise instanceof PromiseArray) {
            promise._cancel();
        } else {
            receiver.cancel();
        }
    } else if (typeof handler === "function") {
        if (!isPromise) {
            handler.call(receiver, value, promise);
        } else {
            if (asyncGuaranteed) promise._setAsyncGuaranteed();
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (receiver instanceof Proxyable) {
        if (!receiver._isResolved()) {
            if (((bitField & 33554432) !== 0)) {
                receiver._promiseFulfilled(value, promise);
            } else {
                receiver._promiseRejected(value, promise);
            }
        }
    } else if (isPromise) {
        if (asyncGuaranteed) promise._setAsyncGuaranteed();
        if (((bitField & 33554432) !== 0)) {
            promise._fulfill(value);
        } else {
            promise._reject(value);
        }
    }
};

Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
    var handler = ctx.handler;
    var promise = ctx.promise;
    var receiver = ctx.receiver;
    var value = ctx.value;
    if (typeof handler === "function") {
        if (!(promise instanceof Promise)) {
            handler.call(receiver, value, promise);
        } else {
            this._settlePromiseFromHandler(handler, receiver, value, promise);
        }
    } else if (promise instanceof Promise) {
        promise._reject(value);
    }
};

Promise.prototype._settlePromiseCtx = function(ctx) {
    this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
};

Promise.prototype._settlePromise0 = function(handler, value, bitField) {
    var promise = this._promise0;
    var receiver = this._receiverAt(0);
    this._promise0 = undefined;
    this._receiver0 = undefined;
    this._settlePromise(promise, handler, receiver, value);
};

Promise.prototype._clearCallbackDataAtIndex = function(index) {
    var base = index * 4 - 4;
    this[base + 2] =
    this[base + 3] =
    this[base + 0] =
    this[base + 1] = undefined;
};

Promise.prototype._fulfill = function (value) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    if (value === this) {
        var err = makeSelfResolutionError();
        this._attachExtraTrace(err);
        return this._reject(err);
    }
    this._setFulfilled();
    this._rejectionHandler0 = value;

    if ((bitField & 65535) > 0) {
        if (((bitField & 134217728) !== 0)) {
            this._settlePromises();
        } else {
            async.settlePromises(this);
        }
    }
};

Promise.prototype._reject = function (reason) {
    var bitField = this._bitField;
    if (((bitField & 117506048) >>> 16)) return;
    this._setRejected();
    this._fulfillmentHandler0 = reason;

    if (this._isFinal()) {
        return async.fatalError(reason, util.isNode);
    }

    if ((bitField & 65535) > 0) {
        async.settlePromises(this);
    } else {
        this._ensurePossibleRejectionHandled();
    }
};

Promise.prototype._fulfillPromises = function (len, value) {
    for (var i = 1; i < len; i++) {
        var handler = this._fulfillmentHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, value);
    }
};

Promise.prototype._rejectPromises = function (len, reason) {
    for (var i = 1; i < len; i++) {
        var handler = this._rejectionHandlerAt(i);
        var promise = this._promiseAt(i);
        var receiver = this._receiverAt(i);
        this._clearCallbackDataAtIndex(i);
        this._settlePromise(promise, handler, receiver, reason);
    }
};

Promise.prototype._settlePromises = function () {
    var bitField = this._bitField;
    var len = (bitField & 65535);

    if (len > 0) {
        if (((bitField & 16842752) !== 0)) {
            var reason = this._fulfillmentHandler0;
            this._settlePromise0(this._rejectionHandler0, reason, bitField);
            this._rejectPromises(len, reason);
        } else {
            var value = this._rejectionHandler0;
            this._settlePromise0(this._fulfillmentHandler0, value, bitField);
            this._fulfillPromises(len, value);
        }
        this._setLength(0);
    }
    this._clearCancellationData();
};

Promise.prototype._settledValue = function() {
    var bitField = this._bitField;
    if (((bitField & 33554432) !== 0)) {
        return this._rejectionHandler0;
    } else if (((bitField & 16777216) !== 0)) {
        return this._fulfillmentHandler0;
    }
};

function deferResolve(v) {this.promise._resolveCallback(v);}
function deferReject(v) {this.promise._rejectCallback(v, false);}

Promise.defer = Promise.pending = function() {
    debug.deprecated("Promise.defer", "new Promise");
    var promise = new Promise(INTERNAL);
    return {
        promise: promise,
        resolve: deferResolve,
        reject: deferReject
    };
};

util.notEnumerableProp(Promise,
                       "_makeSelfResolutionError",
                       makeSelfResolutionError);

_dereq_("./method")(Promise, INTERNAL, tryConvertToPromise, apiRejection,
    debug);
_dereq_("./bind")(Promise, INTERNAL, tryConvertToPromise, debug);
_dereq_("./cancel")(Promise, PromiseArray, apiRejection, debug);
_dereq_("./direct_resolve")(Promise);
_dereq_("./synchronous_inspection")(Promise);
_dereq_("./join")(
    Promise, PromiseArray, tryConvertToPromise, INTERNAL, async, getDomain);
Promise.Promise = Promise;
Promise.version = "3.4.6";
_dereq_('./map.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./call_get.js')(Promise);
_dereq_('./using.js')(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
_dereq_('./timers.js')(Promise, INTERNAL, debug);
_dereq_('./generators.js')(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
_dereq_('./nodeify.js')(Promise);
_dereq_('./promisify.js')(Promise, INTERNAL);
_dereq_('./props.js')(Promise, PromiseArray, tryConvertToPromise, apiRejection);
_dereq_('./race.js')(Promise, INTERNAL, tryConvertToPromise, apiRejection);
_dereq_('./reduce.js')(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
_dereq_('./settle.js')(Promise, PromiseArray, debug);
_dereq_('./some.js')(Promise, PromiseArray, apiRejection);
_dereq_('./filter.js')(Promise, INTERNAL);
_dereq_('./each.js')(Promise, INTERNAL);
_dereq_('./any.js')(Promise);
                                                         
    util.toFastProperties(Promise);                                          
    util.toFastProperties(Promise.prototype);                                
    function fillTypes(value) {                                              
        var p = new Promise(INTERNAL);                                       
        p._fulfillmentHandler0 = value;                                      
        p._rejectionHandler0 = value;                                        
        p._promise0 = value;                                                 
        p._receiver0 = value;                                                
    }                                                                        
    // Complete slack tracking, opt out of field-type tracking and           
    // stabilize map                                                         
    fillTypes({a: 1});                                                       
    fillTypes({b: 2});                                                       
    fillTypes({c: 3});                                                       
    fillTypes(1);                                                            
    fillTypes(function(){});                                                 
    fillTypes(undefined);                                                    
    fillTypes(false);                                                        
    fillTypes(new Promise(INTERNAL));                                        
    debug.setBounds(Async.firstLineError, util.lastLineError);               
    return Promise;                                                          

};

},{"./any.js":1,"./async":2,"./bind":3,"./call_get.js":5,"./cancel":6,"./catch_filter":7,"./context":8,"./debuggability":9,"./direct_resolve":10,"./each.js":11,"./errors":12,"./es5":13,"./filter.js":14,"./finally":15,"./generators.js":16,"./join":17,"./map.js":18,"./method":19,"./nodeback":20,"./nodeify.js":21,"./promise_array":23,"./promisify.js":24,"./props.js":25,"./race.js":27,"./reduce.js":28,"./settle.js":30,"./some.js":31,"./synchronous_inspection":32,"./thenables":33,"./timers.js":34,"./using.js":35,"./util":36}],23:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, tryConvertToPromise,
    apiRejection, Proxyable) {
var util = _dereq_("./util");
var isArray = util.isArray;

function toResolutionValue(val) {
    switch(val) {
    case -2: return [];
    case -3: return {};
    }
}

function PromiseArray(values) {
    var promise = this._promise = new Promise(INTERNAL);
    if (values instanceof Promise) {
        promise._propagateFrom(values, 3);
    }
    promise._setOnCancel(this);
    this._values = values;
    this._length = 0;
    this._totalResolved = 0;
    this._init(undefined, -2);
}
util.inherits(PromiseArray, Proxyable);

PromiseArray.prototype.length = function () {
    return this._length;
};

PromiseArray.prototype.promise = function () {
    return this._promise;
};

PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
    var values = tryConvertToPromise(this._values, this._promise);
    if (values instanceof Promise) {
        values = values._target();
        var bitField = values._bitField;
        ;
        this._values = values;

        if (((bitField & 50397184) === 0)) {
            this._promise._setAsyncGuaranteed();
            return values._then(
                init,
                this._reject,
                undefined,
                this,
                resolveValueIfEmpty
           );
        } else if (((bitField & 33554432) !== 0)) {
            values = values._value();
        } else if (((bitField & 16777216) !== 0)) {
            return this._reject(values._reason());
        } else {
            return this._cancel();
        }
    }
    values = util.asArray(values);
    if (values === null) {
        var err = apiRejection(
            "expecting an array or an iterable object but got " + util.classString(values)).reason();
        this._promise._rejectCallback(err, false);
        return;
    }

    if (values.length === 0) {
        if (resolveValueIfEmpty === -5) {
            this._resolveEmptyArray();
        }
        else {
            this._resolve(toResolutionValue(resolveValueIfEmpty));
        }
        return;
    }
    this._iterate(values);
};

PromiseArray.prototype._iterate = function(values) {
    var len = this.getActualLength(values.length);
    this._length = len;
    this._values = this.shouldCopyValues() ? new Array(len) : this._values;
    var result = this._promise;
    var isResolved = false;
    var bitField = null;
    for (var i = 0; i < len; ++i) {
        var maybePromise = tryConvertToPromise(values[i], result);

        if (maybePromise instanceof Promise) {
            maybePromise = maybePromise._target();
            bitField = maybePromise._bitField;
        } else {
            bitField = null;
        }

        if (isResolved) {
            if (bitField !== null) {
                maybePromise.suppressUnhandledRejections();
            }
        } else if (bitField !== null) {
            if (((bitField & 50397184) === 0)) {
                maybePromise._proxy(this, i);
                this._values[i] = maybePromise;
            } else if (((bitField & 33554432) !== 0)) {
                isResolved = this._promiseFulfilled(maybePromise._value(), i);
            } else if (((bitField & 16777216) !== 0)) {
                isResolved = this._promiseRejected(maybePromise._reason(), i);
            } else {
                isResolved = this._promiseCancelled(i);
            }
        } else {
            isResolved = this._promiseFulfilled(maybePromise, i);
        }
    }
    if (!isResolved) result._setAsyncGuaranteed();
};

PromiseArray.prototype._isResolved = function () {
    return this._values === null;
};

PromiseArray.prototype._resolve = function (value) {
    this._values = null;
    this._promise._fulfill(value);
};

PromiseArray.prototype._cancel = function() {
    if (this._isResolved() || !this._promise._isCancellable()) return;
    this._values = null;
    this._promise._cancel();
};

PromiseArray.prototype._reject = function (reason) {
    this._values = null;
    this._promise._rejectCallback(reason, false);
};

PromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

PromiseArray.prototype._promiseCancelled = function() {
    this._cancel();
    return true;
};

PromiseArray.prototype._promiseRejected = function (reason) {
    this._totalResolved++;
    this._reject(reason);
    return true;
};

PromiseArray.prototype._resultCancelled = function() {
    if (this._isResolved()) return;
    var values = this._values;
    this._cancel();
    if (values instanceof Promise) {
        values.cancel();
    } else {
        for (var i = 0; i < values.length; ++i) {
            if (values[i] instanceof Promise) {
                values[i].cancel();
            }
        }
    }
};

PromiseArray.prototype.shouldCopyValues = function () {
    return true;
};

PromiseArray.prototype.getActualLength = function (len) {
    return len;
};

return PromiseArray;
};

},{"./util":36}],24:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var THIS = {};
var util = _dereq_("./util");
var nodebackForPromise = _dereq_("./nodeback");
var withAppended = util.withAppended;
var maybeWrapAsError = util.maybeWrapAsError;
var canEvaluate = util.canEvaluate;
var TypeError = _dereq_("./errors").TypeError;
var defaultSuffix = "Async";
var defaultPromisified = {__isPromisified__: true};
var noCopyProps = [
    "arity",    "length",
    "name",
    "arguments",
    "caller",
    "callee",
    "prototype",
    "__isPromisified__"
];
var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

var defaultFilter = function(name) {
    return util.isIdentifier(name) &&
        name.charAt(0) !== "_" &&
        name !== "constructor";
};

function propsFilter(key) {
    return !noCopyPropsPattern.test(key);
}

function isPromisified(fn) {
    try {
        return fn.__isPromisified__ === true;
    }
    catch (e) {
        return false;
    }
}

function hasPromisified(obj, key, suffix) {
    var val = util.getDataPropertyOrDefault(obj, key + suffix,
                                            defaultPromisified);
    return val ? isPromisified(val) : false;
}
function checkValid(ret, suffix, suffixRegexp) {
    for (var i = 0; i < ret.length; i += 2) {
        var key = ret[i];
        if (suffixRegexp.test(key)) {
            var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
            for (var j = 0; j < ret.length; j += 2) {
                if (ret[j] === keyWithoutAsyncSuffix) {
                    throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                        .replace("%s", suffix));
                }
            }
        }
    }
}

function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
    var keys = util.inheritedDataKeys(obj);
    var ret = [];
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var value = obj[key];
        var passesDefaultFilter = filter === defaultFilter
            ? true : defaultFilter(key, value, obj);
        if (typeof value === "function" &&
            !isPromisified(value) &&
            !hasPromisified(obj, key, suffix) &&
            filter(key, value, obj, passesDefaultFilter)) {
            ret.push(key, value);
        }
    }
    checkValid(ret, suffix, suffixRegexp);
    return ret;
}

var escapeIdentRegex = function(str) {
    return str.replace(/([$])/, "\\$");
};

var makeNodePromisifiedEval;
if (!true) {
var switchCaseArgumentOrder = function(likelyArgumentCount) {
    var ret = [likelyArgumentCount];
    var min = Math.max(0, likelyArgumentCount - 1 - 3);
    for(var i = likelyArgumentCount - 1; i >= min; --i) {
        ret.push(i);
    }
    for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
        ret.push(i);
    }
    return ret;
};

var argumentSequence = function(argumentCount) {
    return util.filledRange(argumentCount, "_arg", "");
};

var parameterDeclaration = function(parameterCount) {
    return util.filledRange(
        Math.max(parameterCount, 3), "_arg", "");
};

var parameterCount = function(fn) {
    if (typeof fn.length === "number") {
        return Math.max(Math.min(fn.length, 1023 + 1), 0);
    }
    return 0;
};

makeNodePromisifiedEval =
function(callback, receiver, originalName, fn, _, multiArgs) {
    var newParameterCount = Math.max(0, parameterCount(fn) - 1);
    var argumentOrder = switchCaseArgumentOrder(newParameterCount);
    var shouldProxyThis = typeof callback === "string" || receiver === THIS;

    function generateCallForArgumentCount(count) {
        var args = argumentSequence(count).join(", ");
        var comma = count > 0 ? ", " : "";
        var ret;
        if (shouldProxyThis) {
            ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
        } else {
            ret = receiver === undefined
                ? "ret = callback({{args}}, nodeback); break;\n"
                : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
        }
        return ret.replace("{{args}}", args).replace(", ", comma);
    }

    function generateArgumentSwitchCase() {
        var ret = "";
        for (var i = 0; i < argumentOrder.length; ++i) {
            ret += "case " + argumentOrder[i] +":" +
                generateCallForArgumentCount(argumentOrder[i]);
        }

        ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = nodeback;                                              \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", (shouldProxyThis
                                ? "ret = callback.apply(this, args);\n"
                                : "ret = callback.apply(receiver, args);\n"));
        return ret;
    }

    var getFunctionCode = typeof callback === "string"
                                ? ("this != null ? this['"+callback+"'] : fn")
                                : "fn";
    var body = "'use strict';                                                \n\
        var ret = function (Parameters) {                                    \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._captureStackTrace();                                    \n\
            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
            var ret;                                                         \n\
            var callback = tryCatch([GetFunctionCode]);                      \n\
            switch(len) {                                                    \n\
                [CodeForSwitchCase]                                          \n\
            }                                                                \n\
            if (ret === errorObj) {                                          \n\
                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
            }                                                                \n\
            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
            return promise;                                                  \n\
        };                                                                   \n\
        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
        return ret;                                                          \n\
    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
        .replace("[GetFunctionCode]", getFunctionCode);
    body = body.replace("Parameters", parameterDeclaration(newParameterCount));
    return new Function("Promise",
                        "fn",
                        "receiver",
                        "withAppended",
                        "maybeWrapAsError",
                        "nodebackForPromise",
                        "tryCatch",
                        "errorObj",
                        "notEnumerableProp",
                        "INTERNAL",
                        body)(
                    Promise,
                    fn,
                    receiver,
                    withAppended,
                    maybeWrapAsError,
                    nodebackForPromise,
                    util.tryCatch,
                    util.errorObj,
                    util.notEnumerableProp,
                    INTERNAL);
};
}

function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
    var defaultThis = (function() {return this;})();
    var method = callback;
    if (typeof method === "string") {
        callback = fn;
    }
    function promisified() {
        var _receiver = receiver;
        if (receiver === THIS) _receiver = this;
        var promise = new Promise(INTERNAL);
        promise._captureStackTrace();
        var cb = typeof method === "string" && this !== defaultThis
            ? this[method] : callback;
        var fn = nodebackForPromise(promise, multiArgs);
        try {
            cb.apply(_receiver, withAppended(arguments, fn));
        } catch(e) {
            promise._rejectCallback(maybeWrapAsError(e), true, true);
        }
        if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
        return promise;
    }
    util.notEnumerableProp(promisified, "__isPromisified__", true);
    return promisified;
}

var makeNodePromisified = canEvaluate
    ? makeNodePromisifiedEval
    : makeNodePromisifiedClosure;

function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
    var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
    var methods =
        promisifiableMethods(obj, suffix, suffixRegexp, filter);

    for (var i = 0, len = methods.length; i < len; i+= 2) {
        var key = methods[i];
        var fn = methods[i+1];
        var promisifiedKey = key + suffix;
        if (promisifier === makeNodePromisified) {
            obj[promisifiedKey] =
                makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
        } else {
            var promisified = promisifier(fn, function() {
                return makeNodePromisified(key, THIS, key,
                                           fn, suffix, multiArgs);
            });
            util.notEnumerableProp(promisified, "__isPromisified__", true);
            obj[promisifiedKey] = promisified;
        }
    }
    util.toFastProperties(obj);
    return obj;
}

function promisify(callback, receiver, multiArgs) {
    return makeNodePromisified(callback, receiver, undefined,
                                callback, null, multiArgs);
}

Promise.promisify = function (fn, options) {
    if (typeof fn !== "function") {
        throw new TypeError("expecting a function but got " + util.classString(fn));
    }
    if (isPromisified(fn)) {
        return fn;
    }
    options = Object(options);
    var receiver = options.context === undefined ? THIS : options.context;
    var multiArgs = !!options.multiArgs;
    var ret = promisify(fn, receiver, multiArgs);
    util.copyDescriptors(fn, ret, propsFilter);
    return ret;
};

Promise.promisifyAll = function (target, options) {
    if (typeof target !== "function" && typeof target !== "object") {
        throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    options = Object(options);
    var multiArgs = !!options.multiArgs;
    var suffix = options.suffix;
    if (typeof suffix !== "string") suffix = defaultSuffix;
    var filter = options.filter;
    if (typeof filter !== "function") filter = defaultFilter;
    var promisifier = options.promisifier;
    if (typeof promisifier !== "function") promisifier = makeNodePromisified;

    if (!util.isIdentifier(suffix)) {
        throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }

    var keys = util.inheritedDataKeys(target);
    for (var i = 0; i < keys.length; ++i) {
        var value = target[keys[i]];
        if (keys[i] !== "constructor" &&
            util.isClass(value)) {
            promisifyAll(value.prototype, suffix, filter, promisifier,
                multiArgs);
            promisifyAll(value, suffix, filter, promisifier, multiArgs);
        }
    }

    return promisifyAll(target, suffix, filter, promisifier, multiArgs);
};
};


},{"./errors":12,"./nodeback":20,"./util":36}],25:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, PromiseArray, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");
var isObject = util.isObject;
var es5 = _dereq_("./es5");
var Es6Map;
if (typeof Map === "function") Es6Map = Map;

var mapToEntries = (function() {
    var index = 0;
    var size = 0;

    function extractEntry(value, key) {
        this[index] = value;
        this[index + size] = key;
        index++;
    }

    return function mapToEntries(map) {
        size = map.size;
        index = 0;
        var ret = new Array(map.size * 2);
        map.forEach(extractEntry, ret);
        return ret;
    };
})();

var entriesToMap = function(entries) {
    var ret = new Es6Map();
    var length = entries.length / 2 | 0;
    for (var i = 0; i < length; ++i) {
        var key = entries[length + i];
        var value = entries[i];
        ret.set(key, value);
    }
    return ret;
};

function PropertiesPromiseArray(obj) {
    var isMap = false;
    var entries;
    if (Es6Map !== undefined && obj instanceof Es6Map) {
        entries = mapToEntries(obj);
        isMap = true;
    } else {
        var keys = es5.keys(obj);
        var len = keys.length;
        entries = new Array(len * 2);
        for (var i = 0; i < len; ++i) {
            var key = keys[i];
            entries[i] = obj[key];
            entries[i + len] = key;
        }
    }
    this.constructor$(entries);
    this._isMap = isMap;
    this._init$(undefined, -3);
}
util.inherits(PropertiesPromiseArray, PromiseArray);

PropertiesPromiseArray.prototype._init = function () {};

PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
    this._values[index] = value;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        var val;
        if (this._isMap) {
            val = entriesToMap(this._values);
        } else {
            val = {};
            var keyOffset = this.length();
            for (var i = 0, len = this.length(); i < len; ++i) {
                val[this._values[i + keyOffset]] = this._values[i];
            }
        }
        this._resolve(val);
        return true;
    }
    return false;
};

PropertiesPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

PropertiesPromiseArray.prototype.getActualLength = function (len) {
    return len >> 1;
};

function props(promises) {
    var ret;
    var castValue = tryConvertToPromise(promises);

    if (!isObject(castValue)) {
        return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    } else if (castValue instanceof Promise) {
        ret = castValue._then(
            Promise.props, undefined, undefined, undefined, undefined);
    } else {
        ret = new PropertiesPromiseArray(castValue).promise();
    }

    if (castValue instanceof Promise) {
        ret._propagateFrom(castValue, 2);
    }
    return ret;
}

Promise.prototype.props = function () {
    return props(this);
};

Promise.props = function (promises) {
    return props(promises);
};
};

},{"./es5":13,"./util":36}],26:[function(_dereq_,module,exports){
"use strict";
function arrayMove(src, srcIndex, dst, dstIndex, len) {
    for (var j = 0; j < len; ++j) {
        dst[j + dstIndex] = src[j + srcIndex];
        src[j + srcIndex] = void 0;
    }
}

function Queue(capacity) {
    this._capacity = capacity;
    this._length = 0;
    this._front = 0;
}

Queue.prototype._willBeOverCapacity = function (size) {
    return this._capacity < size;
};

Queue.prototype._pushOne = function (arg) {
    var length = this.length();
    this._checkCapacity(length + 1);
    var i = (this._front + length) & (this._capacity - 1);
    this[i] = arg;
    this._length = length + 1;
};

Queue.prototype._unshiftOne = function(value) {
    var capacity = this._capacity;
    this._checkCapacity(this.length() + 1);
    var front = this._front;
    var i = (((( front - 1 ) &
                    ( capacity - 1) ) ^ capacity ) - capacity );
    this[i] = value;
    this._front = i;
    this._length = this.length() + 1;
};

Queue.prototype.unshift = function(fn, receiver, arg) {
    this._unshiftOne(arg);
    this._unshiftOne(receiver);
    this._unshiftOne(fn);
};

Queue.prototype.push = function (fn, receiver, arg) {
    var length = this.length() + 3;
    if (this._willBeOverCapacity(length)) {
        this._pushOne(fn);
        this._pushOne(receiver);
        this._pushOne(arg);
        return;
    }
    var j = this._front + length - 3;
    this._checkCapacity(length);
    var wrapMask = this._capacity - 1;
    this[(j + 0) & wrapMask] = fn;
    this[(j + 1) & wrapMask] = receiver;
    this[(j + 2) & wrapMask] = arg;
    this._length = length;
};

Queue.prototype.shift = function () {
    var front = this._front,
        ret = this[front];

    this[front] = undefined;
    this._front = (front + 1) & (this._capacity - 1);
    this._length--;
    return ret;
};

Queue.prototype.length = function () {
    return this._length;
};

Queue.prototype._checkCapacity = function (size) {
    if (this._capacity < size) {
        this._resizeTo(this._capacity << 1);
    }
};

Queue.prototype._resizeTo = function (capacity) {
    var oldCapacity = this._capacity;
    this._capacity = capacity;
    var front = this._front;
    var length = this._length;
    var moveItemsCount = (front + length) & (oldCapacity - 1);
    arrayMove(this, 0, this, oldCapacity, moveItemsCount);
};

module.exports = Queue;

},{}],27:[function(_dereq_,module,exports){
"use strict";
module.exports = function(
    Promise, INTERNAL, tryConvertToPromise, apiRejection) {
var util = _dereq_("./util");

var raceLater = function (promise) {
    return promise.then(function(array) {
        return race(array, promise);
    });
};

function race(promises, parent) {
    var maybePromise = tryConvertToPromise(promises);

    if (maybePromise instanceof Promise) {
        return raceLater(maybePromise);
    } else {
        promises = util.asArray(promises);
        if (promises === null)
            return apiRejection("expecting an array or an iterable object but got " + util.classString(promises));
    }

    var ret = new Promise(INTERNAL);
    if (parent !== undefined) {
        ret._propagateFrom(parent, 3);
    }
    var fulfill = ret._fulfill;
    var reject = ret._reject;
    for (var i = 0, len = promises.length; i < len; ++i) {
        var val = promises[i];

        if (val === undefined && !(i in promises)) {
            continue;
        }

        Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
    }
    return ret;
}

Promise.race = function (promises) {
    return race(promises, undefined);
};

Promise.prototype.race = function () {
    return race(this, undefined);
};

};

},{"./util":36}],28:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise,
                          PromiseArray,
                          apiRejection,
                          tryConvertToPromise,
                          INTERNAL,
                          debug) {
var getDomain = Promise._getDomain;
var util = _dereq_("./util");
var tryCatch = util.tryCatch;

function ReductionPromiseArray(promises, fn, initialValue, _each) {
    this.constructor$(promises);
    var domain = getDomain();
    this._fn = domain === null ? fn : util.domainBind(domain, fn);
    if (initialValue !== undefined) {
        initialValue = Promise.resolve(initialValue);
        initialValue._attachCancellationCallback(this);
    }
    this._initialValue = initialValue;
    this._currentCancellable = null;
    if(_each === INTERNAL) {
        this._eachValues = Array(this._length);
    } else if (_each === 0) {
        this._eachValues = null;
    } else {
        this._eachValues = undefined;
    }
    this._promise._captureStackTrace();
    this._init$(undefined, -5);
}
util.inherits(ReductionPromiseArray, PromiseArray);

ReductionPromiseArray.prototype._gotAccum = function(accum) {
    if (this._eachValues !== undefined && 
        this._eachValues !== null && 
        accum !== INTERNAL) {
        this._eachValues.push(accum);
    }
};

ReductionPromiseArray.prototype._eachComplete = function(value) {
    if (this._eachValues !== null) {
        this._eachValues.push(value);
    }
    return this._eachValues;
};

ReductionPromiseArray.prototype._init = function() {};

ReductionPromiseArray.prototype._resolveEmptyArray = function() {
    this._resolve(this._eachValues !== undefined ? this._eachValues
                                                 : this._initialValue);
};

ReductionPromiseArray.prototype.shouldCopyValues = function () {
    return false;
};

ReductionPromiseArray.prototype._resolve = function(value) {
    this._promise._resolveCallback(value);
    this._values = null;
};

ReductionPromiseArray.prototype._resultCancelled = function(sender) {
    if (sender === this._initialValue) return this._cancel();
    if (this._isResolved()) return;
    this._resultCancelled$();
    if (this._currentCancellable instanceof Promise) {
        this._currentCancellable.cancel();
    }
    if (this._initialValue instanceof Promise) {
        this._initialValue.cancel();
    }
};

ReductionPromiseArray.prototype._iterate = function (values) {
    this._values = values;
    var value;
    var i;
    var length = values.length;
    if (this._initialValue !== undefined) {
        value = this._initialValue;
        i = 0;
    } else {
        value = Promise.resolve(values[0]);
        i = 1;
    }

    this._currentCancellable = value;

    if (!value.isRejected()) {
        for (; i < length; ++i) {
            var ctx = {
                accum: null,
                value: values[i],
                index: i,
                length: length,
                array: this
            };
            value = value._then(gotAccum, undefined, undefined, ctx, undefined);
        }
    }

    if (this._eachValues !== undefined) {
        value = value
            ._then(this._eachComplete, undefined, undefined, this, undefined);
    }
    value._then(completed, completed, undefined, value, this);
};

Promise.prototype.reduce = function (fn, initialValue) {
    return reduce(this, fn, initialValue, null);
};

Promise.reduce = function (promises, fn, initialValue, _each) {
    return reduce(promises, fn, initialValue, _each);
};

function completed(valueOrReason, array) {
    if (this.isFulfilled()) {
        array._resolve(valueOrReason);
    } else {
        array._reject(valueOrReason);
    }
}

function reduce(promises, fn, initialValue, _each) {
    if (typeof fn !== "function") {
        return apiRejection("expecting a function but got " + util.classString(fn));
    }
    var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
    return array.promise();
}

function gotAccum(accum) {
    this.accum = accum;
    this.array._gotAccum(accum);
    var value = tryConvertToPromise(this.value, this.array._promise);
    if (value instanceof Promise) {
        this.array._currentCancellable = value;
        return value._then(gotValue, undefined, undefined, this, undefined);
    } else {
        return gotValue.call(this, value);
    }
}

function gotValue(value) {
    var array = this.array;
    var promise = array._promise;
    var fn = tryCatch(array._fn);
    promise._pushContext();
    var ret;
    if (array._eachValues !== undefined) {
        ret = fn.call(promise._boundValue(), value, this.index, this.length);
    } else {
        ret = fn.call(promise._boundValue(),
                              this.accum, value, this.index, this.length);
    }
    if (ret instanceof Promise) {
        array._currentCancellable = ret;
    }
    var promiseCreated = promise._popContext();
    debug.checkForgottenReturns(
        ret,
        promiseCreated,
        array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
        promise
    );
    return ret;
}
};

},{"./util":36}],29:[function(_dereq_,module,exports){
"use strict";
var util = _dereq_("./util");
var schedule;
var noAsyncScheduler = function() {
    throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
};
var NativePromise = util.getNativePromise();
if (util.isNode && typeof MutationObserver === "undefined") {
    var GlobalSetImmediate = global.setImmediate;
    var ProcessNextTick = process.nextTick;
    schedule = util.isRecentNode
                ? function(fn) { GlobalSetImmediate.call(global, fn); }
                : function(fn) { ProcessNextTick.call(process, fn); };
} else if (typeof NativePromise === "function" &&
           typeof NativePromise.resolve === "function") {
    var nativePromise = NativePromise.resolve();
    schedule = function(fn) {
        nativePromise.then(fn);
    };
} else if ((typeof MutationObserver !== "undefined") &&
          !(typeof window !== "undefined" &&
            window.navigator &&
            (window.navigator.standalone || window.cordova))) {
    schedule = (function() {
        var div = document.createElement("div");
        var opts = {attributes: true};
        var toggleScheduled = false;
        var div2 = document.createElement("div");
        var o2 = new MutationObserver(function() {
            div.classList.toggle("foo");
            toggleScheduled = false;
        });
        o2.observe(div2, opts);

        var scheduleToggle = function() {
            if (toggleScheduled) return;
                toggleScheduled = true;
                div2.classList.toggle("foo");
            };

            return function schedule(fn) {
            var o = new MutationObserver(function() {
                o.disconnect();
                fn();
            });
            o.observe(div, opts);
            scheduleToggle();
        };
    })();
} else if (typeof setImmediate !== "undefined") {
    schedule = function (fn) {
        setImmediate(fn);
    };
} else if (typeof setTimeout !== "undefined") {
    schedule = function (fn) {
        setTimeout(fn, 0);
    };
} else {
    schedule = noAsyncScheduler;
}
module.exports = schedule;

},{"./util":36}],30:[function(_dereq_,module,exports){
"use strict";
module.exports =
    function(Promise, PromiseArray, debug) {
var PromiseInspection = Promise.PromiseInspection;
var util = _dereq_("./util");

function SettledPromiseArray(values) {
    this.constructor$(values);
}
util.inherits(SettledPromiseArray, PromiseArray);

SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
    this._values[index] = inspection;
    var totalResolved = ++this._totalResolved;
    if (totalResolved >= this._length) {
        this._resolve(this._values);
        return true;
    }
    return false;
};

SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
    var ret = new PromiseInspection();
    ret._bitField = 33554432;
    ret._settledValueField = value;
    return this._promiseResolved(index, ret);
};
SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
    var ret = new PromiseInspection();
    ret._bitField = 16777216;
    ret._settledValueField = reason;
    return this._promiseResolved(index, ret);
};

Promise.settle = function (promises) {
    debug.deprecated(".settle()", ".reflect()");
    return new SettledPromiseArray(promises).promise();
};

Promise.prototype.settle = function () {
    return Promise.settle(this);
};
};

},{"./util":36}],31:[function(_dereq_,module,exports){
"use strict";
module.exports =
function(Promise, PromiseArray, apiRejection) {
var util = _dereq_("./util");
var RangeError = _dereq_("./errors").RangeError;
var AggregateError = _dereq_("./errors").AggregateError;
var isArray = util.isArray;
var CANCELLATION = {};


function SomePromiseArray(values) {
    this.constructor$(values);
    this._howMany = 0;
    this._unwrap = false;
    this._initialized = false;
}
util.inherits(SomePromiseArray, PromiseArray);

SomePromiseArray.prototype._init = function () {
    if (!this._initialized) {
        return;
    }
    if (this._howMany === 0) {
        this._resolve([]);
        return;
    }
    this._init$(undefined, -5);
    var isArrayResolved = isArray(this._values);
    if (!this._isResolved() &&
        isArrayResolved &&
        this._howMany > this._canPossiblyFulfill()) {
        this._reject(this._getRangeError(this.length()));
    }
};

SomePromiseArray.prototype.init = function () {
    this._initialized = true;
    this._init();
};

SomePromiseArray.prototype.setUnwrap = function () {
    this._unwrap = true;
};

SomePromiseArray.prototype.howMany = function () {
    return this._howMany;
};

SomePromiseArray.prototype.setHowMany = function (count) {
    this._howMany = count;
};

SomePromiseArray.prototype._promiseFulfilled = function (value) {
    this._addFulfilled(value);
    if (this._fulfilled() === this.howMany()) {
        this._values.length = this.howMany();
        if (this.howMany() === 1 && this._unwrap) {
            this._resolve(this._values[0]);
        } else {
            this._resolve(this._values);
        }
        return true;
    }
    return false;

};
SomePromiseArray.prototype._promiseRejected = function (reason) {
    this._addRejected(reason);
    return this._checkOutcome();
};

SomePromiseArray.prototype._promiseCancelled = function () {
    if (this._values instanceof Promise || this._values == null) {
        return this._cancel();
    }
    this._addRejected(CANCELLATION);
    return this._checkOutcome();
};

SomePromiseArray.prototype._checkOutcome = function() {
    if (this.howMany() > this._canPossiblyFulfill()) {
        var e = new AggregateError();
        for (var i = this.length(); i < this._values.length; ++i) {
            if (this._values[i] !== CANCELLATION) {
                e.push(this._values[i]);
            }
        }
        if (e.length > 0) {
            this._reject(e);
        } else {
            this._cancel();
        }
        return true;
    }
    return false;
};

SomePromiseArray.prototype._fulfilled = function () {
    return this._totalResolved;
};

SomePromiseArray.prototype._rejected = function () {
    return this._values.length - this.length();
};

SomePromiseArray.prototype._addRejected = function (reason) {
    this._values.push(reason);
};

SomePromiseArray.prototype._addFulfilled = function (value) {
    this._values[this._totalResolved++] = value;
};

SomePromiseArray.prototype._canPossiblyFulfill = function () {
    return this.length() - this._rejected();
};

SomePromiseArray.prototype._getRangeError = function (count) {
    var message = "Input array must contain at least " +
            this._howMany + " items but contains only " + count + " items";
    return new RangeError(message);
};

SomePromiseArray.prototype._resolveEmptyArray = function () {
    this._reject(this._getRangeError(0));
};

function some(promises, howMany) {
    if ((howMany | 0) !== howMany || howMany < 0) {
        return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    var ret = new SomePromiseArray(promises);
    var promise = ret.promise();
    ret.setHowMany(howMany);
    ret.init();
    return promise;
}

Promise.some = function (promises, howMany) {
    return some(promises, howMany);
};

Promise.prototype.some = function (howMany) {
    return some(this, howMany);
};

Promise._SomePromiseArray = SomePromiseArray;
};

},{"./errors":12,"./util":36}],32:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise) {
function PromiseInspection(promise) {
    if (promise !== undefined) {
        promise = promise._target();
        this._bitField = promise._bitField;
        this._settledValueField = promise._isFateSealed()
            ? promise._settledValue() : undefined;
    }
    else {
        this._bitField = 0;
        this._settledValueField = undefined;
    }
}

PromiseInspection.prototype._settledValue = function() {
    return this._settledValueField;
};

var value = PromiseInspection.prototype.value = function () {
    if (!this.isFulfilled()) {
        throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var reason = PromiseInspection.prototype.error =
PromiseInspection.prototype.reason = function () {
    if (!this.isRejected()) {
        throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
    }
    return this._settledValue();
};

var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
    return (this._bitField & 33554432) !== 0;
};

var isRejected = PromiseInspection.prototype.isRejected = function () {
    return (this._bitField & 16777216) !== 0;
};

var isPending = PromiseInspection.prototype.isPending = function () {
    return (this._bitField & 50397184) === 0;
};

var isResolved = PromiseInspection.prototype.isResolved = function () {
    return (this._bitField & 50331648) !== 0;
};

PromiseInspection.prototype.isCancelled = function() {
    return (this._bitField & 8454144) !== 0;
};

Promise.prototype.__isCancelled = function() {
    return (this._bitField & 65536) === 65536;
};

Promise.prototype._isCancelled = function() {
    return this._target().__isCancelled();
};

Promise.prototype.isCancelled = function() {
    return (this._target()._bitField & 8454144) !== 0;
};

Promise.prototype.isPending = function() {
    return isPending.call(this._target());
};

Promise.prototype.isRejected = function() {
    return isRejected.call(this._target());
};

Promise.prototype.isFulfilled = function() {
    return isFulfilled.call(this._target());
};

Promise.prototype.isResolved = function() {
    return isResolved.call(this._target());
};

Promise.prototype.value = function() {
    return value.call(this._target());
};

Promise.prototype.reason = function() {
    var target = this._target();
    target._unsetRejectionIsUnhandled();
    return reason.call(target);
};

Promise.prototype._value = function() {
    return this._settledValue();
};

Promise.prototype._reason = function() {
    this._unsetRejectionIsUnhandled();
    return this._settledValue();
};

Promise.PromiseInspection = PromiseInspection;
};

},{}],33:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL) {
var util = _dereq_("./util");
var errorObj = util.errorObj;
var isObject = util.isObject;

function tryConvertToPromise(obj, context) {
    if (isObject(obj)) {
        if (obj instanceof Promise) return obj;
        var then = getThen(obj);
        if (then === errorObj) {
            if (context) context._pushContext();
            var ret = Promise.reject(then.e);
            if (context) context._popContext();
            return ret;
        } else if (typeof then === "function") {
            if (isAnyBluebirdPromise(obj)) {
                var ret = new Promise(INTERNAL);
                obj._then(
                    ret._fulfill,
                    ret._reject,
                    undefined,
                    ret,
                    null
                );
                return ret;
            }
            return doThenable(obj, then, context);
        }
    }
    return obj;
}

function doGetThen(obj) {
    return obj.then;
}

function getThen(obj) {
    try {
        return doGetThen(obj);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}

var hasProp = {}.hasOwnProperty;
function isAnyBluebirdPromise(obj) {
    try {
        return hasProp.call(obj, "_promise0");
    } catch (e) {
        return false;
    }
}

function doThenable(x, then, context) {
    var promise = new Promise(INTERNAL);
    var ret = promise;
    if (context) context._pushContext();
    promise._captureStackTrace();
    if (context) context._popContext();
    var synchronous = true;
    var result = util.tryCatch(then).call(x, resolve, reject);
    synchronous = false;

    if (promise && result === errorObj) {
        promise._rejectCallback(result.e, true, true);
        promise = null;
    }

    function resolve(value) {
        if (!promise) return;
        promise._resolveCallback(value);
        promise = null;
    }

    function reject(reason) {
        if (!promise) return;
        promise._rejectCallback(reason, synchronous, true);
        promise = null;
    }
    return ret;
}

return tryConvertToPromise;
};

},{"./util":36}],34:[function(_dereq_,module,exports){
"use strict";
module.exports = function(Promise, INTERNAL, debug) {
var util = _dereq_("./util");
var TimeoutError = Promise.TimeoutError;

function HandleWrapper(handle)  {
    this.handle = handle;
}

HandleWrapper.prototype._resultCancelled = function() {
    clearTimeout(this.handle);
};

var afterValue = function(value) { return delay(+this).thenReturn(value); };
var delay = Promise.delay = function (ms, value) {
    var ret;
    var handle;
    if (value !== undefined) {
        ret = Promise.resolve(value)
                ._then(afterValue, null, null, ms, undefined);
        if (debug.cancellation() && value instanceof Promise) {
            ret._setOnCancel(value);
        }
    } else {
        ret = new Promise(INTERNAL);
        handle = setTimeout(function() { ret._fulfill(); }, +ms);
        if (debug.cancellation()) {
            ret._setOnCancel(new HandleWrapper(handle));
        }
        ret._captureStackTrace();
    }
    ret._setAsyncGuaranteed();
    return ret;
};

Promise.prototype.delay = function (ms) {
    return delay(ms, this);
};

var afterTimeout = function (promise, message, parent) {
    var err;
    if (typeof message !== "string") {
        if (message instanceof Error) {
            err = message;
        } else {
            err = new TimeoutError("operation timed out");
        }
    } else {
        err = new TimeoutError(message);
    }
    util.markAsOriginatingFromRejection(err);
    promise._attachExtraTrace(err);
    promise._reject(err);

    if (parent != null) {
        parent.cancel();
    }
};

function successClear(value) {
    clearTimeout(this.handle);
    return value;
}

function failureClear(reason) {
    clearTimeout(this.handle);
    throw reason;
}

Promise.prototype.timeout = function (ms, message) {
    ms = +ms;
    var ret, parent;

    var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
        if (ret.isPending()) {
            afterTimeout(ret, message, parent);
        }
    }, ms));

    if (debug.cancellation()) {
        parent = this.then();
        ret = parent._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
        ret._setOnCancel(handleWrapper);
    } else {
        ret = this._then(successClear, failureClear,
                            undefined, handleWrapper, undefined);
    }

    return ret;
};

};

},{"./util":36}],35:[function(_dereq_,module,exports){
"use strict";
module.exports = function (Promise, apiRejection, tryConvertToPromise,
    createContext, INTERNAL, debug) {
    var util = _dereq_("./util");
    var TypeError = _dereq_("./errors").TypeError;
    var inherits = _dereq_("./util").inherits;
    var errorObj = util.errorObj;
    var tryCatch = util.tryCatch;
    var NULL = {};

    function thrower(e) {
        setTimeout(function(){throw e;}, 0);
    }

    function castPreservingDisposable(thenable) {
        var maybePromise = tryConvertToPromise(thenable);
        if (maybePromise !== thenable &&
            typeof thenable._isDisposable === "function" &&
            typeof thenable._getDisposer === "function" &&
            thenable._isDisposable()) {
            maybePromise._setDisposable(thenable._getDisposer());
        }
        return maybePromise;
    }
    function dispose(resources, inspection) {
        var i = 0;
        var len = resources.length;
        var ret = new Promise(INTERNAL);
        function iterator() {
            if (i >= len) return ret._fulfill();
            var maybePromise = castPreservingDisposable(resources[i++]);
            if (maybePromise instanceof Promise &&
                maybePromise._isDisposable()) {
                try {
                    maybePromise = tryConvertToPromise(
                        maybePromise._getDisposer().tryDispose(inspection),
                        resources.promise);
                } catch (e) {
                    return thrower(e);
                }
                if (maybePromise instanceof Promise) {
                    return maybePromise._then(iterator, thrower,
                                              null, null, null);
                }
            }
            iterator();
        }
        iterator();
        return ret;
    }

    function Disposer(data, promise, context) {
        this._data = data;
        this._promise = promise;
        this._context = context;
    }

    Disposer.prototype.data = function () {
        return this._data;
    };

    Disposer.prototype.promise = function () {
        return this._promise;
    };

    Disposer.prototype.resource = function () {
        if (this.promise().isFulfilled()) {
            return this.promise().value();
        }
        return NULL;
    };

    Disposer.prototype.tryDispose = function(inspection) {
        var resource = this.resource();
        var context = this._context;
        if (context !== undefined) context._pushContext();
        var ret = resource !== NULL
            ? this.doDispose(resource, inspection) : null;
        if (context !== undefined) context._popContext();
        this._promise._unsetDisposable();
        this._data = null;
        return ret;
    };

    Disposer.isDisposer = function (d) {
        return (d != null &&
                typeof d.resource === "function" &&
                typeof d.tryDispose === "function");
    };

    function FunctionDisposer(fn, promise, context) {
        this.constructor$(fn, promise, context);
    }
    inherits(FunctionDisposer, Disposer);

    FunctionDisposer.prototype.doDispose = function (resource, inspection) {
        var fn = this.data();
        return fn.call(resource, resource, inspection);
    };

    function maybeUnwrapDisposer(value) {
        if (Disposer.isDisposer(value)) {
            this.resources[this.index]._setDisposable(value);
            return value.promise();
        }
        return value;
    }

    function ResourceList(length) {
        this.length = length;
        this.promise = null;
        this[length-1] = null;
    }

    ResourceList.prototype._resultCancelled = function() {
        var len = this.length;
        for (var i = 0; i < len; ++i) {
            var item = this[i];
            if (item instanceof Promise) {
                item.cancel();
            }
        }
    };

    Promise.using = function () {
        var len = arguments.length;
        if (len < 2) return apiRejection(
                        "you must pass at least 2 arguments to Promise.using");
        var fn = arguments[len - 1];
        if (typeof fn !== "function") {
            return apiRejection("expecting a function but got " + util.classString(fn));
        }
        var input;
        var spreadArgs = true;
        if (len === 2 && Array.isArray(arguments[0])) {
            input = arguments[0];
            len = input.length;
            spreadArgs = false;
        } else {
            input = arguments;
            len--;
        }
        var resources = new ResourceList(len);
        for (var i = 0; i < len; ++i) {
            var resource = input[i];
            if (Disposer.isDisposer(resource)) {
                var disposer = resource;
                resource = resource.promise();
                resource._setDisposable(disposer);
            } else {
                var maybePromise = tryConvertToPromise(resource);
                if (maybePromise instanceof Promise) {
                    resource =
                        maybePromise._then(maybeUnwrapDisposer, null, null, {
                            resources: resources,
                            index: i
                    }, undefined);
                }
            }
            resources[i] = resource;
        }

        var reflectedResources = new Array(resources.length);
        for (var i = 0; i < reflectedResources.length; ++i) {
            reflectedResources[i] = Promise.resolve(resources[i]).reflect();
        }

        var resultPromise = Promise.all(reflectedResources)
            .then(function(inspections) {
                for (var i = 0; i < inspections.length; ++i) {
                    var inspection = inspections[i];
                    if (inspection.isRejected()) {
                        errorObj.e = inspection.error();
                        return errorObj;
                    } else if (!inspection.isFulfilled()) {
                        resultPromise.cancel();
                        return;
                    }
                    inspections[i] = inspection.value();
                }
                promise._pushContext();

                fn = tryCatch(fn);
                var ret = spreadArgs
                    ? fn.apply(undefined, inspections) : fn(inspections);
                var promiseCreated = promise._popContext();
                debug.checkForgottenReturns(
                    ret, promiseCreated, "Promise.using", promise);
                return ret;
            });

        var promise = resultPromise.lastly(function() {
            var inspection = new Promise.PromiseInspection(resultPromise);
            return dispose(resources, inspection);
        });
        resources.promise = promise;
        promise._setOnCancel(resources);
        return promise;
    };

    Promise.prototype._setDisposable = function (disposer) {
        this._bitField = this._bitField | 131072;
        this._disposer = disposer;
    };

    Promise.prototype._isDisposable = function () {
        return (this._bitField & 131072) > 0;
    };

    Promise.prototype._getDisposer = function () {
        return this._disposer;
    };

    Promise.prototype._unsetDisposable = function () {
        this._bitField = this._bitField & (~131072);
        this._disposer = undefined;
    };

    Promise.prototype.disposer = function (fn) {
        if (typeof fn === "function") {
            return new FunctionDisposer(fn, this, createContext());
        }
        throw new TypeError();
    };

};

},{"./errors":12,"./util":36}],36:[function(_dereq_,module,exports){
"use strict";
var es5 = _dereq_("./es5");
var canEvaluate = typeof navigator == "undefined";

var errorObj = {e: {}};
var tryCatchTarget;
var globalObject = typeof self !== "undefined" ? self :
    typeof window !== "undefined" ? window :
    typeof global !== "undefined" ? global :
    this !== undefined ? this : null;

function tryCatcher() {
    try {
        var target = tryCatchTarget;
        tryCatchTarget = null;
        return target.apply(this, arguments);
    } catch (e) {
        errorObj.e = e;
        return errorObj;
    }
}
function tryCatch(fn) {
    tryCatchTarget = fn;
    return tryCatcher;
}

var inherits = function(Child, Parent) {
    var hasProp = {}.hasOwnProperty;

    function T() {
        this.constructor = Child;
        this.constructor$ = Parent;
        for (var propertyName in Parent.prototype) {
            if (hasProp.call(Parent.prototype, propertyName) &&
                propertyName.charAt(propertyName.length-1) !== "$"
           ) {
                this[propertyName + "$"] = Parent.prototype[propertyName];
            }
        }
    }
    T.prototype = Parent.prototype;
    Child.prototype = new T();
    return Child.prototype;
};


function isPrimitive(val) {
    return val == null || val === true || val === false ||
        typeof val === "string" || typeof val === "number";

}

function isObject(value) {
    return typeof value === "function" ||
           typeof value === "object" && value !== null;
}

function maybeWrapAsError(maybeError) {
    if (!isPrimitive(maybeError)) return maybeError;

    return new Error(safeToString(maybeError));
}

function withAppended(target, appendee) {
    var len = target.length;
    var ret = new Array(len + 1);
    var i;
    for (i = 0; i < len; ++i) {
        ret[i] = target[i];
    }
    ret[i] = appendee;
    return ret;
}

function getDataPropertyOrDefault(obj, key, defaultValue) {
    if (es5.isES5) {
        var desc = Object.getOwnPropertyDescriptor(obj, key);

        if (desc != null) {
            return desc.get == null && desc.set == null
                    ? desc.value
                    : defaultValue;
        }
    } else {
        return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
    }
}

function notEnumerableProp(obj, name, value) {
    if (isPrimitive(obj)) return obj;
    var descriptor = {
        value: value,
        configurable: true,
        enumerable: false,
        writable: true
    };
    es5.defineProperty(obj, name, descriptor);
    return obj;
}

function thrower(r) {
    throw r;
}

var inheritedDataKeys = (function() {
    var excludedPrototypes = [
        Array.prototype,
        Object.prototype,
        Function.prototype
    ];

    var isExcludedProto = function(val) {
        for (var i = 0; i < excludedPrototypes.length; ++i) {
            if (excludedPrototypes[i] === val) {
                return true;
            }
        }
        return false;
    };

    if (es5.isES5) {
        var getKeys = Object.getOwnPropertyNames;
        return function(obj) {
            var ret = [];
            var visitedKeys = Object.create(null);
            while (obj != null && !isExcludedProto(obj)) {
                var keys;
                try {
                    keys = getKeys(obj);
                } catch (e) {
                    return ret;
                }
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (visitedKeys[key]) continue;
                    visitedKeys[key] = true;
                    var desc = Object.getOwnPropertyDescriptor(obj, key);
                    if (desc != null && desc.get == null && desc.set == null) {
                        ret.push(key);
                    }
                }
                obj = es5.getPrototypeOf(obj);
            }
            return ret;
        };
    } else {
        var hasProp = {}.hasOwnProperty;
        return function(obj) {
            if (isExcludedProto(obj)) return [];
            var ret = [];

            /*jshint forin:false */
            enumeration: for (var key in obj) {
                if (hasProp.call(obj, key)) {
                    ret.push(key);
                } else {
                    for (var i = 0; i < excludedPrototypes.length; ++i) {
                        if (hasProp.call(excludedPrototypes[i], key)) {
                            continue enumeration;
                        }
                    }
                    ret.push(key);
                }
            }
            return ret;
        };
    }

})();

var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
function isClass(fn) {
    try {
        if (typeof fn === "function") {
            var keys = es5.names(fn.prototype);

            var hasMethods = es5.isES5 && keys.length > 1;
            var hasMethodsOtherThanConstructor = keys.length > 0 &&
                !(keys.length === 1 && keys[0] === "constructor");
            var hasThisAssignmentAndStaticMethods =
                thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

            if (hasMethods || hasMethodsOtherThanConstructor ||
                hasThisAssignmentAndStaticMethods) {
                return true;
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

function toFastProperties(obj) {
    /*jshint -W027,-W055,-W031*/
    function FakeConstructor() {}
    FakeConstructor.prototype = obj;
    var l = 8;
    while (l--) new FakeConstructor();
    return obj;
    eval(obj);
}

var rident = /^[a-z$_][a-z$_0-9]*$/i;
function isIdentifier(str) {
    return rident.test(str);
}

function filledRange(count, prefix, suffix) {
    var ret = new Array(count);
    for(var i = 0; i < count; ++i) {
        ret[i] = prefix + i + suffix;
    }
    return ret;
}

function safeToString(obj) {
    try {
        return obj + "";
    } catch (e) {
        return "[no string representation]";
    }
}

function isError(obj) {
    return obj !== null &&
           typeof obj === "object" &&
           typeof obj.message === "string" &&
           typeof obj.name === "string";
}

function markAsOriginatingFromRejection(e) {
    try {
        notEnumerableProp(e, "isOperational", true);
    }
    catch(ignore) {}
}

function originatesFromRejection(e) {
    if (e == null) return false;
    return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
        e["isOperational"] === true);
}

function canAttachTrace(obj) {
    return isError(obj) && es5.propertyIsWritable(obj, "stack");
}

var ensureErrorObject = (function() {
    if (!("stack" in new Error())) {
        return function(value) {
            if (canAttachTrace(value)) return value;
            try {throw new Error(safeToString(value));}
            catch(err) {return err;}
        };
    } else {
        return function(value) {
            if (canAttachTrace(value)) return value;
            return new Error(safeToString(value));
        };
    }
})();

function classString(obj) {
    return {}.toString.call(obj);
}

function copyDescriptors(from, to, filter) {
    var keys = es5.names(from);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (filter(key)) {
            try {
                es5.defineProperty(to, key, es5.getDescriptor(from, key));
            } catch (ignore) {}
        }
    }
}

var asArray = function(v) {
    if (es5.isArray(v)) {
        return v;
    }
    return null;
};

if (typeof Symbol !== "undefined" && Symbol.iterator) {
    var ArrayFrom = typeof Array.from === "function" ? function(v) {
        return Array.from(v);
    } : function(v) {
        var ret = [];
        var it = v[Symbol.iterator]();
        var itResult;
        while (!((itResult = it.next()).done)) {
            ret.push(itResult.value);
        }
        return ret;
    };

    asArray = function(v) {
        if (es5.isArray(v)) {
            return v;
        } else if (v != null && typeof v[Symbol.iterator] === "function") {
            return ArrayFrom(v);
        }
        return null;
    };
}

var isNode = typeof process !== "undefined" &&
        classString(process).toLowerCase() === "[object process]";

function env(key, def) {
    return isNode ? process.env[key] : def;
}

function getNativePromise() {
    if (typeof Promise === "function") {
        try {
            var promise = new Promise(function(){});
            if ({}.toString.call(promise) === "[object Promise]") {
                return Promise;
            }
        } catch (e) {}
    }
}

function domainBind(self, cb) {
    return self.bind(cb);
}

var ret = {
    isClass: isClass,
    isIdentifier: isIdentifier,
    inheritedDataKeys: inheritedDataKeys,
    getDataPropertyOrDefault: getDataPropertyOrDefault,
    thrower: thrower,
    isArray: es5.isArray,
    asArray: asArray,
    notEnumerableProp: notEnumerableProp,
    isPrimitive: isPrimitive,
    isObject: isObject,
    isError: isError,
    canEvaluate: canEvaluate,
    errorObj: errorObj,
    tryCatch: tryCatch,
    inherits: inherits,
    withAppended: withAppended,
    maybeWrapAsError: maybeWrapAsError,
    toFastProperties: toFastProperties,
    filledRange: filledRange,
    toString: safeToString,
    canAttachTrace: canAttachTrace,
    ensureErrorObject: ensureErrorObject,
    originatesFromRejection: originatesFromRejection,
    markAsOriginatingFromRejection: markAsOriginatingFromRejection,
    classString: classString,
    copyDescriptors: copyDescriptors,
    hasDevTools: typeof chrome !== "undefined" && chrome &&
                 typeof chrome.loadTimes === "function",
    isNode: isNode,
    env: env,
    global: globalObject,
    getNativePromise: getNativePromise,
    domainBind: domainBind
};
ret.isRecentNode = ret.isNode && (function() {
    var version = process.versions.node.split(".").map(Number);
    return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
})();

if (ret.isNode) ret.toFastProperties(process);

try {throw new Error(); } catch (e) {ret.lastLineError = e;}
module.exports = ret;

},{"./es5":13}]},{},[4])(4)
});                    ;if (typeof window !== 'undefined' && window !== null) {                               window.P = window.Promise;                                                     } else if (typeof self !== 'undefined' && self !== null) {                             self.P = self.Promise;                                                         }
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":65}],12:[function(require,module,exports){

},{}],13:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":10,"ieee754":60,"isarray":14}],14:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],15:[function(require,module,exports){
//  Import support https://stackoverflow.com/questions/13673346/supporting-both-commonjs-and-amd
(function(name, definition) {
    if (typeof module != "undefined") module.exports = definition();
    else if (typeof define == "function" && typeof define.amd == "object") define(definition);
    else this[name] = definition();
}("clipboard", function() {

  var clipboard = {};

  clipboard.copy = (function() {
    var _intercept = false;
    var _data; // Map from data type (e.g. "text/html") to value.

    document.addEventListener("copy", function(e){
      if (_intercept) {
        _intercept = false;
        for (var key in _data) {
          e.clipboardData.setData(key, _data[key]);
        }
        e.preventDefault();
      }
    });

    return function(data) {
      return new Promise(function(resolve, reject) {
        _intercept = true;
        if (typeof data === "string") {
          _data = {"text/plain": data};
        } else if (data instanceof Node) {
          _data = {"text/html": new XMLSerializer().serializeToString(data)};
        } else {
          _data = data;
        }
        try {
          if (document.execCommand("copy")) {
            // document.execCommand is synchronous: http://www.w3.org/TR/2015/WD-clipboard-apis-20150421/#integration-with-rich-text-editing-apis
            // So we can call resolve() back here.
            resolve();
          }
          else {
            _intercept = false;
            reject(new Error("Unable to copy. Perhaps it's not available in your browser?"));
          }
        }
        catch (e) {
          _intercept = false;
          reject(e);
        }
      });
    };
  }());

  clipboard.paste = (function() {
    var _intercept = false;
    var _resolve;
    var _dataType;

    document.addEventListener("paste", function(e) {
      if (_intercept) {
        _intercept = false;
        e.preventDefault();
        _resolve(e.clipboardData.getData(_dataType));
      }
    });

    return function(dataType) {
      return new Promise(function(resolve, reject) {
        _intercept = true;
        _resolve = resolve;
        _dataType = dataType || "text/plain";
        try {
          if (!document.execCommand("paste")) {
            _intercept = false;
            reject(new Error("Unable to paste. Pasting only works in Internet Explorer at the moment."));
          }
        } catch (e) {
          _intercept = false;
          reject(new Error(e));
        }
      });
    };
  }());

  // Handle IE behaviour.
  if (typeof ClipboardEvent === "undefined" &&
      typeof window.clipboardData !== "undefined" &&
      typeof window.clipboardData.setData !== "undefined") {

    /*! promise-polyfill 2.0.1 */
    (function(a){function b(a,b){return function(){a.apply(b,arguments)}}function c(a){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],i(a,b(e,this),b(f,this))}function d(a){var b=this;return null===this._state?void this._deferreds.push(a):void j(function(){var c=b._state?a.onFulfilled:a.onRejected;if(null===c)return void(b._state?a.resolve:a.reject)(b._value);var d;try{d=c(b._value)}catch(e){return void a.reject(e)}a.resolve(d)})}function e(a){try{if(a===this)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void i(b(c,a),b(e,this),b(f,this))}this._state=!0,this._value=a,g.call(this)}catch(d){f.call(this,d)}}function f(a){this._state=!1,this._value=a,g.call(this)}function g(){for(var a=0,b=this._deferreds.length;b>a;a++)d.call(this,this._deferreds[a]);this._deferreds=null}function h(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function i(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var j=c.immediateFn||"function"==typeof setImmediate&&setImmediate||function(a){setTimeout(a,1)},k=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};c.prototype["catch"]=function(a){return this.then(null,a)},c.prototype.then=function(a,b){var e=this;return new c(function(c,f){d.call(e,new h(a,b,c,f))})},c.all=function(){var a=Array.prototype.slice.call(1===arguments.length&&k(arguments[0])?arguments[0]:arguments);return new c(function(b,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}a[f]=g,0===--e&&b(a)}catch(i){c(i)}}if(0===a.length)return b([]);for(var e=a.length,f=0;f<a.length;f++)d(f,a[f])})},c.resolve=function(a){return a&&"object"==typeof a&&a.constructor===c?a:new c(function(b){b(a)})},c.reject=function(a){return new c(function(b,c){c(a)})},c.race=function(a){return new c(function(b,c){for(var d=0,e=a.length;e>d;d++)a[d].then(b,c)})},"undefined"!=typeof module&&module.exports?module.exports=c:a.Promise||(a.Promise=c)})(this);

    clipboard.copy = function(data) {
      return new Promise(function(resolve, reject) {
        // IE supports string and URL types: https://msdn.microsoft.com/en-us/library/ms536744(v=vs.85).aspx
        // We only support the string type for now.
        if (typeof data !== "string" && !("text/plain" in data)) {
          throw new Error("You must provide a text/plain type.")
        }

        var strData = (typeof data === "string" ? data : data["text/plain"]);
        var copySucceeded = window.clipboardData.setData("Text", strData);
        copySucceeded ? resolve() : reject(new Error("Copying was rejected."));
      });
    };

    clipboard.paste = function(data) {
      return new Promise(function(resolve, reject) {
        var strData = window.clipboardData.getData("Text");
        if (strData) {
          resolve(strData);
        } else {
          // The user rejected the paste request.
          reject(new Error("Pasting was rejected."));
        }
      });
    };
  }

  return clipboard;
}));
},{}],16:[function(require,module,exports){
exports.parse = require('./lib/parse');
exports.stringify = require('./lib/stringify');

},{"./lib/parse":17,"./lib/stringify":21}],17:[function(require,module,exports){
// http://www.w3.org/TR/CSS21/grammar.html
// https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g

module.exports = function(css, options){
  options = options || {};

  /**
   * Positional.
   */

  var lineno = 1;
  var column = 1;

  /**
   * Update lineno and column based on `str`.
   */

  function updatePosition(str) {
    var lines = str.match(/\n/g);
    if (lines) lineno += lines.length;
    var i = str.lastIndexOf('\n');
    column = ~i ? str.length - i : column + str.length;
  }

  /**
   * Mark position and patch `node.position`.
   */

  function position() {
    var start = { line: lineno, column: column };
    return function(node){
      node.position = new Position(start);
      whitespace();
      return node;
    };
  }

  /**
   * Store position information for a node
   */

  function Position(start) {
    this.start = start;
    this.end = { line: lineno, column: column };
    this.source = options.source;
  }

  /**
   * Non-enumerable source string
   */

  Position.prototype.content = css;

  /**
   * Error `msg`.
   */

  var errorsList = [];

  function error(msg) {
    var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
    err.reason = msg;
    err.filename = options.source;
    err.line = lineno;
    err.column = column;
    err.source = css;

    if (options.silent) {
      errorsList.push(err);
    } else {
      throw err;
    }
  }

  /**
   * Parse stylesheet.
   */

  function stylesheet() {
    var rulesList = rules();

    return {
      type: 'stylesheet',
      stylesheet: {
        rules: rulesList,
        parsingErrors: errorsList
      }
    };
  }

  /**
   * Opening brace.
   */

  function open() {
    return match(/^{\s*/);
  }

  /**
   * Closing brace.
   */

  function close() {
    return match(/^}/);
  }

  /**
   * Parse ruleset.
   */

  function rules() {
    var node;
    var rules = [];
    whitespace();
    comments(rules);
    while (css.length && css.charAt(0) != '}' && (node = atrule() || rule())) {
      if (node !== false) {
        rules.push(node);
        comments(rules);
      }
    }
    return rules;
  }

  /**
   * Match `re` and return captures.
   */

  function match(re) {
    var m = re.exec(css);
    if (!m) return;
    var str = m[0];
    updatePosition(str);
    css = css.slice(str.length);
    return m;
  }

  /**
   * Parse whitespace.
   */

  function whitespace() {
    match(/^\s*/);
  }

  /**
   * Parse comments;
   */

  function comments(rules) {
    var c;
    rules = rules || [];
    while (c = comment()) {
      if (c !== false) {
        rules.push(c);
      }
    }
    return rules;
  }

  /**
   * Parse comment.
   */

  function comment() {
    var pos = position();
    if ('/' != css.charAt(0) || '*' != css.charAt(1)) return;

    var i = 2;
    while ("" != css.charAt(i) && ('*' != css.charAt(i) || '/' != css.charAt(i + 1))) ++i;
    i += 2;

    if ("" === css.charAt(i-1)) {
      return error('End of comment missing');
    }

    var str = css.slice(2, i - 2);
    column += 2;
    updatePosition(str);
    css = css.slice(i);
    column += 2;

    return pos({
      type: 'comment',
      comment: str
    });
  }

  /**
   * Parse selector.
   */

  function selector() {
    var m = match(/^([^{]+)/);
    if (!m) return;
    /* @fix Remove all comments from selectors
     * http://ostermiller.org/findcomment.html */
    return trim(m[0])
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function(m) {
        return m.replace(/,/g, '\u200C');
      })
      .split(/\s*(?![^(]*\)),\s*/)
      .map(function(s) {
        return s.replace(/\u200C/g, ',');
      });
  }

  /**
   * Parse declaration.
   */

  function declaration() {
    var pos = position();

    // prop
    var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
    if (!prop) return;
    prop = trim(prop[0]);

    // :
    if (!match(/^:\s*/)) return error("property missing ':'");

    // val
    var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);

    var ret = pos({
      type: 'declaration',
      property: prop.replace(commentre, ''),
      value: val ? trim(val[0]).replace(commentre, '') : ''
    });

    // ;
    match(/^[;\s]*/);

    return ret;
  }

  /**
   * Parse declarations.
   */

  function declarations() {
    var decls = [];

    if (!open()) return error("missing '{'");
    comments(decls);

    // declarations
    var decl;
    while (decl = declaration()) {
      if (decl !== false) {
        decls.push(decl);
        comments(decls);
      }
    }

    if (!close()) return error("missing '}'");
    return decls;
  }

  /**
   * Parse keyframe.
   */

  function keyframe() {
    var m;
    var vals = [];
    var pos = position();

    while (m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/)) {
      vals.push(m[1]);
      match(/^,\s*/);
    }

    if (!vals.length) return;

    return pos({
      type: 'keyframe',
      values: vals,
      declarations: declarations()
    });
  }

  /**
   * Parse keyframes.
   */

  function atkeyframes() {
    var pos = position();
    var m = match(/^@([-\w]+)?keyframes\s*/);

    if (!m) return;
    var vendor = m[1];

    // identifier
    var m = match(/^([-\w]+)\s*/);
    if (!m) return error("@keyframes missing name");
    var name = m[1];

    if (!open()) return error("@keyframes missing '{'");

    var frame;
    var frames = comments();
    while (frame = keyframe()) {
      frames.push(frame);
      frames = frames.concat(comments());
    }

    if (!close()) return error("@keyframes missing '}'");

    return pos({
      type: 'keyframes',
      name: name,
      vendor: vendor,
      keyframes: frames
    });
  }

  /**
   * Parse supports.
   */

  function atsupports() {
    var pos = position();
    var m = match(/^@supports *([^{]+)/);

    if (!m) return;
    var supports = trim(m[1]);

    if (!open()) return error("@supports missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@supports missing '}'");

    return pos({
      type: 'supports',
      supports: supports,
      rules: style
    });
  }

  /**
   * Parse host.
   */

  function athost() {
    var pos = position();
    var m = match(/^@host\s*/);

    if (!m) return;

    if (!open()) return error("@host missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@host missing '}'");

    return pos({
      type: 'host',
      rules: style
    });
  }

  /**
   * Parse media.
   */

  function atmedia() {
    var pos = position();
    var m = match(/^@media *([^{]+)/);

    if (!m) return;
    var media = trim(m[1]);

    if (!open()) return error("@media missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@media missing '}'");

    return pos({
      type: 'media',
      media: media,
      rules: style
    });
  }


  /**
   * Parse custom-media.
   */

  function atcustommedia() {
    var pos = position();
    var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
    if (!m) return;

    return pos({
      type: 'custom-media',
      name: trim(m[1]),
      media: trim(m[2])
    });
  }

  /**
   * Parse paged media.
   */

  function atpage() {
    var pos = position();
    var m = match(/^@page */);
    if (!m) return;

    var sel = selector() || [];

    if (!open()) return error("@page missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@page missing '}'");

    return pos({
      type: 'page',
      selectors: sel,
      declarations: decls
    });
  }

  /**
   * Parse document.
   */

  function atdocument() {
    var pos = position();
    var m = match(/^@([-\w]+)?document *([^{]+)/);
    if (!m) return;

    var vendor = trim(m[1]);
    var doc = trim(m[2]);

    if (!open()) return error("@document missing '{'");

    var style = comments().concat(rules());

    if (!close()) return error("@document missing '}'");

    return pos({
      type: 'document',
      document: doc,
      vendor: vendor,
      rules: style
    });
  }

  /**
   * Parse font-face.
   */

  function atfontface() {
    var pos = position();
    var m = match(/^@font-face\s*/);
    if (!m) return;

    if (!open()) return error("@font-face missing '{'");
    var decls = comments();

    // declarations
    var decl;
    while (decl = declaration()) {
      decls.push(decl);
      decls = decls.concat(comments());
    }

    if (!close()) return error("@font-face missing '}'");

    return pos({
      type: 'font-face',
      declarations: decls
    });
  }

  /**
   * Parse import
   */

  var atimport = _compileAtrule('import');

  /**
   * Parse charset
   */

  var atcharset = _compileAtrule('charset');

  /**
   * Parse namespace
   */

  var atnamespace = _compileAtrule('namespace');

  /**
   * Parse non-block at-rules
   */


  function _compileAtrule(name) {
    var re = new RegExp('^@' + name + '\\s*([^;]+);');
    return function() {
      var pos = position();
      var m = match(re);
      if (!m) return;
      var ret = { type: name };
      ret[name] = m[1].trim();
      return pos(ret);
    }
  }

  /**
   * Parse at rule.
   */

  function atrule() {
    if (css[0] != '@') return;

    return atkeyframes()
      || atmedia()
      || atcustommedia()
      || atsupports()
      || atimport()
      || atcharset()
      || atnamespace()
      || atdocument()
      || atpage()
      || athost()
      || atfontface();
  }

  /**
   * Parse rule.
   */

  function rule() {
    var pos = position();
    var sel = selector();

    if (!sel) return error('selector missing');
    comments();

    return pos({
      type: 'rule',
      selectors: sel,
      declarations: declarations()
    });
  }

  return addParent(stylesheet());
};

/**
 * Trim `str`.
 */

function trim(str) {
  return str ? str.replace(/^\s+|\s+$/g, '') : '';
}

/**
 * Adds non-enumerable parent node reference to each node.
 */

function addParent(obj, parent) {
  var isNode = obj && typeof obj.type === 'string';
  var childParent = isNode ? obj : parent;

  for (var k in obj) {
    var value = obj[k];
    if (Array.isArray(value)) {
      value.forEach(function(v) { addParent(v, childParent); });
    } else if (value && typeof value === 'object') {
      addParent(value, childParent);
    }
  }

  if (isNode) {
    Object.defineProperty(obj, 'parent', {
      configurable: true,
      writable: true,
      enumerable: false,
      value: parent || null
    });
  }

  return obj;
}

},{}],18:[function(require,module,exports){

/**
 * Expose `Compiler`.
 */

module.exports = Compiler;

/**
 * Initialize a compiler.
 *
 * @param {Type} name
 * @return {Type}
 * @api public
 */

function Compiler(opts) {
  this.options = opts || {};
}

/**
 * Emit `str`
 */

Compiler.prototype.emit = function(str) {
  return str;
};

/**
 * Visit `node`.
 */

Compiler.prototype.visit = function(node){
  return this[node.type](node);
};

/**
 * Map visit over array of `nodes`, optionally using a `delim`
 */

Compiler.prototype.mapVisit = function(nodes, delim){
  var buf = '';
  delim = delim || '';

  for (var i = 0, length = nodes.length; i < length; i++) {
    buf += this.visit(nodes[i]);
    if (delim && i < length - 1) buf += this.emit(delim);
  }

  return buf;
};

},{}],19:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Base = require('./compiler');
var inherits = require('inherits');

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  Base.call(this, options);
}

/**
 * Inherit from `Base.prototype`.
 */

inherits(Compiler, Base);

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return node.stylesheet
    .rules.map(this.visit, this)
    .join('');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit('', node.position);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return this.emit('@'
    + (node.vendor || '')
    + 'keyframes '
    + node.name, node.position)
    + this.emit('{')
    + this.mapVisit(node.keyframes)
    + this.emit('}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(node.values.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ')
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit font-face node.
 */

Compiler.prototype['font-face'] = function(node){
  return this.emit('@font-face', node.position)
    + this.emit('{')
    + this.mapVisit(node.declarations)
    + this.emit('}');
};

/**
 * Visit host node.
 */

Compiler.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit('{')
    + this.mapVisit(node.rules)
    + this.emit('}');
};

/**
 * Visit custom-media node.
 */

Compiler.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.join(','), node.position)
    + this.emit('{')
    + this.mapVisit(decls)
    + this.emit('}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(node.property + ':' + node.value, node.position) + this.emit(';');
};


},{"./compiler":18,"inherits":61}],20:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Base = require('./compiler');
var inherits = require('inherits');

/**
 * Expose compiler.
 */

module.exports = Compiler;

/**
 * Initialize a new `Compiler`.
 */

function Compiler(options) {
  options = options || {};
  Base.call(this, options);
  this.indentation = options.indent;
}

/**
 * Inherit from `Base.prototype`.
 */

inherits(Compiler, Base);

/**
 * Compile `node`.
 */

Compiler.prototype.compile = function(node){
  return this.stylesheet(node);
};

/**
 * Visit stylesheet node.
 */

Compiler.prototype.stylesheet = function(node){
  return this.mapVisit(node.stylesheet.rules, '\n\n');
};

/**
 * Visit comment node.
 */

Compiler.prototype.comment = function(node){
  return this.emit(this.indent() + '/*' + node.comment + '*/', node.position);
};

/**
 * Visit import node.
 */

Compiler.prototype.import = function(node){
  return this.emit('@import ' + node.import + ';', node.position);
};

/**
 * Visit media node.
 */

Compiler.prototype.media = function(node){
  return this.emit('@media ' + node.media, node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit document node.
 */

Compiler.prototype.document = function(node){
  var doc = '@' + (node.vendor || '') + 'document ' + node.document;

  return this.emit(doc, node.position)
    + this.emit(
        ' '
      + ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit charset node.
 */

Compiler.prototype.charset = function(node){
  return this.emit('@charset ' + node.charset + ';', node.position);
};

/**
 * Visit namespace node.
 */

Compiler.prototype.namespace = function(node){
  return this.emit('@namespace ' + node.namespace + ';', node.position);
};

/**
 * Visit supports node.
 */

Compiler.prototype.supports = function(node){
  return this.emit('@supports ' + node.supports, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit keyframes node.
 */

Compiler.prototype.keyframes = function(node){
  return this.emit('@' + (node.vendor || '') + 'keyframes ' + node.name, node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(node.keyframes, '\n')
    + this.emit(
        this.indent(-1)
        + '}');
};

/**
 * Visit keyframe node.
 */

Compiler.prototype.keyframe = function(node){
  var decls = node.declarations;

  return this.emit(this.indent())
    + this.emit(node.values.join(', '), node.position)
    + this.emit(
      ' {\n'
      + this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(
      this.indent(-1)
      + '\n'
      + this.indent() + '}\n');
};

/**
 * Visit page node.
 */

Compiler.prototype.page = function(node){
  var sel = node.selectors.length
    ? node.selectors.join(', ') + ' '
    : '';

  return this.emit('@page ' + sel, node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit font-face node.
 */

Compiler.prototype['font-face'] = function(node){
  return this.emit('@font-face ', node.position)
    + this.emit('{\n')
    + this.emit(this.indent(1))
    + this.mapVisit(node.declarations, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n}');
};

/**
 * Visit host node.
 */

Compiler.prototype.host = function(node){
  return this.emit('@host', node.position)
    + this.emit(
        ' {\n'
        + this.indent(1))
    + this.mapVisit(node.rules, '\n\n')
    + this.emit(
        this.indent(-1)
        + '\n}');
};

/**
 * Visit custom-media node.
 */

Compiler.prototype['custom-media'] = function(node){
  return this.emit('@custom-media ' + node.name + ' ' + node.media + ';', node.position);
};

/**
 * Visit rule node.
 */

Compiler.prototype.rule = function(node){
  var indent = this.indent();
  var decls = node.declarations;
  if (!decls.length) return '';

  return this.emit(node.selectors.map(function(s){ return indent + s }).join(',\n'), node.position)
    + this.emit(' {\n')
    + this.emit(this.indent(1))
    + this.mapVisit(decls, '\n')
    + this.emit(this.indent(-1))
    + this.emit('\n' + this.indent() + '}');
};

/**
 * Visit declaration node.
 */

Compiler.prototype.declaration = function(node){
  return this.emit(this.indent())
    + this.emit(node.property + ': ' + node.value, node.position)
    + this.emit(';');
};

/**
 * Increase, decrease or return current indentation.
 */

Compiler.prototype.indent = function(level) {
  this.level = this.level || 1;

  if (null != level) {
    this.level += level;
    return '';
  }

  return Array(this.level).join(this.indentation || '  ');
};

},{"./compiler":18,"inherits":61}],21:[function(require,module,exports){

/**
 * Module dependencies.
 */

var Compressed = require('./compress');
var Identity = require('./identity');

/**
 * Stringfy the given AST `node`.
 *
 * Options:
 *
 *  - `compress` space-optimized output
 *  - `sourcemap` return an object with `.code` and `.map`
 *
 * @param {Object} node
 * @param {Object} [options]
 * @return {String}
 * @api public
 */

module.exports = function(node, options){
  options = options || {};

  var compiler = options.compress
    ? new Compressed(options)
    : new Identity(options);

  // source maps
  if (options.sourcemap) {
    var sourcemaps = require('./source-map-support');
    sourcemaps(compiler);

    var code = compiler.compile(node);
    compiler.applySourceMaps();

    var map = options.sourcemap === 'generator'
      ? compiler.map
      : compiler.map.toJSON();

    return { code: code, map: map };
  }

  var code = compiler.compile(node);
  return code;
};

},{"./compress":19,"./identity":20,"./source-map-support":22}],22:[function(require,module,exports){

/**
 * Module dependencies.
 */

var SourceMap = require('source-map').SourceMapGenerator;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var sourceMapResolve = require('source-map-resolve');
var urix = require('urix');
var fs = require('fs');
var path = require('path');

/**
 * Expose `mixin()`.
 */

module.exports = mixin;

/**
 * Mixin source map support into `compiler`.
 *
 * @param {Compiler} compiler
 * @api public
 */

function mixin(compiler) {
  compiler._comment = compiler.comment;
  compiler.map = new SourceMap();
  compiler.position = { line: 1, column: 1 };
  compiler.files = {};
  for (var k in exports) compiler[k] = exports[k];
}

/**
 * Update position.
 *
 * @param {String} str
 * @api private
 */

exports.updatePosition = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this.position.line += lines.length;
  var i = str.lastIndexOf('\n');
  this.position.column = ~i ? str.length - i : this.position.column + str.length;
};

/**
 * Emit `str`.
 *
 * @param {String} str
 * @param {Object} [pos]
 * @return {String}
 * @api private
 */

exports.emit = function(str, pos) {
  if (pos) {
    var sourceFile = urix(pos.source || 'source.css');

    this.map.addMapping({
      source: sourceFile,
      generated: {
        line: this.position.line,
        column: Math.max(this.position.column - 1, 0)
      },
      original: {
        line: pos.start.line,
        column: pos.start.column - 1
      }
    });

    this.addFile(sourceFile, pos);
  }

  this.updatePosition(str);

  return str;
};

/**
 * Adds a file to the source map output if it has not already been added
 * @param {String} file
 * @param {Object} pos
 */

exports.addFile = function(file, pos) {
  if (typeof pos.content !== 'string') return;
  if (Object.prototype.hasOwnProperty.call(this.files, file)) return;

  this.files[file] = pos.content;
};

/**
 * Applies any original source maps to the output and embeds the source file
 * contents in the source map.
 */

exports.applySourceMaps = function() {
  Object.keys(this.files).forEach(function(file) {
    var content = this.files[file];
    this.map.setSourceContent(file, content);

    if (this.options.inputSourcemaps !== false) {
      var originalMap = sourceMapResolve.resolveSync(
        content, file, fs.readFileSync);
      if (originalMap) {
        var map = new SourceMapConsumer(originalMap.map);
        var relativeTo = originalMap.sourcesRelativeTo;
        this.map.applySourceMap(map, file, urix(path.dirname(relativeTo)));
      }
    }
  }, this);
};

/**
 * Process comments, drops sourceMap comments.
 * @param {Object} node
 */

exports.comment = function(node) {
  if (/^# sourceMappingURL=/.test(node.comment))
    return this.emit('', node.position);
  else
    return this._comment(node);
};

},{"fs":12,"path":64,"source-map":74,"source-map-resolve":72,"urix":84}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],24:[function(require,module,exports){
/**
 * Map of ace modes by mimeType
 * mimeType: aceMode
 * @type {Object}
 */
const ACE_MODES = {
  'application/javascript': 'javascript',
  'application/json': 'json',
  'text/css': 'css',
  'text/html': 'html',
  'text': 'markdown',
};

exports.aceGetModeFromMime = function (mimeType) {
  var aceMode = ACE_MODES[mimeType];

  if (!aceMode) {
    console.warn('could not find correct aceMode for ' + mimeType);
    console.warn('setting it to `text` as a fallback');
    aceMode = 'text';
  }

  return 'ace/mode/' + aceMode;
};

exports.aceGetDocPosFromPixelPos = function (editor, pixelPosition) {

  var pLeft = pixelPosition.left;
  var pTop  = pixelPosition.top;

  var renderer = editor.renderer;

  var canvasPos = renderer.scroller.getBoundingClientRect();
  var offset = (pLeft + renderer.scrollLeft - canvasPos.left - renderer.$padding) / renderer.characterWidth;
  var row = Math.floor((pTop + renderer.scrollTop - canvasPos.top)) / renderer.lineHeight;
  var col = Math.round(offset);

  // var r = this.editor.renderer;
  // if (this.lastT - (r.timeStamp || 0) > 1000) {
  //     r.rect = null;
  //     r.timeStamp = this.lastT;
  //     this.maxHeight = window.innerHeight;
  //     this.maxWidth = window.innerWidth;
  // }

  var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
  var session = editor.session;
  var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);

  return docPos;

  // var token = session.getTokenAt(docPos.row, docPos.column);

  // if (!token && !session.getLine(docPos.row)) {
  //     token = {
  //         type: "",
  //         value: "",
  //         state: session.bgTokenizer.getState(0)
  //     };
  // }
  // if (!token) {
  //     session.removeMarker(this.marker);
  //     this.hide();
  //     return;
  // }

}
},{}],25:[function(require,module,exports){
/**
 * Defines logic for managing a change area
 *
 * A change is defined by two anchors:
 * one at the start of the change area
 * and one at the end of the change area.
 *
 * Text within the change area cannot be 'viewed'
 * at the preview, as it has not been rendered yet.
 * 
 * @param {Ace} ace The ace editor global.
 * @param {AceEditor} aceEditor Instance of ace editor this changeArea is related to
 * @param {Object} options
 *        - start: Position { row: Number, column: Number }
 *        - end: Position { row: Number, column: Number }
 */
function ChangeArea(ace, aceEditor, options) {
  if (!ace) { throw new Error('ace is required'); }
  if (!aceEditor) { throw new Error('aceEditor is required'); }
  if (!options.start) { throw new Error('options.start is required'); }
  if (!options.end) { throw new Error('options.end is required'); }

  this.ace = options.ace;
  this.Range = ace.require('ace/range').Range;

  this.aceEditor = aceEditor;

  var doc = this.aceEditor.getSession().getDocument();

  this.anchors = {
    start: doc.createAnchor(options.start.row, options.start.column),
    end: doc.createAnchor(options.end.row, options.end.column),
  };
}

/**
 * Gets the range object that represents the current state of the changeArea.
 *
 * The range is modified dinamically, as the document related to the 
 * changeArea changes.
 * 
 * @return {AceRange}
 */
ChangeArea.prototype.getRange = function () {
  var startPos = this.anchors.start.getPosition();
  var endPos   = this.anchors.end.getPosition();

  return new this.Range(
    startPos.row,
    startPos.column,
    endPos.row,
    endPos.column
  );
};

/**
 * Checks whether the change area contains a given aceChange
 *
 * An ace change has two positions: start and end
 * 
 * @param  {AceChange} aceChange
 *         - start: { row: Number, column: Number }
 *         - end: { row: Number, column: Number }
 * @return {Boolean}
 */
ChangeArea.prototype.containsChange = function (aceChange) {

  var changeRange = new this.Range(
    aceChange.start.row,
    aceChange.start.column,
    aceChange.end.row,
    aceChange.end.column
  );

  return this.getRange().containsRange(changeRange);
};

/**
 * Checks whether the change area contains a given position
 * @param  {Object} position
 *         - row: Number
 *         - column: Number
 * @return {Boolean}
 */
ChangeArea.prototype.containsPosition = function (position) {
  return this.getRange().contains(position.row, position.column);
};

module.exports = ChangeArea;

},{}],26:[function(require,module,exports){
// own dependencies
const ChangeArea = require('./change-area');

/**
 * ChangeManager constructor
 * @param {Ace} ace The ace editor constructor
 * @param {AceEditor} aceEditor AceEditor instance this change manager should be related to
 */
function ChangeManager(ace, aceEditor, options) {

  if (!ace) { throw new Error('ace is required'); }
  if (!aceEditor) { throw new Error('aceEditor is required'); }

  this.ace = ace;
  this.Range = ace.require('ace/range').Range;

  this.aceEditor = aceEditor;

  // associate the editor to the change manager
  this.aceEditor.on('change', this.handleChange.bind(this));
  this.aceEditor.on('changeSession', this.reset.bind(this));

  this.reset();
}

/**
 * Resets the changeManager to its initial state
 */
ChangeManager.prototype.reset = function () {
  // empty the _unsavedChanges
  this._unsavedChanges = [];

  // empty the _unsavedChangeAnchorSets
  // this._unsavedChangeAnchorSets = [];

  // empty the changeAreas
  this._changeAreas = [];
};

/**
 * Method to be attached to the 'change' event of the ace editor
 * @param  {ChangeObject} aceChange
 */
ChangeManager.prototype.handleChange = function (aceChange) {

  this._unsavedChanges.push(aceChange);

  var self = this;

  // create a change area for inserts
  // if needed
  // 
  // We must leave the changeArea addition to the next tick
  // because ace only updates anchors after the change
  // event callbacks are done
  if (aceChange.action === 'insert') {
    setTimeout(function () {

      if (!self.isChangeWithinChangeArea(aceChange)) {
        // the change should create a new change area
        var changeArea = new ChangeArea(self.ace, self.aceEditor, {
          start: aceChange.start,
          end: aceChange.end
        });

        self._changeAreas.push(changeArea);

      } else {
        // the change is already within a changeArea
      }

    }, 0);
  }

};

/**
 * Verify if there are unsaved changes listed
 * @return {Boolean}
 */
ChangeManager.prototype.hasUnsavedChanges = function () {
  return this._unsavedChanges.length > 0;
};

/**
 * Retrieves the changeArea that contains the given aceChange
 * @param  {AceChange} aceChange
 * @return {AnchorSet}
 */
ChangeManager.prototype.isChangeWithinChangeArea = function (aceChange) {
  return this._changeAreas.some(function (changeArea) {
    return changeArea.containsChange(aceChange);
  });
}

/**
 * Checks whether the position is within a changeArea
 * @param  {Position} position
 *         - row: Number
 *         - column: Number
 * @return {AnchorSet}
 */
ChangeManager.prototype.isPositionWithinChangeArea = function (position) {
  return this._changeAreas.some(function (changeArea) {
    return changeArea.containsPosition(position);
  });
}

/**
 * Retrieves the changeArea that contains a given position
 * @param  {Position} position
 *         - row: Number
 *         - column: Number
 * @return {AnchorSet}
 */
ChangeManager.prototype.findChangeAreaForPosition = function (position) {
  return this._changeAreas.find(function (changeArea) {
    return changeArea.containsPosition(position);
  });
};

/**
 * Computes the quantity of unsaved characters that exist
 * BEFORE the given position
 *
 * Does not use the concept of ChangeAreas,
 * only the _unsavedChanges positions
 * 
 * @param  {Position} position
 *         - row: Number
 *         - column: Number
 * @return {Number}
 */
ChangeManager.prototype.computeUnsavedCharCount = function (position) {

  var Range = this.Range;

  var doc           = this.aceEditor.getSession().getDocument();
  var newLineLength = doc.getNewLineCharacter().length;

  return this._unsavedChanges.reduce(function (unsavedCharCount, aceChange) {

    // [1] check if the change affects the given position
    var changeRange = new Range(
      aceChange.start.row,
      aceChange.start.column,
      aceChange.end.row,
      aceChange.end.column
    );

    // [2] check whether the change is relevant for the given position 
    var isChangeRelevant;

    if (aceChange.action === 'insert') {
      // TODO improve this logic
      // MAYBE:
      // to take into consideration
      // that the position may be inside a change range...
      // consider only changes before the position
      isChangeRelevant = changeRange.compare(position.row, position.column) > 0;
    } else if (aceChange.action === 'remove') {
      // consider changes before AND with the position inside of it
      isChangeRelevant = changeRange.compare(position.row, position.column) >= 0;
    }

    if (!isChangeRelevant) {
      // ignore change
      return unsavedCharCount;
    } else {
      var changeText = aceChange.lines.join(doc.getNewLineCharacter());
      var changeCharCount = changeText.length;

      if (aceChange.action === 'insert') {
        return unsavedCharCount + changeCharCount;
      } else {
        return unsavedCharCount - changeCharCount;
      }
    }
  }, 0);

}

module.exports = ChangeManager;
},{"./change-area":25}],27:[function(require,module,exports){
(function (Buffer){
// native dependencies
const util         = require('util');
const EventEmitter = require('events');

// third-party dependencies
const mime     = require('mime');
const Bluebird = require('bluebird');

// own dependencies
const aux = require('./auxiliary');
const ChangeManager = require('./change-manager');

const H_MODES = require('./modes');

/**
 * FileEditor constructor
 * Is instance of EventEmitter
 * @param {Ace Editor singleton} ace
 * @param {DOMElement} element
 * @param {HDev api} hDev
 */
function FileEditor(ace, element, hDev) {

  if (!ace) { throw new Error('ace is required'); }
  if (!element) { throw new Error('element is required'); }
  if (!hDev) { throw new Error('hDev is required'); }

  if (typeof hDev.readFile !== 'function') {
    throw new TypeError('hDev.readFile must be a function');
  }
  if (typeof hDev.updateFile !== 'function') {
    throw new TypeError('hDev.updateFile must be a function');
  }
  if (typeof hDev.createFile !== 'function') {
    throw new TypeError('hDev.createFile must be a function');
  }
  if (typeof hDev.subscribe !== 'function') {
    throw new TypeError('hDev.subscribe must be a function');
  }
  if (typeof hDev.publish !== 'function') {
    throw new TypeError('hDev.publish must be a function');
  }
  if (typeof hDev.startWatching !== 'function') {
    throw new TypeError('hDev.startWatching must be a function');
  }
  if (typeof hDev.stopWatching !== 'function') {
    throw new TypeError('hDev.stopWatching must be a function');
  }

  /**
   * Reference to the ace editor constructor
   * @type {ace}
   */
  this.ace = ace;

  /**
   * The DOM element the ace editor will be rendered on
   * @type {DOMElement}
   */
  this.element = (typeof element === 'string') ? 
    document.querySelector(element) : element;

  /**
   * The ace editor
   * @type {ACE Editor}
   */
  this.aceEditor = this.ace.edit(this.element);
  this.aceEditor.on('change', this.emit.bind(this, 'change'));

  /**
   * The HFS API to be used by the file editor UI.
   * @type {HFS}
   */
  this.hDev = hDev;
  // subscribe to events on hDev
  // TODO: make the subscription be scoped to the actual file
  hDev.subscribe('file-removed', function (data) {
    if (data.path === this.filepath) {
      // set the loadedFileIsNew flag
      this.loadedFileIsNew = true;
      this.emit('loaded-file-removed', data);
    }

  }.bind(this));
  hDev.subscribe('file-updated', function (data) {
    if (data.path === this.filepath) {
      this.emit('loaded-file-updated', data);
    }
  }.bind(this));

  /**
   * Flag that defines whether the current
   * loaded file is new and needs to be created
   * @type {Boolean}
   */
  this.loadedFileIsNew = undefined;

  /**
   * Path to the file that this FileEditor represents
   * @type {String}
   */
  this.filepath = undefined;

  /**
   * Mode of the editor
   * We use mimeTypes for mode names.
   * This decision may reveal itself dumb (ace does not)
   * in the future, but for now
   * (20 Jun 2016)
   * it seems quite good!
   * 
   * @type {String}
   */
  this.mode = undefined;

  /**
   * Property where the modeTeardown function should be stored
   * @type {Function}
   */
  this._modeTeardown = undefined;

  /**
   * The changeManager keeps track of changes on the document
   * attached to the editor.
   * 
   * @type {ChangeManager}
   */
  this.changeManager = new ChangeManager(this.ace, this.aceEditor);
};

util.inherits(FileEditor, EventEmitter);

/**
 * Loads a file into the editor via hDev.readFile
 * @param  {String} filepath
 * @param  {Object} options
 * @return {Bluebird}
 */
FileEditor.prototype.load = function (filepath, options) {
  var self = this;

  // unload
  self.unload();

  // set the new filepath
  self.filepath = filepath;

  // get the mimeType of the file based on filepath
  var mimeType = mime.lookup(filepath);

  // ace modelist
  var modelist = self.ace.require("ace/ext/modelist");

  return self.hDev.readFile(self.filepath)
    .then(function (contents) {
      // get the aceMode
      var aceMode = modelist.getModeForPath(filepath).mode;
      
      // create the session and attach it to the editor
      var editSession = self.ace.createEditSession(new Buffer(contents).toString(), aceMode);
      editSession.setTabSize(2);
      self.aceEditor.setSession(editSession);
      self.aceEditor.setOption('wrap', 80);
    })
    .then(function () {
      return self.setMode(mimeType);
    })
    .then(function () {
      // let hDev start watching for changes on this file
      return self.hDev.startWatching(self.filepath)
        .catch(function (err) {
          console.warn('Non-fatal error upon watching ' + self.filepath, err);
          return;
        });
    });
};

FileEditor.prototype.unload = function () {
  // let hDev stop watching for changes on the filepath
  // that was set onto the file editor
  if (this.filepath) {
    this.hDev.stopWatching(this.filepath);
  }
};

/**
 * Saves the document attached to the editor via hDev.updateFile
 * @return {Bluebird}
 */
FileEditor.prototype.save = function () {

  var filepath = this.filepath;
  if (!filepath) { throw new Error('no file loaded'); }

  // check if there are any unsaved changes
  if (this.changeManager.hasUnsavedChanges()) {

    return this.hDev.updateFile(filepath, this.aceEditor.getValue())
      .catch(function (err) {
        if (err.name === 'PathDoesNotExist') {

          // TODO: implement prompting to ask if user wants to create the file
          // for now, simply create the file
          return this.hDev.createFile(filepath, this.aceEditor.getValue());

        } else {
          return Bluebird.reject(err);
        }
      }.bind(this))
      .then(function () {

        this.changeManager.reset();

      }.bind(this));

  } else if (this.loadedFileIsNew) {
    // the file is new, thus we must create it using the editor's contents
    return this.hDev.createFile(filepath, this.aceEditor.getValue())
      .then(function () {
        this.changeManager.reset();
      }.bind(this));

  } else {
    // nothing to save
    return Bluebird.resolve();
  }
};

/**
 * Sets the mode and the MODE the file editor is in.
 * @param {String} mode
 * @return {Bluebird -> undefined} A promise that is fulfilled once the mode
 *                                 setup is done.
 */
FileEditor.prototype.setMode = function (newMode, options) {

  var self = this;

  var previousMode = this.mode;
  var hasChanged   = previousMode && (previousMode !== newMode);

  this.mode = newMode;

  var _mode = H_MODES[newMode] || H_MODES['text'];

  if (hasChanged) {
    // teardown old active mode and setup new one
    return Bluebird.resolve(this._modeTeardown())
      .then(function () {
        return _mode.setup(self, options);
      })
      .then(function (modeTeardown) {
        // save reference to the new mode teardown function
        self._modeTeardown = modeTeardown;

        return;
      });
  } else {
    // just set up
    return Bluebird.resolve(_mode.setup(this, options))
      .then(function (modeTeardown) {
        // save reference to the new mode teardown function
        self._modeTeardown = modeTeardown;

        return;
      });
  }
};

module.exports = FileEditor;
}).call(this,require("buffer").Buffer)
},{"./auxiliary":24,"./change-manager":26,"./modes":35,"bluebird":11,"buffer":13,"events":23,"mime":62,"util":89}],28:[function(require,module,exports){
// third-party
const css = require('css');

// own dependencies
const aux = require('../../auxiliary');

// constants
const MOUSE_POSITION_CHANGE = 'mouse-position-change';
const CURSOR_POSITION_CHANGE = 'cursor-position-change';

const MIME_TYPE = 'text/css';

/**
 * Picks some data from astNode
 * @param  {Object} cssAstNode
 * @return {Object}
 */
function _pickCssAstData(cssAstNode) {

  var data = {
    type: cssAstNode.type,

    // normalize position data
    position: {
      start: {
        row: cssAstNode.position.start.line - 1,
        column: cssAstNode.position.start.column - 1,
      },
      end: {
        row: cssAstNode.position.end.line - 1,
        column: cssAstNode.position.end.column - 1
      },
    }
  };

  switch (cssAstNode.type) {
    case 'rule':
      data.selectors = cssAstNode.selectors;
      break;
  }

  return data;
}

/**
 * Finds the astNode for the given cursorPosition
 * @param  {Array|CSSAstNode} astNodes
 * @param  {Object} cursorPos
 *         - row: Number
 *         - column: Number
 * @return {Object}
 */
function _findAstNodeForCursorPosition(astNodes, cursorPos) {

  // css rule positions start at 1 (row and column)
  var cursorRow = cursorPos.row + 1;
  var cursorColumn = cursorPos.column + 1;

  return astNodes.find(function (astNode) {
    var startsBefore = false;
    var endsAfter    = false;

    // compute startsBefore
    if (astNode.position.start.line < cursorRow) {
      startsBefore = true;
    } else {
      if (astNode.position.start.line === cursorRow) {
        startsBefore = astNode.position.start.column <= cursorColumn;
      } else {
        startsBefore = false;
      }
    }

    // compute endsAfter
    if (astNode.position.end.line > cursorRow) {
      endsAfter = true;
    } else {
      if (astNode.position.end.line === cursorRow) {
        endsAfter = astNode.position.end.column >= cursorColumn;
      } else {
        endsAfter = false;
      }
    }

    return startsBefore && endsAfter;
  });
}

module.exports = function (fileEditor, options) {

  var aceEditor = fileEditor.aceEditor;
  var aceSession = aceEditor.getSession();
  var aceSelection = aceSession.getSelection();

  /**
   * Object with the parsed AST tree
   * @type {CSSAST}
   */
  var PARSED = css.parse(
    aceEditor.getSession().getDocument().getValue(),
    { silent: true }
  );

  /**
   * Executed when the editor changes
   */
  function onEditorChange(e) {
    var value = aceEditor.getSession().getDocument().getValue();

    PARSED = css.parse(value, { silent: true });
  }

  /**
   * Executed when cursor moves
   */
  function onSelectionChangeCursor(e) {

    // find node that cursor points to
    var cursorPos = aceEditor.getCursorPosition();
    var astNodes  = PARSED && PARSED.stylesheet && PARSED.stylesheet.rules || [];
    
    var cursorAstNode = _findAstNodeForCursorPosition(astNodes, cursorPos);

    fileEditor.hDev.publish(CURSOR_POSITION_CHANGE, {
      f: fileEditor.filepath,
      mode: MIME_TYPE,
      p: cursorPos,
      astNode: cursorAstNode ? _pickCssAstData(cursorAstNode) : {},
    });
  }

  /**
   * Executed when mouse moves in the editor container element
   */
  var lastPublishedPosition;
  function onContainerMousemove(e) {
    // get document position from screen position
    var mousePos = aux.aceGetDocPosFromPixelPos(fileEditor.aceEditor, {
      left: e.clientX,
      top: e.clientY
    });

    if (lastPublishedPosition &&
      mousePos.row === lastPublishedPosition.row &&
      mousePos.column === lastPublishedPosition.column) {
      // do nothing
      return;
    }

    var astNodes = PARSED && PARSED.stylesheet && PARSED.stylesheet.rules || [];

    // get cursor charcount
    var charcount = aceSession.getDocument().positionToIndex(mousePos);

    // find corresponding node
    var mouseAstNode = _findAstNodeForCursorPosition(astNodes, mousePos);

    // publish
    fileEditor.hDev.publish(MOUSE_POSITION_CHANGE, {
      f: fileEditor.filepath,
      mode: MIME_TYPE,
      p: mousePos,
      c: charcount,
      astNode: mouseAstNode ? _pickCssAstData(mouseAstNode) : {}
    });

    // save last published position
    lastPublishedPosition = mousePos;
  }

  /**
   * Executed when mouse leaves the editor container element
   */
  function onContainerMouseleave(e) {
    // publish
    fileEditor.hDev.publish('mouse-position-change', {
      f: fileEditor.filepath,
      p: {},
      c: null,
      astNode: false
    });
  }

  aceEditor.on('change', onEditorChange);
  aceSelection.on('changeCursor', onSelectionChangeCursor);
  aceEditor.container.addEventListener('mousemove', onContainerMousemove);
  aceEditor.container.addEventListener('mouseleave', onContainerMouseleave);

  // return the teardown function
  return function teardown() {
    aceEditor.off('change', onEditorChange);
    aceSelection.off('changeCursor', onSelectionChangeCursor);


    aceEditor.container.removeEventListener('mousemove', onContainerMousemove);
    aceEditor.container.removeEventListener('mouseleave', onContainerMouseleave);
  };
};
},{"../../auxiliary":24,"css":16}],29:[function(require,module,exports){
// third-party dependencies
const Bluebird = require('bluebird');

// own deps
const cursorInteractions = require('./cursor-interactions');
// const mouseInteractions  = require('./mouse-interactions');
// const autocomplete       = require('./autocomplete');

exports.setup = function (fileEditor, options) {
  return Bluebird.all([
    cursorInteractions(fileEditor, options),
    // mouseInteractions(fileEditor, options),
    // autocomplete(fileEditor, options),
  ])
  .then(function (teardownFns) {
    return function teardown() {
      return Bluebird.all(teardownFns.map(function (fn) {
        return fn();
      }));
    };
  });
};

// exports.name = 'text/css';
},{"./cursor-interactions":28,"bluebird":11}],30:[function(require,module,exports){
// own
const aux = require('../../auxiliary');

const MDN_HTML_REFERENCE = require('./mdn-html-reference.json');
const HEADING_ELEMENTS   = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

const AUTOCOMPLETE_INTENTION = 'autocomplete-intention';
const AUTOCOMPLETE_DETACH    = 'autocomplete-detach';
const MIME_TYPE = 'text/html';

module.exports = function (fileEditor, options) {

  var aceEditor = fileEditor.aceEditor;

  // requires:
  // ace-builds/src-noconflict/ext-language_tools.js
  var languageTools = fileEditor.ace.require('ace/ext/language_tools');

  //////////
  // EMMET
  // taken from ace kitchen-sink
  var Emmet = fileEditor.ace.require('ace/ext/emmet');

  // ace-emmet-core (made by ace-editor guys, based on emmet for sublime-text)
  // uses literal octals, which are not strict-mode compliant
  // and that breaks vulcanize.
  // 
  // For now we've replaced all octal literals in the ace-emmet-core lib
  // and removed parts that had string octal escapes.
  // 
  // We should exclude the script if any problem happens.
  // 
  // TODO: implement emmet support
  Emmet.setCore(window.emmet);

  // create a completer without the useless tooltip
  var snippetCompleterWithoutUselessDocs = {
    getCompletions: languageTools.snippetCompleter.getCompletions.bind(languageTools.snippetCompleter),
  };

  // EMMET
  ///////////

  var htmlCompleterWithDocs = {
    getCompletions: languageTools.keyWordCompleter.getCompletions.bind(languageTools.keyWordCompleter),
    getDocTooltip: function (item) {
      
      var mode = aceEditor.getSession().getMode();

      // TODO: add check for mode
      if (item.meta === 'tag') {

        var tagName = item.tagName;

        // MDN has grouped h1-h6 in 'Heading_Elements'
        if (HEADING_ELEMENTS.indexOf(tagName) !== -1) {
          tagName = 'Heading_Elements'
        }

        var refItem = MDN_HTML_REFERENCE.find(function (ref) {
          return ref.name === tagName;
        });

        if (refItem) {

          var codeExamples = refItem.examples.map(function (ex) {
            return '<code>' + ex + '</code>';
          });

          item.docHTML = [
            '<b>', refItem.name, '</b>',
            '<hr></hr>',
            '<p style="white-space: normal; max-width: 300px;">', refItem.summary, '</p>',
            '<hr></hr>',
            '<div style="font-size: 10px">', codeExamples, '</div>',
            '<caption>fonte: Mozilla Developer Network</caption>',
          ].join('');
        }
      }
    }
  }

  languageTools.setCompleters([
    snippetCompleterWithoutUselessDocs,
    htmlCompleterWithDocs,
  ]);

  aceEditor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: false,
  });

  /**
   * Executed when the autocomplete is hovered by the cursor
   */
  function onEditorAutocompleteHover(hoveredItem) {
    
  }

  /**
   * Executed when the autocomplete is selected
   * @param  {Object} selectedItem
   *         - name: String
   *         - example: String
   */
  function onEditorAutocompleteSelect(selectedItem) {
    var doc = aceEditor.getSession().getDocument();

    var cursorPos = aceEditor.getCursorPosition();

    // try to get a change Anchor set for the position
    var changeArea = fileEditor.changeManager.findChangeAreaForPosition(cursorPos);

    if (changeArea) {
      // if the cursor is within a change area,
      // use the change area first anchor as the position instead
      cursorPos = changeArea.getRange().start;
    }

    var doc = fileEditor.aceEditor.getSession().getDocument();

    var unsavedChars = fileEditor.changeManager.computeUnsavedCharCount(cursorPos);
    var cursorIndex  = doc.positionToIndex(cursorPos) - unsavedChars;

    fileEditor.hDev.publish(AUTOCOMPLETE_INTENTION, {
      f: fileEditor.filepath,
      mode: MIME_TYPE,
      p: position,
      c: cursorIndex,      
      insert: {
        name: selectedItem.name,
        html: selectedItem.example
      }
    });
  }

  /**
   * Executed when autocomplete closes
   */
  function onEditorAutocompleteDetach() {
    fileEditor.hDev.publish(AUTOCOMPLETE_DETACH, {
      filepath: fileEditor.filepath,
      mode: MIME_TYPE,
    });
  }

  aceEditor.on('autocomplete-hover', onEditorAutocompleteHover);
  aceEditor.on('autocomplete-select', onEditorAutocompleteSelect);
  aceEditor.on('autocomplete-detach', onEditorAutocompleteDetach);

  return function teardown() {
    aceEditor.off('autocomplete-hover', onEditorAutocompleteHover);
    aceEditor.off('autocomplete-select', onEditorAutocompleteSelect);
    aceEditor.off('autocomplete-detach', onEditorAutocompleteDetach);
  };
}
},{"../../auxiliary":24,"./mdn-html-reference.json":33}],31:[function(require,module,exports){
// own
const aux = require('../../auxiliary');

const CURSOR_POSITION_CHANGE = 'cursor-position-change';
const MIME_TYPE = 'text/html';

module.exports = function (fileEditor, options) {
  /**
   * Publishes an event with the position and filepath
   */
  function _publishPosition(eventName, position) {

    var posIsWithinChangeArea = fileEditor.changeManager.isPositionWithinChangeArea(position);

    if (posIsWithinChangeArea) {
      // ignore any cursor movements within a change area.
      return;
    } else {

      var doc = fileEditor.aceEditor.getSession().getDocument();

      var unsavedChars = fileEditor.changeManager.computeUnsavedCharCount(position);
      var cursorIndex  = doc.positionToIndex(position) - unsavedChars;

      fileEditor.hDev.publish(eventName, {
        f: fileEditor.filepath,
        p: position,
        c: cursorIndex,
        mode: MIME_TYPE,
      });
    }
  }

  /**
   * Executed whenever the aceEditor emits a 'blur' event
   */
  function onEditorBlur() {
    _publishPosition(CURSOR_POSITION_CHANGE, {});
  }

  /**
   * Executed whenever the cursor is moved in the editor
   */
  function onSelectionChangeCursor() {
    var cursorPos = fileEditor.aceEditor.getCursorPosition();

    _publishPosition(CURSOR_POSITION_CHANGE, cursorPos);
  }

  // attach event listeners
  var aceEditor    = fileEditor.aceEditor;
  var aceSession   = fileEditor.aceEditor.getSession();
  var aceSelection = aceSession.getSelection();

  aceEditor.on('blur', onEditorBlur);
  aceSelection.on('changeCursor', onSelectionChangeCursor);

  // return the teardown function
  return function teardown() {
    aceEditor.off('blur', onEditorBlur);
    aceSelection.off('changeCursor', onSelectionChangeCursor);
  };
};
},{"../../auxiliary":24}],32:[function(require,module,exports){
// third-party dependencies
const Bluebird = require('bluebird');

// own deps
const cursorInteractions = require('./cursor-interactions');
const mouseInteractions  = require('./mouse-interactions');
const autocomplete       = require('./autocomplete');

exports.setup = function (fileEditor, options) {
  return Bluebird.all([
    cursorInteractions(fileEditor, options),
    mouseInteractions(fileEditor, options),
    autocomplete(fileEditor, options),
  ])
  .then(function (teardownFns) {
    return function teardown() {
      return Bluebird.all(teardownFns.map(function (fn) {
        return fn();
      }));
    };
  });
};

// exports.name = 'text/html';
},{"./autocomplete":30,"./cursor-interactions":31,"./mouse-interactions":34,"bluebird":11}],33:[function(require,module,exports){
module.exports=[{"name":"a","summary":"<em>O elemento HTML </em><em><code>&lt;a&gt;</code></em> (ou o Elemento Ancora HTML define uma hiperligação (<em>hyperlink</em>), o destino de uma hiperligação, ou ambos.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/a","examples":["&lt;!-- &#xE2;ncora ligando a um arquivo externo --&gt;\n&lt;a href=&quot;<a href=\"http://www.mozilla.com/\" class=\"linkification-ext\" title=\"Linkification: http://www.mozilla.com/\">http://www.mozilla.com/</a>&quot;&gt;\nLink Externo\n&lt;/a&gt;\n"]},{"name":"abbr","summary":"O <em>Elemento</em> <em>HTML <code>&lt;abbr&gt;</code> </em>(ou Elemento de Abreviação HTML) representa uma abreviação e opcionalmente fornece uma descrição completa para ela. Se presente, o atributo <code><strong>title</strong></code> deve conter a descrição completa e apenas ela.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/abbr","examples":["&lt;p&gt;Obama &#xE9; presidente dos &lt;abbr title=&quot;Estados Unidos da Am&#xE9;rica&quot;&gt;EUA&lt;/abbr&gt;&lt;/p&gt;\n"]},{"name":"acronym","summary":"O Elemento HTML Acrônimo (<code>&lt;acronym&gt;)</code> permite à autores claramente indicar que uma seqüência de caracteres compõe um acrônimo ou uma abreviação de uma palavra.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/acronym","examples":[]},{"name":"address","summary":"O Elemento <em>HTML <code>&lt;address&gt;</code></em> pode ser usado por autores para fornecer informação de contato para seu ancestral <a href=\"/pt-BR/docs/HTML/Element/article\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;article&gt;</code></a> ou <a href=\"/pt-BR/docs/HTML/Element/body\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;body&gt;</code></a> mais próximo; no segundo caso, ela se aplica ao documento inteiro.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/address","examples":["  &lt;address&gt;\n    Voce pode contatar o autor em &lt;a href=&quot;http://www.somedomain.com/contact&quot;&gt;www.somedomain.com&lt;/a&gt;.&lt;br&gt;\n    Se encontrar qualquer bug, por favor &lt;a href=&quot;mailto:webmaster@somedomain.com&quot;&gt;contate o administrador do site&lt;/a&gt;.&lt;br&gt;\n    Voc&#xEA; tambem pode querer nos visitar:&lt;br&gt;\n    Mozilla Foundation&lt;br&gt;\n    1981 Landings Drive&lt;br&gt;\n    Building K&lt;br&gt;\n    Mountain View, CA 94043-0801&lt;br&gt;\n    USA\n  &lt;/address&gt;\n"]},{"name":"applet","summary":"The HTML Applet Element (<code>&lt;applet&gt;</code>) identifies the inclusion of a Java applet.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/applet","examples":["&lt;applet code=&quot;game.class&quot; align=&quot;left&quot; archive=&quot;game.zip&quot; height=&quot;250&quot; width=&quot;350&quot;&gt;\n  &lt;param name=&quot;difficulty&quot; value=&quot;easy&quot;&gt;\n  &lt;b&gt;Sorry, you need Java to play this game.&lt;/b&gt;\n&lt;/applet&gt;\n"]},{"name":"area","summary":"O <em>HTML <code>&lt;area&gt;</code> elemento</em> define uma região hot-spot em uma imagem, e, opcionalmente, associa-lo com um <a class=\"glossaryLink\" href=\"/pt-BR/docs/Glossary/Hyperlink\" title=\"The definition of that term (link de hipertexto) has not been written yet; please consider contributing it!\">link de hipertexto</a>. Este elemento é usado somente dentro de um <a href=\"/pt-BR/docs/Web/HTML/Element/map\" title=\"O HTML &lt;map&gt; elemento &#xE9; usado com &lt;area&gt; elementos para definir um mapa de imagem (a &#xE1;rea link clic&#xE1;vel).\"><code>&lt;map&gt;</code></a> elemento.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/area","examples":["&lt;mapa name=&quot;primary&quot;&gt;\n  &lt;area shape=&quot;circle&quot; coords=&quot;200,250,25&quot; href=&quot;another.htm&quot; /&gt; \n  &lt;area shape=&quot;default&quot; nohref /&gt;\n&lt;/map&gt;\n"]},{"name":"aside","summary":"O elemento <em>HTML <code>&lt;aside&gt;</code> </em>representa uma seção de uma página que consiste de conteúdo que é tangencialmente relacionado ao conteúdo do seu entorno, que poderia ser considerado separado do conteúdo. Essas seções são, muitas vezes, representadas como barras laterais. Elas muitas vezes contem explicações laterais, como a definição de um glossário; conteúdo vagamente relacionado, como avisos; a biografia do autor; ou, em aplicações web, informações de perfil ou links de blogs relacionados.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/aside","examples":["&lt;aside&gt;\n  &lt;p&gt;Algum conteudo relacionado a um &amp;lt;article&amp;gt;&lt;/p&gt;\n&lt;/aside&gt; \n"]},{"name":"%3Cb%3E","summary":"O <strong>elemento HTML &lt;b&gt;</strong> representa um intervalo de texto estilísticamente diferente do texto normal, sem transmitir qualquer importância ou relevância. Ele é geralmente usado para destacar palavras-chaves em um resumo, nomes de produtos em um comentário ou outros vãos de texto cuja a apresentação típica seria negrito. Outro exemplo de seu uso é como marcação da frase principal de cada paragrafo de um artigo.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/%3Cb%3E","examples":["&lt;p&gt;\n  Este artigo descreve v&#xE1;rios &lt;b&gt;n&#xED;veis de texto&lt;/b&gt;. Ele explica a utiliza&#xE7;&#xE3;o do elemento em um documento &lt;b&gt;HTML&lt;/b&gt;.   \n&lt;/p&gt;\nPalavras-chave s&#xE3;o exibidas com o estilo padr&#xE3;o do elemento &lt;b&gt;, provavelmente em negrito.\n"]},{"name":"base","summary":"O <em>elemento HTML Base</em> (<strong>&lt;base&gt;</strong>) especifica o endereço (URL) utilizada por todos os enderços relativos contidos dentro de um documento. Há um número máximo de 1 (um) elemento <em>Base </em>&lt;base&gt; do documento.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/base","examples":["&lt;base href=&quot;http://www.example.com/&quot;&gt;\n&lt;base target=&quot;_blank&quot; href=&quot;http://www.example.com/&quot;&gt;  \n"]},{"name":"bdi","summary":"<span id=\"ouHighlight__0_3TO0_3\">Este</span><span id=\"noHighlight_0.7554138673003763\"> </span><span id=\"ouHighlight__5_11TO5_12\">elemento</span><span id=\"noHighlight_0.9105970792006701\"> </span><span id=\"ouHighlight__13_14TO14_14\">é</span><span id=\"noHighlight_0.02825332246720791\"> </span><span id=\"ouHighlight__16_21TO16_19\">útil</span><span id=\"noHighlight_0.49017372098751366\"> </span><span id=\"ouHighlight__23_26TO21_22\">ao</span><span id=\"noHighlight_0.833095996407792\"> </span><span id=\"ouHighlight__28_36TO24_33\">incorporar</span><span id=\"noHighlight_0.6412814292125404\"> o </span><span id=\"ouHighlight__38_41TO37_41\">texto</span><span id=\"noHighlight_0.5279295009095222\"> </span><span id=\"ouHighlight__43_46TO43_45\">com</span><span id=\"noHighlight_0.6386495919432491\"> </span><span id=\"ouHighlight__48_49TO47_49\">uma</span><span id=\"noHighlight_0.8489199872128665\"> </span><span id=\"ouHighlight__59_72TO51_57\">direção</span><span id=\"noHighlight_0.9773911898955703\"> </span><span id=\"ouHighlight__51_57TO59_70\">desconhecida</span><span id=\"noHighlight_0.5116830433253199\">,</span><span id=\"noHighlight_0.7326054258737713\"> </span><span id=\"ouHighlight__75_78TO73_74\">de</span><span id=\"noHighlight_0.008567805867642164\"> </span><span id=\"ouHighlight__80_80TO76_77\">um</span><span id=\"ouHighlight__82_89TO79_92\">banco de dados</span><span id=\"noHighlight_0.24359390302561224\"> </span><span id=\"ouHighlight__91_93TO94_96\">por</span><span id=\"noHighlight_0.1003112040925771\"> </span><span id=\"ouHighlight__95_101TO98_104\">exemplo</span><span id=\"noHighlight_0.4042799514718354\">,</span><span id=\"noHighlight_0.9500157283619046\"> </span><span id=\"ouHighlight__104_109TO107_117\">no interior</span><span id=\"noHighlight_0.8313138401135802\"> do </span><span id=\"ouHighlight__111_114TO122_126\">texto</span><span id=\"noHighlight_0.5792264079209417\"> </span><span id=\"ouHighlight__116_119TO128_130\">com</span><span id=\"noHighlight_0.6307996944524348\"> </span><span id=\"ouHighlight__121_121TO132_134\">uma</span><span id=\"noHighlight_0.4534156653098762\"> </span><span id=\"ouHighlight__129_142TO136_142\">direção</span><span id=\"noHighlight_0.24449271336197853\"> </span><span id=\"ouHighlight__123_127TO144_147\">fixa</span><span id=\"noHighlight_0.3078894999343902\">.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/bdi","examples":["&lt;p dir=&quot;ltr&quot;&gt;Esta palavra ar&#xE1;bica &lt;bdi&gt;ARABIC_PLACEHOLDER&lt;/bdi&gt; &#xE9; latomaticamente voltada da direita&lt;/p&gt;\n"]},{"name":"blink","summary":"O elemento HTML Blink (<code>&lt;blink&gt;</code>) é um elemento não-padrão que faz com que o texto pisque lentamente.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/blink","examples":["&lt;blink&gt;Why would somebody use this?&lt;/blink&gt;\n"]},{"name":"blockquote","summary":"<span id=\"result_box\" lang=\"pt\"><span class=\"hps\">O</span> <span class=\"hps\">HTML</span> <span class=\"hps\">&lt;blockquote</span><span class=\"atn\">&gt; Elemento (</span><span>ou</span> <span class=\"hps\">HTML</span> <span class=\"hps\">Bloco</span> <span class=\"hps\">Cotação</span> <span class=\"hps\">Elemento</span><span>) indica que o</span> <span class=\"hps\">texto incluído</span> <span class=\"hps\">é uma</span> <span class=\"hps\">longa citação</span><span>.</span> <span class=\"hps\">Normalmente</span><span>, este</span> <span class=\"hps\">é processado</span> <span class=\"hps\">visualmente</span> <span class=\"hps\">pelo</span> <span class=\"hps\">recuo</span> <span class=\"hps\">(ver <a href=\"https://developer.mozilla.org/en-US/docs/HTML/Element/blockquote#Notes\">Notas</a></span> <span class=\"hps\">sobre como</span> <span class=\"hps\">mudá-lo</span><span>)</span><span>.</span> <span class=\"hps\">A</span> <span class=\"hps\">URL</span> <span class=\"hps\">para a</span> <span class=\"hps\">fonte da citação</span> <span class=\"hps\">pode ser dado</span> <span class=\"hps\">usando o atributo</span> <span class=\"hps\">citar</span><span>,</span> <span class=\"hps\">enquanto</span> <span class=\"hps\">uma representação de texto</span> <span class=\"hps\">da fonte</span> <span class=\"hps\">pode ser dado</span> <span class=\"hps\">usando o</span> <span class=\"atn hps\">{{HTMLElement(\"cite\")}}</span> <span class=\"hps\">elemento.</span></span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/blockquote","examples":["<code class=\"language-html\"><span class=\"tag token\"><span class=\"tag token\"><span class=\"punctuation token\">&lt;</span>blockquote</span> <span class=\"attr-name token\">cite</span><span class=\"attr-value token\"><span class=\"punctuation token\">=</span><span class=\"punctuation token\">&quot;</span>http://developer.mozilla.org<span class=\"punctuation token\">&quot;</span></span><span class=\"punctuation token\">&gt;</span></span>\n  <span class=\"tag token\"><span class=\"tag token\"><span class=\"punctuation token\">&lt;</span>p</span><span class=\"punctuation token\">&gt;</span></span>Esta &#xE9; uma cita&#xE7;&#xE3;o tirada da Mozilla Developer Center.<span class=\"tag token\"><span class=\"tag token\"><span class=\"punctuation token\">&lt;/</span>p</span><span class=\"punctuation token\">&gt;</span></span>\n<span class=\"tag token\"><span class=\"tag token\"><span class=\"punctuation token\">&lt;/</span>blockquote</span><span class=\"punctuation token\">&gt;</span></span></code>"]},{"name":"body","summary":"O elemento <body> do HTML representa o conteúdo de um documento HTML. Apenas é permitido um elemento <body> por documento.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/body","examples":[]},{"name":"button","summary":"O <strong>Elemento HTML <em><code>&lt;button&gt;</code></em></strong> representa um botão clicável.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/button","examples":[]},{"name":"caption","summary":"O <strong>Elemento</strong> <strong>HTML <code>&lt;caption&gt;</code> (</strong>ou <em>Elemento HTML Subtitulo de Tabela</em>) representa o título de uma tabela. Embora ele seja sempre o primeiro filho de um <a href=\"/pt-BR/docs/Web/HTML/Element/table\" title=\"O elemento HTML&#xA0;Table&#xA0;(&lt;table&gt;) representa dados em duas dimens&#xF5;es ou mais.\"><code>&lt;table&gt;</code></a>, seu estilo, usando CSS pode colocar ele em qualquer lugar relativo a tabela.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/caption","examples":[]},{"name":"data","summary":"The <strong>HTML <code>&lt;data&gt;</code> Element</strong> links a given content with a machine-readable translation. If the content is time- or date-related, the <a href=\"/pt-BR/docs/HTML/Element/time\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;time&gt;</code></a> must be used.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/data","examples":[]},{"name":"del","summary":"O <strong style=\"line-height: 1.5;\">elemento </strong><strong style=\"line-height: 1.5;\">HTML <code>&lt;del&gt;</code></strong><span style=\"line-height: 1.5;\"> (ou </span><em>Elemento </em><em>HTML </em><em>de Texto Excluído</em><span style=\"line-height: 1.5;\">) representa uma parte do texto que foi excluída de um documento. Este elemento é (não necessariamente) renderizado pelos navegadores com uma linha entre o texto.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/del","examples":[]},{"name":"dfn","summary":"O elemento <strong>HTML <code>&lt;dfn&gt;</code> </strong> (ou <em>Elemento Definição </em><em>HTML</em>) representa uma instância de definição de um termo.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dfn","examples":["&lt;!-- Define &quot;A Internet&quot; --&gt;\n&lt;p&gt;&lt;dfn id=&quot;def-internet&quot;&gt;A Internet&lt;/dfn&gt; &#xE9; um sistema global de redes interconectadas que usam o Internet Protocol Suite (TCP/IP) para servir bilh&#xF5;es de usu&#xE1;rios no mundo todo.\n&lt;/p&gt;\n","&lt;dl&gt;\n  &lt;!-- Define &quot;World-Wide Web&quot; a defini&#xE7;&#xE3;o de refer&#xEA;ncia para &quot;A Internet&quot; --&gt;\n  &lt;dt&gt;\n    &lt;dfn&gt;\n      &lt;abbr title=&quot;World-Wide Web&quot;&gt;WWW&lt;/abbr&gt;\n    &lt;/dfn&gt;\n  &lt;/dt&gt;\n  &lt;dd&gt;A World-Wide Web (WWW) &#xE9; um sistema de documentos de hipertexto interligados acessados pela &lt;a href=&quot;#def-internet&quot;&gt;Internet&lt;/a&gt;.&lt;/dd&gt;\n&lt;/dl&gt;\n"]},{"name":"div","summary":"The <strong><a href=\"/en-US/docs/Web/HTML\">HTML</a> <code>&lt;div&gt;</code> element</strong> (or <em>HTML Document Division Element</em>) is the generic container for flow content, which does not inherently represent anything. It can be used to group elements for styling purposes (using the <strong>class</strong> or <strong>id</strong> attributes), or because they share attribute values, such as <strong>lang</strong>. It should be used only when no other semantic element (such as <a href=\"/pt-BR/docs/Web/HTML/Element/article\" title=\"O Elemento HTML Article (&lt;article&gt;) representa uma composi&#xE7;&#xE3;o independente em um documento, p&#xE1;gina, aplica&#xE7;&#xE3;o, ou site, ou que &#xE9; destinado &#xE1; ser distribuido de forma independente ou reutiliz&#xE1;vel, por exemplo, em sindica&#xE7;&#xE3;o. Este poderia ser o post de um f&#xF3;rum, um artigo de revista ou jornal, um post de um blog, um coment&#xE1;rio enviado por um usu&#xE1;rio, um gadget ou widget interativos, ou qualquer outra forma de conte&#xFA;do independente.\"><code>&lt;article&gt;</code></a> or <a href=\"/pt-BR/docs/Web/HTML/Element/nav\" title=\"O Elemento HTML de Navega&#xE7;&#xE3;o (&lt;nav&gt;) representa uma se&#xE7;&#xE3;o de uma p&#xE1;gina que aponta para outras p&#xE1;ginas ou para outras &#xE1;reas da p&#xE1;gina, ou seja, uma se&#xE7;&#xE3;o com links de navega&#xE7;&#xE3;o.\"><code>&lt;nav&gt;</code></a>) is appropriate.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/div","examples":[]},{"name":"dt","summary":"O elemento <strong>HTML <code>&lt;dt&gt;</code></strong> (ou Elemento HTML de Definição de Termo) identifica um termo na lista de definição. Este elemento pode ocorrer somente em um elemento filho de <a href=\"/pt-BR/docs/Web/HTML/Element/dl\" title=\"O elemento HTML&#xA0;Definition List&#xA0;(&lt;dl&gt;)&#xA0;engloba uma lista de pares de termos e descri&#xE7;&#xF5;es. Um uso comum para este elemento &#xE9; para implementar um gloss&#xE1;rio.\"><code>&lt;dl&gt;</code></a>. Geralmente seguido por um elemento <a href=\"/pt-BR/docs/Web/HTML/Element/dd\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;dd&gt;</code></a>; ou multiplos <code>&lt;dt&gt;</code> na mesma linha indicam vários termos  sendo definidos pelo próximo element <a href=\"/pt-BR/docs/Web/HTML/Element/dd\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;dd&gt;</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dt","examples":[]},{"name":"embed","summary":"O Elemento <strong>HTML <code>&lt;embed&gt;</code> </strong>representa um ponto de integração para uma aplicação externa ou conteúdo interativo (em outras palavras, um plug-in).","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/embed","examples":[]},{"name":"figura","summary":"O <strong>Elemento HTML <code>&lt;figure&gt;</code> </strong>representa o conteúdo independente, frequentemente com uma legenda (<a href=\"/pt-BR/docs/Web/HTML/Element/figcaption\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;figcaption&gt;</code></a>)<em><code>,</code></em> e é normalmente referido como uma única unidade. Enquanto ela está relacionada com o fluxo principal, sua posição é independente do fluxo principal.Normalmente, isso é uma imagem, uma ilustração, um diagrama, um trecho de código ou uma esquema que é referenciado no texto principal, mas que pode ser movido para outra página ou para um apêndice, sem afetar o fluxo principal.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/figura","examples":["&lt;!-- Apenas uma imagem--&gt;\n&lt;figure&gt;\n\t&lt;img src=&quot;https://developer.cdn.mozilla.net/media/img/mdn-logo-sm.png&quot; alt=&quot;Uma imagem impressionante&quot;&gt;\n&lt;/figure&gt;\n&lt;p&gt;&lt;/p&gt;\n&lt;!-- Imagem com legenda --&gt;\n&lt;figure&gt;\n\t&lt;img src=&quot;https://developer.cdn.mozilla.net/media/img/mdn-logo-sm.png&quot; alt=&quot;Uma imagem impressionante&quot;&gt;\t\n\t&lt;figcaption&gt;Legenda para a imagem impressionante&lt;/figcaption&gt;\n&lt;/figure&gt;\n&lt;p&gt;&lt;/p&gt;\n","    &lt;figure&gt;\n      &lt;figcaption&gt;Obtenha os detalhes do browser usando navigator&lt;/figcaption&gt;\n        &lt;pre&gt;\n          function NavigatorExample(){\n          var txt;\n          txt = &quot;Browser CodeName: &quot; + navigator.appCodeName;\n          txt+= &quot;Browser Name: &quot; + navigator.appName;\n          txt+= &quot;Browser Version: &quot; + navigator.appVersion ;\n          txt+= &quot;Cookies Enabled: &quot; + navigator.cookieEnabled;\n          txt+= &quot;Platform: &quot; + navigator.platform;\n          txt+= &quot;User-agent header: &quot; + navigator.userAgent;\n          }            \n        &lt;/pre&gt;\n","          function NavigatorExample(){\n          var txt;\n          txt = &quot;Browser CodeName: &quot; + navigator.appCodeName;\n          txt+= &quot;Browser Name: &quot; + navigator.appName;\n          txt+= &quot;Browser Version: &quot; + navigator.appVersion ;\n          txt+= &quot;Cookies Enabled: &quot; + navigator.cookieEnabled;\n          txt+= &quot;Platform: &quot; + navigator.platform;\n          txt+= &quot;User-agent header: &quot; + navigator.userAgent;\n          }            \n ","&lt;figure&gt;\n      &lt;figcaption&gt;&lt;cite&gt;Edsger Dijkstra :-&lt;/cite&gt;&lt;/figcaption&gt;\n      &lt;p&gt;&quot;Se o debugging &#xE9; o processo de remo&#xE7;&#xE3;o de bugs de software, &lt;br /&gt; ent&#xE3;o programa&#xE7;&#xE3;o deve ser o processo de coloc&#xE1;-los&quot;&lt;br /&gt;&lt;/p&gt;\n    &lt;/figure&gt;\n\n\n"]},{"name":"form","summary":"O <strong>elemento HTML <code>&lt;form&gt;</code> </strong>representa uma seção de um documento que contém controles interativos que permitem ao usuário submeter informação a um determinado servidor web.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/form","examples":[]},{"name":"hgroup","summary":"O <strong>Elemento HTML <code>&lt;hgroup&gt; </code></strong>(<em>HTML Headings Group Element</em>) representa título de um seção. Ele define um único título que participa <a href=\"https://developer.mozilla.org/en-US/docs/Sections_and_Outlines_of_an_HTML5_document\">do esboço do documento</a> como o título da seção implícita ou explícita que ele pertence.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/hgroup","examples":[]},{"name":"hr","summary":"O <strong>elemento HTML <code>&lt;hr&gt;</code></strong> representa uma quebra temática entre elementos de nível de parágrafo (por exemplo , uma mudança da cena de uma história, ou uma mudança de tema com uma seção). Nas versões anteriores do HTML, representava uma linha horizontal. Pode continuar sendo exibida como uma linha horizontal nos navegadores, mas agora está definida em termos semânticos, em vez de termos de apresentação.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/hr","examples":["&lt;p&gt;Este &#xE9; o primeiro par&#xE1;grafo do texto. Este &#xE9; o primeiro par&#xE1;grafo do texto.\n  Este &#xE9; o primeiro par&#xE1;grafo do texto. Este &#xE9; o primeiro par&#xE1;grafo do texto.&lt;/p&gt;\n\n&lt;hr&gt;\n\n&lt;p&gt;Este &#xE9; o segundo par&#xE1;grafo do texto. Este &#xE9; o segundo par&#xE1;grafo do texto.\n  Este &#xE9; o segundo par&#xE1;grafo do texto. Este &#xE9; o segundo par&#xE1;grafo do texto.&lt;/p&gt;\n"]},{"name":"html","summary":"O elemento <strong>HTML <span style=\"font-family: Courier New;\">&lt;html&gt;</span> </strong>(ou <em>HTML root element</em>) representa a raiz de um HTML ou XHTML documento. Todos os outros elementos devem ser descendentes desse elemento.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/html","examples":["&lt;!DOCTYPE html&gt;\n&lt;html&gt;\n  &lt;head&gt;...&lt;/head&gt;\n  &lt;body&gt;...&lt;/body&gt;\n&lt;/html&gt;\n"]},{"name":"iframe","summary":"<span id=\"ouHighlight__0_2TO0_0\">O <strong>elemento</strong></span><strong><span id=\"noHighlight_0.6669463853503006\"> </span><span id=\"ouHighlight__4_7TO2_5\">HTML</span><span id=\"noHighlight_0.9190923802093316\"> </span></strong><span id=\"ouHighlight__9_16TO7_14\"><strong>&lt;iframe&gt;</strong> (ou <em>elemento HTML </em></span><em><span id=\"ouHighlight__35_40TO29_34\">inline</span><span id=\"noHighlight_0.8618476026650426\"> </span><span id=\"ouHighlight__42_46TO36_40\">frame</span></em><span id=\"ouHighlight__48_55TO54_54\">)</span><span id=\"noHighlight_0.7068545802198582\"> </span><span id=\"ouHighlight__57_66TO56_65\">representa</span><span id=\"noHighlight_0.7526791453051795\"> </span><span id=\"ouHighlight__68_68TO67_68\">um</span><span id=\"noHighlight_0.44971730954195105\"> </span><span id=\"ouHighlight__86_92TO70_77\">contexto</span><span id=\"noHighlight_0.09083070847867625\"> de </span><span id=\"ouHighlight__77_84TO82_90\">navegação</span><span id=\"noHighlight_0.37968552813404615\"> </span><span id=\"ouHighlight__70_75TO92_99\">aninhado</span><span id=\"noHighlight_0.5995269340430607\">,</span><span id=\"noHighlight_0.008704451712585215\"> </span><span id=\"ouHighlight__95_105TO102_113\">efetivamente</span><span id=\"noHighlight_0.5931006711248601\"> </span><span id=\"ouHighlight__107_115TO115_124\">incorporando</span><span id=\"noHighlight_0.6374518958720761\"> </span><span id=\"ouHighlight__117_123TO126_130\">outra</span><span id=\"noHighlight_0.8893985313976909\"> </span><span id=\"ouHighlight__130_133TO132_137\">página</span><span id=\"noHighlight_0.8866311110803541\"> </span><span id=\"ouHighlight__125_128TO139_142\">HTML</span><span id=\"noHighlight_0.23447126715327776\"> </span><span id=\"ouHighlight__135_138TO144_147\">para</span><span id=\"noHighlight_0.07307917672825964\"> </span><span id=\"ouHighlight__140_142TO149_149\">a</span><span id=\"noHighlight_0.12950057344301286\"> </span><span id=\"ouHighlight__152_155TO151_156\">página</span><span id=\"noHighlight_0.26467654674888124\"> </span><span id=\"ouHighlight__144_150TO158_162\">atual</span><span id=\"noHighlight_0.13149866746429495\">.</span><span id=\"noHighlight_0.1583040075152209\"> </span><span id=\"ouHighlight__158_159TO165_166\">Em</span><span id=\"noHighlight_0.5442761031849714\"> </span><span id=\"ouHighlight__161_164TO168_171\">HTML</span><span id=\"noHighlight_0.7415189012773161\"> </span><span id=\"ouHighlight__166_169TO173_176\">4.01</span><span id=\"noHighlight_0.18966050608785345\">,</span><span id=\"noHighlight_0.041719693152791726\"> </span><span id=\"ouHighlight__172_172TO179_180\">um</span><span id=\"noHighlight_0.3042841997000498\"> </span><span id=\"ouHighlight__174_181TO182_190\">documento</span><span id=\"noHighlight_0.23497132229022943\"> </span><span id=\"ouHighlight__183_185TO192_195\">pode</span><span id=\"noHighlight_0.4008871450338423\"> </span><span id=\"ouHighlight__187_193TO197_202\">conter</span><span id=\"noHighlight_0.4071292878658189\"> </span><span id=\"ouHighlight__195_195TO204_206\">uma</span><span id=\"noHighlight_0.47457438988490635\"> </span><span id=\"ouHighlight__197_200TO208_213\">cabeça</span><span id=\"noHighlight_0.3373122542468538\"> </span><span id=\"ouHighlight__202_204TO215_215\">e</span><span id=\"noHighlight_0.23651855095925434\"> </span><span id=\"ouHighlight__206_206TO217_218\">um</span><span id=\"noHighlight_0.6411380227090818\"> </span><span id=\"ouHighlight__208_211TO220_224\">corpo</span><span id=\"noHighlight_0.08602879881083225\"> </span><span id=\"ouHighlight__213_214TO226_227\">ou</span><span id=\"noHighlight_0.37958973706042986\"> </span><span id=\"ouHighlight__216_216TO229_231\">uma</span><span id=\"noHighlight_0.45566362837898144\"> </span><span id=\"ouHighlight__218_221TO233_238\">cabeça</span><span id=\"noHighlight_0.048174792122936794\"> </span><span id=\"ouHighlight__223_225TO240_240\">e</span><span id=\"noHighlight_0.6052151772063192\"> </span><span id=\"ouHighlight__227_227TO242_243\">um</span><span id=\"noHighlight_0.527561942369029\"> </span><span id=\"ouHighlight__229_238TO245_252\">conjunto</span><span id=\"noHighlight_0.2241339892956346\"> de </span><span id=\"ouHighlight__229_238TO257_264\">quadros,</span><span id=\"noHighlight_0.7466403298536145\"> </span><span id=\"ouHighlight__240_242TO266_268\">mas</span><span id=\"noHighlight_0.60661452595949\"> </span><span id=\"ouHighlight__244_246TO270_272\">não</span><span id=\"noHighlight_0.2055690028736905\"> </span><span id=\"ouHighlight__248_251TO274_278\">tanto</span><span id=\"noHighlight_0.17056980349635997\"> </span><span id=\"ouHighlight__253_253TO280_281\">um</span><span id=\"noHighlight_0.1816371921642101\"> </span><span id=\"ouHighlight__255_258TO283_287\">corpo</span><span id=\"noHighlight_0.6356568181960188\"> </span><span id=\"ouHighlight__260_262TO289_289\">e</span><span id=\"noHighlight_0.024514355871078586\"> </span><span id=\"ouHighlight__264_264TO291_292\">um</span><span id=\"noHighlight_0.8940702635096576\"> </span><span id=\"ouHighlight__266_275TO294_301\">conjunto</span><span id=\"noHighlight_0.8977448712057324\"> de </span><span id=\"ouHighlight__266_275TO306_313\">quadros.</span><span id=\"noHighlight_0.0918193409065523\"> </span><span id=\"ouHighlight__277_283TO315_324\">No entanto</span><span id=\"noHighlight_0.1762661889772812\">,</span><span id=\"noHighlight_0.48158682580055384\"> </span><span id=\"ouHighlight__286_287TO327_328\">um</span><span id=\"noHighlight_0.3295608382994803\"> </span><span id=\"ouHighlight__289_296TO330_337\">&lt;iframe&gt; </span><span id=\"ouHighlight__298_300TO338_341\">pode</span><span id=\"noHighlight_0.4581118623696281\"> </span><span id=\"ouHighlight__302_303TO343_345\">ser</span><span id=\"noHighlight_0.9491726714358877\"> </span><span id=\"ouHighlight__305_308TO347_351\">usado</span><span id=\"noHighlight_0.7935326599727865\"> </span><span id=\"ouHighlight__310_315TO353_358\">dentro</span><span id=\"noHighlight_0.8882364440599055\"> de </span><span id=\"ouHighlight__317_317TO363_364\">um</span><span id=\"noHighlight_0.35659349587226235\"> </span><span id=\"ouHighlight__335_338TO366_370\">corpo</span><span id=\"noHighlight_0.6180173905423034\"> de </span><span id=\"ouHighlight__326_333TO375_383\">documento</span><span id=\"noHighlight_0.6325067995535371\"> </span><span id=\"ouHighlight__319_324TO385_390\">normal</span><span id=\"noHighlight_0.5489940461070744\">.</span><span id=\"noHighlight_0.719136343959252\"> </span><span id=\"ouHighlight__341_344TO393_396\">Cada</span><span id=\"noHighlight_0.46662421428049483\"> </span><span id=\"ouHighlight__355_361TO398_405\">contexto</span><span id=\"noHighlight_0.42272719072589454\"> de </span><span id=\"ouHighlight__346_353TO410_418\">navegação</span><span id=\"noHighlight_0.4776198962890033\"> </span><span id=\"ouHighlight__363_365TO420_422\">tem</span><span id=\"noHighlight_0.8284713294373617\"> </span><span id=\"ouHighlight__367_369TO424_426\">sua</span><span id=\"noHighlight_0.11245358630162183\"> </span><span id=\"ouHighlight__371_373TO428_434\">própria</span><span id=\"noHighlight_0.6967118603938671\"> </span><span id=\"ouHighlight__383_389TO436_443\">história</span><span id=\"noHighlight_0.9731849685107241\"> de </span><span id=\"ouHighlight__375_381TO448_453\">sessão</span><span id=\"noHighlight_0.10662184845626404\"> </span><span id=\"ouHighlight__391_393TO455_455\">e</span><span id=\"noHighlight_0.6199151545361639\"> o </span><span id=\"ouHighlight__402_409TO459_467\">documento</span><span id=\"noHighlight_0.5109426886358104\"> </span><span id=\"ouHighlight__395_400TO469_473\">ativo</span><span id=\"noHighlight_0.14975366384711874\">.</span><span id=\"noHighlight_0.3061514493180468\"> </span><span id=\"ouHighlight__412_414TO476_476\">O</span><span id=\"noHighlight_0.1127544463071044\"> </span><span id=\"ouHighlight__425_431TO478_485\">contexto</span><span id=\"noHighlight_0.8936920262443369\"> de </span><span id=\"ouHighlight__416_423TO490_498\">navegação</span><span id=\"noHighlight_0.33159829590847844\"> </span><span id=\"ouHighlight__433_436TO500_502\">que</span><span id=\"noHighlight_0.19422162750175248\"> </span><span id=\"ouHighlight__438_445TO504_509\">contém</span><span id=\"noHighlight_0.7257538370863912\"> </span><span id=\"ouHighlight__447_449TO511_511\">o</span><span id=\"noHighlight_0.5658871331962624\"> </span><span id=\"ouHighlight__460_466TO513_520\">conteúdo</span><span id=\"noHighlight_0.09444488508842569\"> </span><span id=\"ouHighlight__451_458TO522_532\">incorporado</span><span id=\"noHighlight_0.9102766420541839\"> </span><span id=\"ouHighlight__468_469TO534_534\">é</span><span id=\"noHighlight_0.7721214942019884\"> </span><span id=\"ouHighlight__471_476TO536_542\">chamado</span><span id=\"noHighlight_0.4698330433441296\"> </span><span id=\"ouHighlight__478_480TO544_544\">o</span><span id=\"noHighlight_0.2495339172689015\"> </span><span id=\"ouHighlight__482_487TO546_548\">pai</span><span id=\"noHighlight_0.9252421234467765\"> de </span><span id=\"ouHighlight__498_504TO553_560\">contexto</span><span id=\"noHighlight_0.9453239564748947\"> de </span><span id=\"ouHighlight__489_496TO565_573\">navegação</span><span id=\"noHighlight_0.09080985933367569\">.</span><span id=\"noHighlight_0.8377870469347468\"> </span><span id=\"ouHighlight__507_509TO576_576\">O</span><span id=\"noHighlight_0.9334447973584516\"> </span><span id=\"ouHighlight__530_536TO578_585\">contexto</span><span id=\"noHighlight_0.2227516502872307\"> de </span><span id=\"ouHighlight__521_528TO590_598\">navegação</span><span id=\"noHighlight_0.16300547091532674\"> </span><span id=\"ouHighlight__511_519TO600_616\">de nível superior</span><span id=\"noHighlight_0.37812902714977636\"> </span><span id=\"ouHighlight__538_543TO618_621\">(que</span><span id=\"noHighlight_0.06803102089807028\"> </span><span id=\"ouHighlight__549_550TO623_625\">não</span><span id=\"noHighlight_0.8934888127100214\"> </span><span id=\"ouHighlight__545_547TO627_629\">tem</span><span id=\"noHighlight_0.11394040192067251\"> um </span><span id=\"ouHighlight__552_558TO634_637\">pai)</span><span id=\"noHighlight_0.19702167113012076\"> </span><span id=\"ouHighlight__563_571TO639_649\">normalmente</span><span id=\"noHighlight_0.5464819057687249\"> </span><span id=\"ouHighlight__560_561TO651_651\">é</span><span id=\"noHighlight_0.7935925262500484\"> </span><span id=\"ouHighlight__573_575TO653_653\">a</span><span id=\"noHighlight_0.5204863466938037\"> </span><span id=\"ouHighlight__585_590TO655_660\">janela</span><span id=\"noHighlight_0.6555245992130596\"> do </span><span id=\"ouHighlight__577_583TO665_673\">navegador</span><span id=\"noHighlight_0.2248931828460552\">.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/iframe","examples":[]},{"name":"img","summary":"O Elementos <strong>HTML <code>&lt;img&gt;</code> </strong> (or <em>HTML Image Element</em>) representa a inseração de imagem no documento, sedo implementado também pelo HTML5 para uma melhor experiência com o elemento &lt;<code>figure</code>&gt; e &lt;<code>figcaption&gt;</code>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/img","examples":[]},{"name":"Input","summary":"Este elemento inclui os <a href=\"/pt-BR/docs/HTML/Atributos_globais\">atributos globais</a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/Input","examples":["&lt;!-- Um campo b&#xE1;sico --&gt;\n&lt;input type=&quot;text&quot; name=&quot;input&quot; value=&quot;Digite aqui&quot;&gt;\n","&lt;!-- Um formul&#xE1;rio comum que inclui tags input --&gt;\n&lt;form action=&quot;getform.php&quot; method=&quot;get&quot;&gt;\n    Nome: &lt;input type=&quot;text&quot; name=&quot;nome&quot; /&gt;&lt;br /&gt;\n     Sobrenome: &lt;input type=&quot;text&quot; name=&quot;sobrenome&quot; /&gt;&lt;br /&gt;\n        E-mail: &lt;input type=&quot;email&quot; name=&quot;email_usuario&quot; /&gt;&lt;br /&gt;\n&lt;input type=&quot;submit&quot; value=&quot;Enviar&quot; /&gt;\n&lt;/form&gt;\n","&lt;input type=&quot;text&quot; mozactionhint=&quot;next&quot; name=&quot;sometext&quot; /&gt;\n"]},{"name":"ins","summary":"The <strong>HTML <code>&lt;ins&gt;</code> Element</strong> (or <em>HTML Inserted Text</em>) HTML represents a range of text that has been added to a document.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/ins","examples":[]},{"name":"label","summary":"A <strong>HTML <code>&lt;label&gt;</code> elemento</strong> representa uma legenda para um item em uma interface de usuário.Ela pode estar associada com um controle, quer por colocação do elemento de controle dentro do elemento <code>label</code> , ou usando o atributo <code>for</code>. Tal controle é chamado o <em>controle etiquetado</em> do elemento etiqueta.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/label","examples":["&lt;label&gt;Click me &lt;input type=&quot;text&quot; id=&quot;User&quot; name=&quot;Name&quot; /&gt;&lt;/label&gt;","&lt;label for=&quot;User&quot;&gt;Click me&lt;/label&gt;\n&lt;input type=&quot;text&quot; id=&quot;User&quot; name=&quot;Name&quot; /&gt;"]},{"name":"legend","summary":"O <strong>Elemento HTML <span style=\"font-family: Courier New;\">&lt;legend&gt;</span> </strong>(ou <em>Elemento </em><em>HTML Campo \"Legend\"</em>) representa um rótulo para o conteúdo do seu ancestral <a href=\"/pt-BR/docs/Web/HTML/Element/fieldset\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;fieldset&gt;</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/legend","examples":[]},{"name":"li","summary":"O <em>HTML List item element</em> (<code style=\"font-style: normal;\">&lt;li&gt;</code>) é usado para representar um item de lista. It should be contained in an ordered list (<a href=\"/pt-BR/docs/Web/HTML/Element/ol\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;ol&gt;</code></a>), an unordered list (<a href=\"/pt-BR/docs/Web/HTML/Element/ul\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;ul&gt;</code></a>) or a menu (<a href=\"/pt-BR/docs/Web/HTML/Element/menu\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;menu&gt;</code></a>), where it represents a single entity in that list. In menus and unordered lists, list items are ordinarily displayed using bullet points. In ordered lists, they are usually displayed with some ascending counter on the left such as a number or letter","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/li","examples":[]},{"name":"link","summary":"O <strong>Elemento HTML <em>&lt;link&gt;</em></strong> especifica as relações entre o documento atual e um recurso externo. Possíveis usos para este elemento incluem a definição de uma estrutura relacional para navegação. Este elemento é mais usado para vincular as folhas de estilo.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/link","examples":["&lt;link href=&quot;style.css&quot; rel=&quot;stylesheet&quot;&gt;\n","&lt;link href=&quot;default.css&quot; rel=&quot;stylesheet&quot; title=&quot;Default Style&quot;&gt;\n&lt;link href=&quot;fancy.css&quot; rel=&quot;alternate stylesheet&quot; title=&quot;Fancy&quot;&gt;\n&lt;link href=&quot;basic.css&quot; rel=&quot;alternate stylesheet&quot; title=&quot;Basic&quot;&gt;\n","&lt;script&gt;\nfunction sheetLoaded() {\n  // Do something interesting; the sheet has been loaded\n}\n\nfunction sheetError() {\n  alert(&quot;An error occurred loading the stylesheet!&quot;);\n}\n&lt;/script&gt;\n\n&lt;link rel=&quot;stylesheet&quot; href=&quot;mystylesheet.css&quot; onload=&quot;sheetLoaded()&quot; onerror=&quot;sheetError()&quot;&gt;\n"]},{"name":"main","summary":"O elemento <strong><code>&lt;main&gt;</code></strong><code> define o conteúdo principal dentro do </code><a href=\"/pt-BR/docs/Web/HTML/Element/body\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;body&gt;</code></a> em seu documento ou aplicação. Entende-se como conteúdo principal aquele relacionado diretamente com o tópico central da página ou com a funcionalidade central da aplicação. O mesmo deverá ser único na página, ou seja, dentro do elemento &lt;main&gt; não deverão ser incluidas seções da página que sejam comuns a todo o site ou aplicação, tais como mecanismos de navegação, informações de copyright, logotipo e campos de busca<code> </code><span id=\"result_box\" lang=\"pt\"><span class=\"hps\">(a não ser</span><span>, é claro,</span>  caso <span class=\"hps\">a função principal do</span> <span class=\"hps\">documento</span> <span class=\"hps\">seja</span><span class=\"hps\">  fazer algum tipo de busca</span><span class=\"hps\">).</span></span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/main","examples":["&lt;!-- outro conte&#xFA;do --&gt;\n\n&lt;main&gt;\n  &lt;h1&gt;Ma&#xE7;&#xE3;s&lt;/h1&gt;\n  &lt;p&gt;A ma&#xE7;&#xE3; &#xE9; a fruta pom&#xE1;cea da macieira.&lt;/p&gt;\n  \n  &lt;article&gt;\n    &lt;h2&gt;Vermelho delicioso&lt;/h2&gt;\n    &lt;p&gt;Estas ma&#xE7;&#xE3;s vermelhas brilhantes s&#xE3;o as mais comumente encontradas em muitos supermercados.&lt;/p&gt;\n    &lt;p&gt;... &lt;/p&gt;\n    &lt;p&gt;... &lt;/p&gt;\n  &lt;/article&gt;\n\n  &lt;article&gt;\n    &lt;h2&gt;Granny Smith&lt;/h2&gt;\n    &lt;p&gt;Essas suculentas ma&#xE7;&#xE3;s verdes, s&#xE3;o um &#xF3;timo recheio para torta de ma&#xE7;&#xE3;.&lt;/p&gt;\n    &lt;p&gt;... &lt;/p&gt;\n    &lt;p&gt;... &lt;/p&gt;\n  &lt;/article&gt;\n\n&lt;/main&gt;\n\n&lt;!-- outro conte&#xFA;do --&gt;"]},{"name":"map","summary":"O <strong>HTML <code>&lt;map&gt;</code> elemento</strong> é usado com <a href=\"/pt-BR/docs/HTML/Element/area\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;area&gt;</code></a> elementos para definir um mapa de imagem (a área link clicável).","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/map","examples":["&lt;map&gt;\n&#xA0;&#xA0;&lt;area shape=&quot;circle&quot; coords=&quot;200,250,25&quot; href=&quot;another.htm&quot; /&gt;\n&#xA0;&#xA0;&lt;area shape=&quot;default&quot; /&gt;\n&lt;/ Map&gt;\n"]},{"name":"mark","summary":"O <strong>Elemento HMTL <code>&lt;mark&gt;</code> </strong> representa um trecho de destaque em um texto, por exemplo, uma sequência de texto marcado como referência, devido à sua relevância em um contexto particular. Por Exemplo, pode ser utilizado em uma página que mostra os resultados de uma busca onde todas as instâncias da palavra pesquisadas receberam destaque.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/mark","examples":["&lt;p&gt;The &amp;lt;mark&amp;gt; element is used to &lt;mark&gt;highlight&lt;/mark&gt; text&lt;/p&gt; \n"]},{"name":"marquee","summary":"O elemento HTML <span style=\"font-family: 'Courier New', 'Andale Mono', monospace; line-height: 1.5;\">&lt;marquee&gt; é usado para inserir uma área de rolagem de texto.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/marquee","examples":["&lt;marquee&gt;Este texto ser&#xE1; rolado da esqueda para direita&lt;/marquee&gt;\n\n&lt;marquee direction=&quot;up&quot;&gt;Este texto ser&#xE1; rolado de cima para baixo&lt;/marquee&gt;\n\n&lt;marquee direction=&quot;down&quot; width=&quot;250&quot; height=&quot;200&quot; behavior=&quot;alternate&quot; style=&quot;border:solid&quot;&gt;\n  &lt;marquee behavior=&quot;alternate&quot;&gt;\n    Este texto vai retornar a sua posi&#xE7;&#xE3;o original.\n  &lt;/marquee&gt;\n&lt;/marquee&gt;"]},{"name":"nobr","summary":"<code><font face=\"Open Sans, sans-serif\">O elemento HTML </font>&lt;nobr&gt;</code> previne que um texto quebre em uma nova linha automaticamente, de forma que ele seja exibido em uma única grande linha, podendo tornar o <em>scroll</em> (horizontal) necessário. Esta tag não é padrão HTML e não deve ser usada.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/nobr","examples":[]},{"name":"noscript","summary":"O <strong>Elemento HTML <code>&lt;noscript&gt;</code></strong> define uma seção de html a ser inserida em um typo de script não suportado pela página ou se o script está desativado no navegador.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/noscript","examples":["&lt;noscript&gt;\n  &lt;!-- anchor linking to external file --&gt;\n  &lt;a href=&quot;http://www.mozilla.com/&quot;&gt;External Link&lt;/a&gt;\n&lt;/noscript&gt;\n&lt;p&gt;Rocks!&lt;/p&gt;\n"]},{"name":"ol","summary":"O <strong>Elemento HTML  &lt;ol&gt;</strong>  (ou <em>HTML Elemento de lista ordenada</em>) representa uma lista ordenada de itens.  Tipicamente, listas ordenandas de items são mostradas com um número precente, o qual pode ser de qualquer tipo, como números, letras, numeros romanos ou ainda simples símbolos. Esse estilo numerado não é definido no html da página, mas sim no CSS associado, usando a propriedade <a href=\"/pt-BR/docs/Web/CSS/list-style-type\" title=\"The documentation about this has not yet been written; please consider contributing!\"><code>list-style-type</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/ol","examples":[]},{"name":"optgroup","summary":"Em um Formulário Web, o elemento HTML <code>&lt;optgroup&gt;</code> cria um agrupamento de opções dentro do elemento <a href=\"/pt-BR/docs/HTML/Element/select\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;select&gt;</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/optgroup","examples":["&lt;select&gt;\n  &lt;optgroup label=&quot;Grupo 1&quot;&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 1.1&lt;/option&gt;\n  &lt;/optgroup&gt; \n  &lt;optgroup label=&quot;Grupo 2&quot;&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 2.1&lt;/option&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 2.2&lt;/option&gt;\n  &lt;/optgroup&gt;\n  &lt;optgroup label=&quot;Grupo 3&quot; disabled&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 3.1&lt;/option&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 3.2&lt;/option&gt;\n    &lt;option&gt;Op&#xE7;&#xE3;o 3.3&lt;/option&gt;\n  &lt;/optgroup&gt;\n&lt;/select&gt;\n"]},{"name":"option","summary":"Em um formulário Web, o <strong>elemento HTML</strong> <code>&lt;option&gt;</code> é usado para criar um controle que representa um item dentro de um elemento HTML5 <a href=\"/pt-BR/docs/Web/HTML/Element/select\" title=\"O elemento HTML select&#xA0;(&lt;select&gt;) representa um controle que apresenta um menu de op&#xE7;&#xF5;es. As op&#xE7;&#xF5;es dentro do menu s&#xE3;o representadas pelo elemento&#xA0;&lt;option&gt;, que podem ser agrupados por elementos&#xA0;&lt;optgroup&gt;. As op&#xE7;&#xF5;es podem ser pr&#xE9;-selecionadas para o usu&#xE1;rio.\"><code>&lt;select&gt;</code></a>, <a href=\"/pt-BR/docs/Web/HTML/Element/optgroup\" title=\"Em um Formul&#xE1;rio Web, o elemento HTML &lt;optgroup&gt; cria um agrupamento de op&#xE7;&#xF5;es dentro do elemento &lt;select&gt;.\"><code>&lt;optgroup&gt;</code></a> ou <a href=\"/pt-BR/docs/Web/HTML/Element/datalist\" title=\"O elemento HTML Datalist (&lt;datalist&gt;) cont&#xE9;m um conjunto de elementos &lt;option&gt; que representam as op&#xE7;&#xF5;es poss&#xED;veis para o valor de outros controles.\"><code>&lt;datalist&gt;</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/option","examples":[]},{"name":"p","summary":"The <strong>HTML <code>&lt;p&gt;</code> element</strong> <em>(</em>or <em>HTML Paragraph Element)</em> represents a paragraph of text.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/p","examples":["&lt;p&gt;This is the first paragraph of text. This is the first paragraph of text.\n  This is the first paragraph of text. This is the first paragraph of text.&lt;/p&gt;\n\n&lt;p&gt;This is second paragraph of text. This is second paragraph of text.\n   This is second paragraph of text. This is second paragraph of text.&lt;/p&gt;\n"]},{"name":"pre","summary":"<em>HTML Preformatted Text</em> (<strong>&lt;pre&gt;</strong>) é a tag utilizada para representar texto pré-formatado. Um texto dentro desse elemento é tipicamente exibido em uma fonte não proporcional da mesma maneira em que o texto original foi disposto no arquivo. Espaços em branco são mantidos no texto da mesma forma em que este foi digitado.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/pre","examples":[]},{"name":"rt","summary":"The <strong>HTML <code>&lt;rt&gt;</code> Element</strong> embraces pronunciation of character presented in a ruby annotations, which are for showing pronunciation of East Asian characters and the <code>&lt;rt&gt;</code> element is used inside of <a href=\"/pt-BR/docs/HTML/Element/ruby\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;ruby&gt;</code></a> element.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/rt","examples":[]},{"name":"ruby","summary":"O <strong>elemento</strong> <strong>HTML <code>&lt;ruby&gt;</code> </strong> representa uma anotação ruby. Anotações ruby são para mostrar a pronúncia de caracteres do Leste Asiático","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/ruby","examples":[]},{"name":"section","summary":"O elemento HTML section(<section>) representa uma seção generica de um documento, isto é um agrupamento temático de conteúdos, tipicamente com um título. Cada <section> deve ser identificada, tipicamente incluindo um título (elemento <code><a href=\"http://www.w3.org/html/wg/drafts/html/master/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements\">h1</a></code>-<code><a href=\"http://www.w3.org/html/wg/drafts/html/master/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements\">h6</a>) </code>como um filho do elemento &lt;section&gt;.<br/>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/section","examples":["&lt;section&gt;\n  &lt;h1&gt;Heading&lt;/h1&gt;\n  &lt;p&gt;Bunch of awesome content&lt;/p&gt;\n&lt;/section&gt;\n"]},{"name":"select","summary":"O elemento HTML <em>select</em> (&lt;select&gt;) representa um controle que apresenta um menu de opções. As opções dentro do menu são representadas pelo elemento <span style=\"font-family: 'Courier New', 'Andale Mono', monospace; line-height: 1.5;\"><a href=\"/pt-BR/docs/Web/HTML/Element/option\" title=\"Em um formulário Web, o element HTML &lt;option&gt; é usado para criar um controle que representa um item dentro de um elemento HTML5 &lt;select&gt;, &lt;optgroup&gt; ou  &lt;datalist&gt;.\"><code>&lt;option&gt;</code></a></span>, que podem ser agrupados por elementos<span style=\"line-height: 1.5;\"> </span><code style=\"font-style: normal; line-height: 1.5;\"><a href=\"/pt-BR/docs/Web/HTML/Element/optgroup\" title=\"Em um Formulário Web, o elemento HTML &lt;optgroup&gt; cria um agrupamento de opções dentro do elemento &lt;select&gt;.\"><code>&lt;optgroup&gt;</code></a></code><span style=\"line-height: 1.5;\">. As opções podem ser pré-selecionadas para o usuário.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/select","examples":["&lt;!-- O segundo valor estar&#xE1; selecionado inicialmente --&gt;\n&lt;select name=&quot;select&quot;&gt;\n&#xA0; &lt;option value=&quot;valor1&quot;&gt;Valor 1&lt;/option&gt; \n&#xA0;&#xA0;&lt;option value=&quot;valor2&quot; selected&gt;Valor 2&lt;/option&gt;\n&#xA0; &lt;option value=&quot;valor3&quot;&gt;Valor 3&lt;/option&gt;\n&lt;/select&gt;\n"]},{"name":"span","summary":"O elemento <strong>HTML <code>&lt;span&gt;</code> é um conteiner generico em linha para conteúdo fraseado </strong>, que não representa nada por natureza. Ele pode ser usado para agrupar elementos para fins de estilo (usando os atributos <code>class</code> ou <code>id</code> ), ou para compartilhar valores de atributos como <code>lang</code>. Ele deve ser usado somente quando nenhum outro elemento semântico for apropriado. <code>&lt;span&gt;</code> é muito parecido com o elemento <a href=\"/pt-BR/docs/HTML/Element/div\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;div&gt;</code></a> , entretando  <a href=\"/pt-BR/docs/HTML/Element/div\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;div&gt;</code></a> é um elemento de nível de bloco enquanto <code>&lt;span&gt;</code> é um elemento em linha.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/span","examples":[]},{"name":"style","summary":"<span id=\"ouHighlight__0_2TO0_0\">O</span><span id=\"noHighlight_0.1750939046200588\"> </span><strong><span id=\"ouHighlight__9_15TO7_13\">elemento HTML &lt;style&gt;</span></strong><span id=\"noHighlight_0.8079549119676314\"> </span><span id=\"ouHighlight__25_32TO23_28\">contém</span><span id=\"noHighlight_0.0421581815387565\"> </span><span id=\"ouHighlight__40_50TO30_40\">informações</span><span id=\"noHighlight_0.25522005222047533\"> de </span><span id=\"ouHighlight__34_38TO45_50\">estilo</span><span id=\"noHighlight_0.8209890781977366\"> </span><span id=\"ouHighlight__52_54TO52_55\">para</span><span id=\"noHighlight_0.5883082522572468\"> </span><span id=\"ouHighlight__56_56TO57_58\">um</span><span id=\"noHighlight_0.2588224459451632\"> </span><span id=\"ouHighlight__58_65TO60_68\">documento</span><span id=\"noHighlight_0.7118265581909791\"> </span><span id=\"ouHighlight__68_69TO70_71\">ou</span><span id=\"noHighlight_0.8287466668843697\"> </span><span id=\"ouHighlight__71_71TO73_75\">uma</span><span id=\"noHighlight_0.39376658311892987\"> </span><span id=\"ouHighlight__73_76TO77_81\">parte</span><span id=\"noHighlight_0.8630187689455433\"> </span><span id=\"ouHighlight__78_79TO83_84\">do</span><span id=\"noHighlight_0.40389604768470954\"> </span><span id=\"ouHighlight__81_88TO86_94\">documento</span><span id=\"noHighlight_0.9271558521836898\">.</span> <span id=\"ouHighlight__0_2TO0_1\">As</span><span id=\"noHighlight_0.01947156645811987\"> </span><span id=\"ouHighlight__19_29TO3_13\">informações</span><span id=\"noHighlight_0.6308358281341976\"> de </span><span id=\"ouHighlight__13_17TO18_23\">estilo</span><span id=\"noHighlight_0.7819626952353096\"> </span><span id=\"ouHighlight__4_11TO25_34\">específico</span><span id=\"noHighlight_0.037122023106831326\"> </span><span id=\"ouHighlight__31_32TO36_40\">estão</span><span id=\"noHighlight_0.5142985590356746\"> </span><span id=\"ouHighlight__34_42TO42_49\">contidas</span><span id=\"noHighlight_0.711229095635556\"> </span><span id=\"ouHighlight__44_52TO51_56\">dentro</span><span id=\"noHighlight_0.24112451117868316\"> </span><span id=\"ouHighlight__54_57TO58_62\">deste</span><span id=\"noHighlight_0.9213975894944808\"> </span><span id=\"ouHighlight__59_65TO64_71\">elemento</span><span id=\"noHighlight_0.8329735359180445\">,</span><span id=\"noHighlight_0.8298143863599811\"> </span><span id=\"ouHighlight__68_74TO74_83\">geralmente</span><span id=\"noHighlight_0.5711213807667961\"> </span><span id=\"ouHighlight__76_77TO85_86\">no</span> <a href=\"/en-US/docs/Web/CSS\">CSS</a>.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/style","examples":["&lt;style type=&quot;text/css&quot;&gt;\nbody {\n  color:red;\n}\n&lt;/style&gt; \n","&lt;article&gt;\n  &lt;div&gt;The scoped attribute allows for you to include style elements mid-document.\n   Inside rules only apply to the parent element.&lt;/div&gt;\n  &lt;p&gt;This text should be black. If it is red your browser does not support the scoped attribute.&lt;/p&gt;\n  &lt;section&gt;\n    &lt;style scoped&gt;\n      p { color: red; }\n    &lt;/style&gt;\n    &lt;p&gt;This should be red.&lt;/p&gt;\n  &lt;/section&gt;\n&lt;/article&gt;\n"]},{"name":"table","summary":"O elemento HTML <em>Table</em><em> </em><span style=\"line-height: 1.5;\">(</span><code style=\"font-size: 14px;\">&lt;table&gt;</code><span style=\"line-height: 1.5;\">) representa dados em duas dimensões ou mais.</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/table","examples":[]},{"name":"td","summary":"A<em> celula da tabela</em> <a> HTML </a> elemento (<strong><code>&lt;td&gt;</code></strong>) define uma célula de uma tabela que contém os dados. Participa no <em>model</em>o da tabela.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/td","examples":[]},{"name":"time","summary":"O elemento HTML <em>time</em> <span style=\"line-height: inherit;\">(</span><code style=\"font-size: 14px; line-height: inherit;\">&lt;time&gt;</code><span style=\"line-height: inherit;\">) representa o tempo tanto no formato de 24 horas ou como uma data precisa no calendário Gregoriano (com informações </span><span style=\"line-height: inherit;\">opcionais </span><span style=\"line-height: inherit;\">de tempo e fuso horário)</span>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/time","examples":[]},{"name":"title","summary":"O <strong>elemento HTML </strong><code>&lt;title&gt;</code> (<em>Elemento HTML Título</em>) define o título do documento, mostrado na barra de título de um navegador ou na aba da página. Pode conter somente texto e quisquer marcações contidas no texto não são interpretadas.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/title","examples":["&lt;title&gt;T&#xED;tulo incr&#xED;vel&lt;/title&gt;\n"]},{"name":"var","summary":"O elemento HTML Variable (<code>&lt;var&gt;</code>) representa uma variável em uma expressão matemática ou um contexto de programação.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/var","examples":["&lt;p&gt; A simple equation: &lt;var&gt;x&lt;/var&gt; = &lt;var&gt;y&lt;/var&gt; + 2 &lt;/p&gt;\n"]},{"name":"wbr","summary":"<font><font>A </font></font><em><font><font>Palavra Pausa opportunit </font></font></em><em><font><font>y</font></font></em><font><font> ( </font></font><code><font><font>&lt;wbr&gt;</font></font></code><font><font> elemento HTML) representa uma posição no texto onde o navegador pode, opcionalmente, quebrar uma linha, embora suas regras de quebra de linha de outra forma não criar uma ruptura naquele local.</font></font>","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/wbr","examples":["&lt;p&gt;http://this&lt;wbr&gt;.is&lt;wbr&gt;.a&lt;wbr&gt;.really&lt;wbr&gt;.long&lt;wbr&gt;.example&lt;wbr&gt;.com/With&lt;wbr&gt;/deeper&lt;wbr&gt;/level&lt;wbr&gt;/pages&lt;wbr&gt;/deeper&lt;wbr&gt;/level&lt;wbr&gt;/pages&lt;wbr&gt;/deeper&lt;wbr&gt;/level&lt;wbr&gt;/pages&lt;wbr&gt;/deeper&lt;wbr&gt;/level&lt;wbr&gt;/pages&lt;wbr&gt;/deeper&lt;wbr&gt;/level&lt;wbr&gt;/pages&lt;/p&gt;\n"]},{"name":"Heading_Elements","summary":"Elementos de<strong> cabeçalho</strong> são implementados em seis níveis, <code>&lt;h1&gt;</code> é o mais importante e <code>&lt;h6&gt;</code> é o de menor importância. Um elemento de cabeçalho descreve brevemente o tópico da seção em que ele está. As informações de cabeçalho podem ser usadas por agentes de usuário, por exemplo, para construir uma tabela de conteúdos para um documento automaticamente.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/Heading_Elements","examples":["&lt;h1&gt;Cabe&#xE7;alho n&#xED;vel 1&lt;/h1&gt;\n&lt;h2&gt;Cabe&#xE7;alho n&#xED;vel 2&lt;/h2&gt;\n&lt;h3&gt;Cabe&#xE7;alho n&#xED;vel 3&lt;/h3&gt;\n&lt;h4&gt;Cabe&#xE7;alho n&#xED;vel 4&lt;/h4&gt;\n&lt;h5&gt;Cabe&#xE7;alho n&#xED;vel 5&lt;/h5&gt;\n&lt;h6&gt;Cabe&#xE7;alho n&#xED;vel 6&lt;/h6&gt;\n","&lt;h1&gt;Elementos de cabe&#xE7;alho&lt;/h1&gt;\n&lt;h2&gt;Sum&#xE1;rio&lt;/h2&gt;\n&lt;p&gt;Algum texto aqui...&lt;/p&gt;\n\n&lt;h2&gt;Exemplos&lt;/h2&gt;\n&lt;h3&gt;Exemplo 1&lt;/h3&gt;\n&lt;p&gt;Algum texto aqui...&lt;/p&gt;\n\n&lt;h3&gt;Exemplo 2&lt;/h3&gt;\n&lt;p&gt;Algum texto aqui...&lt;/p&gt;\n\n&lt;h2&gt;Veja tamb&#xE9;m&lt;/h2&gt;\n&lt;p&gt;Algum texto aqui...&lt;/p&gt;\n"]},{"name":"Output","summary":"O elemento saída (<output>) representa o resultado de um cálculo.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/Output","examples":["&lt;form oninput=&quot;result.value=parseInt(a.value)+parseInt(b.value)&quot;&gt;\n0&lt;input type=&quot;range&quot; name=&quot;b&quot; value=&quot;50&quot; /&gt;100 +&lt;input type=&quot;number&quot; name=&quot;a&quot; value=&quot;10&quot; /&gt; =\n&lt;output name=&quot;result&quot;&gt;&lt;/output&gt;\n&lt;/form&gt;\n"]},{"name":"article","summary":"O <em>Elemento HTML Article</em> (<span style=\"font-family: Courier New;\">&lt;article&gt;</span>) representa uma composição independente em um documento, página, aplicação, ou site, ou que é destinado á ser distribuido de forma independente ou reutilizável, por exemplo, em sindicação. Este poderia ser o post de um fórum, um artigo de revista ou jornal, um post de um blog, um comentário enviado por um usuário, um gadget ou widget interativos, ou qualquer outra forma de conteúdo independente.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/article","examples":["&lt;article&gt;\n  &lt;h4&gt;Um artigo realmente impressionante&lt;/h4&gt;\n  &lt;p&gt;Lotes de texto incr&#xED;vel.&lt;/p&gt;\n&lt;/article&gt;\n"]},{"name":"Audio","summary":"O elemento <code>audio</code> é utilizado para embutir conteúdo de som em um documento HTML ou XHTML.O elemento <code>audio</code> foi adicionado como parte do HTML5.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/Audio","examples":[]},{"name":"canvas","summary":"O elemento HTML <em>Canvas</em> (<code>&lt;canvas&gt;</code>) pode ser utilizado para desenhar gráficos utilizando scripts (geralmente <a href=\"/en/JavaScript\" title=\"en/JavaScript\">JavaScript</a>). Por exemplo, além de desenhar gráficos, ele pode ser usado para fazer composições de fotos e também para animações. Você poderá colocar conteúdos alternativos dentro do bloco <code>&lt;canvas&gt;</code>. Este conteúdo será renderizado também em navegadores antigos e em navegadores com JavaScript desabilitado.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/canvas","examples":["&lt;<span class=\"start-tag\">canvas</span><span class=\"attribute-name\"> id</span>=<span class=\"attribute-value\">&quot;canvas&quot; </span><span class=\"attribute-name\">width</span>=<span class=\"attribute-value\">&quot;300&quot; </span><span class=\"attribute-name\">height</span>=<span class=\"attribute-value\">&quot;300&quot;</span>&gt;\n  Desculpe, seu navegador n&#xE3;o suporta o elemento &amp;<span class=\"entity\">lt;</span>canvas&amp;<span class=\"entity\">gt;</span>.\n&lt;/<span class=\"end-tag\">canvas</span>&gt;\n"]},{"name":"command","summary":"O elemento <code>command </code>representa um comando que o usuário pode chamar.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/command","examples":["&lt;command type=&quot;command&quot; label=&quot;Save&quot; icon=&quot;icons/save.png&quot; onclick=&quot;save()&quot;&gt;\n"]},{"name":"datalist","summary":"O elemento HTML <em>Datalist</em> (<span style=\"font-family: Courier New;\">&lt;datalist&gt;</span>) contém um conjunto de elementos <a href=\"/pt-BR/docs/HTML/Element/option\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;option&gt;</code></a> que representam as opções possíveis para o valor de outros controles.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/datalist","examples":["&lt;input list=&quot;browsers&quot; /&gt;\n&lt;datalist id=&quot;browsers&quot;&gt;\n  &lt;option value=&quot;Chrome&quot;&gt;\n  &lt;option value=&quot;Firefox&quot;&gt;\n  &lt;option value=&quot;Internet Explorer&quot;&gt;\n  &lt;option value=&quot;Opera&quot;&gt;\n  &lt;option value=&quot;Safari&quot;&gt;\n&lt;/datalist&gt;\n"]},{"name":"details","summary":"O elemento HTML <em>details</em> (<code>&lt;details&gt;</code>) é usado como uma ferramenta de onde o usuário irá obter informações adicionais.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/details","examples":["&lt;details&gt;\n  &lt;summary&gt;Alguns detalhes&lt;/summary&gt;\n  &lt;p&gt;Mais informa&#xE7;&#xF5;es sobre os detalhes.&lt;/p&gt;\n&lt;/details&gt;\n"]},{"name":"dl","summary":"O elemento HTML <em>Definition List</em><span style=\"line-height: 21px;\"> (</span><code style=\"color: rgb(51, 51, 51); font-size: 14px; line-height: 21px;\">&lt;dl&gt;</code><span style=\"line-height: 21px;\">)</span> engloba uma lista de pares de termos e descrições. Um uso comum para este elemento é para implementar um glossário ou exibir metadados(uma lista de pares chave e valor).","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dl","examples":["&lt;dl&gt;\n  &lt;dt&gt;Firefox&lt;/dt&gt;\n  &lt;dd&gt;A free, open source, cross-platform, graphical web browser\n      developed by the Mozilla Corporation and hundreds of volunteers.&lt;/dd&gt;\n\n  &lt;!-- other terms and definitions --&gt;\n&lt;/dl&gt;\n","&lt;dl&gt;\n  &lt;dt&gt;Firefox&lt;/dt&gt;\n  &lt;dt&gt;Mozilla Firefox&lt;/dt&gt;\n  &lt;dt&gt;Fx&lt;/dt&gt;\n  &lt;dd&gt;A free, open source, cross-platform, graphical web browser\n      developed by the Mozilla Corporation and hundreds of volunteers.&lt;/dd&gt;\n\n  &lt;!-- other terms and definitions --&gt;\n&lt;/dl&gt;\n","&lt;dl&gt;\n  &lt;dt&gt;Firefox&lt;/dt&gt;\n  &lt;dd&gt;A free, open source, cross-platform, graphical web browser\n      developed by the Mozilla Corporation and hundreds of volunteers.&lt;/dd&gt;\n  &lt;dd&gt;The Red Panda also known as the Lesser Panda, Wah, Bear Cat or Firefox,\n      is a mostly herbivorous mammal, slightly larger than a domestic cat\n      (60 cm long).&lt;/dd&gt;\n\n  &lt;!-- other terms and definitions --&gt;\n&lt;/dl&gt;\n"]},{"name":"footer","summary":"O elemento HTML de Rodapé (<footer>) representa um rodapé para o seu sectioning content (conteúdo de seção) mais próximo ou <a href=\"https://developer.mozilla.org/en-US/docs/Sections_and_Outlines_of_an_HTML5_document#sectioning_root\" title=\"Sections and Outlines of an HTML5 document#sectioning root\">sectioning root</a> elemento (ou seja, seu parente mais próximo <a href=\"/pt-BR/docs/HTML/Element/article\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;article&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/aside\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;aside&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/nav\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;nav&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/section\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;section&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/blockquote\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;blockquote&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/body\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;body&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/details\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;details&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/fieldset\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;fieldset&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/figure\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;figure&gt;</code></a>, <a href=\"/pt-BR/docs/HTML/Element/td\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;td&gt;</code></a>). Normalmente um rodapé contém informações sobre o autor da seção de dados, direitos autorais ou links para documentos relacionados.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/footer","examples":["&lt;footer&gt;\n  Algumas informa&#xE7;&#xF5;es de copyright ou talvez alguma informa&#xE7;&#xE3;o do autor de um &lt;article&gt;?\n&lt;/footer&gt; \n"]},{"name":"forma","summary":"form","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/forma","examples":[]},{"name":"header","summary":"O <strong>elemento HTML</strong> <strong><code>&lt;header&gt;</code> </strong>representa um grupo de suporte introdutório ou navegacional. Pode conter alguns elementos de cabeçalho mas também outros elementos como um logo, seções de cabeçalho, formulário de pesquisa, e outros.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/header","examples":["&lt;header&gt;\n&#xA0; Talvez um logo?\n&lt;/header&gt; \n"]},{"name":"meter","summary":"O elemento HTML <em>meter</em> (<code>&lt;meter&gt;</code>) pode representar um valor escalar dentro de um intervalo conhecido ou um valor fracionário.","url":"https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/meter","examples":["&lt;p&gt;Aque&#xE7;a o forno para &lt;meter min=&quot;200&quot; max=&quot;500&quot; value=&quot;350&quot;&gt;350 graus&lt;/meter&gt;.&lt;/p&gt;\n","&lt;p&gt;Ele recebeu &lt;meter low=&quot;69&quot; high=&quot;80&quot; max=&quot;100&quot; value=&quot;84&quot;&gt;B&lt;/meter&gt; no exame.&lt;/p&gt;\n"]},{"name":"nav","summary":"O <em>Elemento </em><em>HTML </em><em>de Navegação</em> (<code>&lt;nav&gt;</code>) representa uma seção de uma página que aponta para outras páginas ou para outras áreas da página, ou seja, uma seção com links de navegação.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/nav","examples":["&lt;nav&gt;\n&#xA0; &lt;ul&gt;\n&#xA0;&#xA0;&#xA0; &lt;li&gt;&lt;a href=&quot;#&quot;&gt;P&#xE1;gina inicial&lt;/a&gt;&lt;/li&gt;\n&#xA0;&#xA0;&#xA0; &lt;li&gt;&lt;a href=&quot;#&quot;&gt;Sobre&lt;/a&gt;&lt;/li&gt;\n&#xA0;&#xA0;&#xA0; &lt;li&gt;&lt;a href=&quot;#&quot;&gt;Contato&lt;/a&gt;&lt;/li&gt;\n&#xA0; &lt;/ul&gt;\n&lt;/nav&gt; \n"]},{"name":"progress","summary":"o elemento HTML progress (<progress>) é usado para visualizar o progresso de uma tarefa. Embora as especifidades de como é mostrado ficam a cargo do desenvolvedor, tipicamente, é mostrado como uma barra de progresso.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/progress","examples":["&lt;progress value=&quot;70&quot; max=&quot;100&quot;&gt;70 %&lt;/progress&gt;\n"]},{"name":"Source","summary":"O elemento <code>source</code> é utilizado para especificar múltiplos recursos de mídia de elementos <code> audio</code> e <code>video</code> em HTML5. É um elemento vazio. É normalmente usado para disponibilizar <a href=\"/En/Media_formats_supported_by_the_audio_and_video_elements\" title=\"En/Media formats supported by the audio and video elements\">multiple formats supported by different browsers</a>.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/Source","examples":["&lt;video controls&gt;\n  &lt;source src=&quot;foo.ogg&quot; type=&quot;video/ogg&quot;&gt; &lt;!-- Escolhido pelo Firefox --&gt;\n  &lt;source src=&quot;foo.mov&quot; type=&quot;video/quicktime&quot;&gt; &lt;!-- Escolhido pelo Safari --&gt;\n&#xA0; Desculpa; seu navegador n&#xE3;o &#xE9; compat&#xED;vel com v&#xED;deo em HTML5.\n&lt;/video&gt;\n"]},{"name":"summary","summary":"O elemento HTML <em>summary</em> (<code>&lt;summary&gt;</code>) é utilizado como um sumário ou legenda para o conteúdo de um elemento <a href=\"/pt-BR/docs/HTML/Element/details\" title=\"This article hasn't been written yet. Please consider contributing!\"><code>&lt;details&gt;</code></a>.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/summary","examples":[]},{"name":"Video","summary":"O elemento HTML  <code>&lt;video&gt;</code> é utilizado para incorporar conteúdo de vídeo em um documento HTML ou XHTML.","url":"https://developer.mozilla.org/pt-BR/docs/HTML/Element/Video","examples":["&lt;!-- Exemplo simples de v&#xED;deo --&gt;\n&lt;video src=&quot;arquivovideo.ogg&quot; autoplay poster=&quot;imagemprevia.jpg&quot;&gt;\n&#xA0; Desculpa, o seu navegador n&#xE3;o suporta v&#xED;deos incorporados, \n&#xA0; mas voc&#xEA; pode &lt;a href=&quot;videofile.ogg&quot;&gt;baix&#xE1;-lo&lt;/a&gt;\n&#xA0; e assistir pelo se reprodutor de m&#xED;dia favorito!\n&lt;/video&gt;\n\n&lt;!-- V&#xED;deo com legendas --&gt;\n&lt;video src=&quot;foo.ogg&quot;&gt;\n&#xA0; &lt;track kind=&quot;subtitles&quot; src=&quot;foo.en.vtt&quot; srclang=&quot;en&quot; label=&quot;English&quot;&gt;\n&#xA0; &lt;track kind=&quot;subtitles&quot; src=&quot;foo.sv.vtt&quot; srclang=&quot;sv&quot; label=&quot;Svenska&quot;&gt;\n&lt;/video&gt;\n"]}]
},{}],34:[function(require,module,exports){
// own
const aux = require('../../auxiliary');

const MOUSE_POSITION_CHANGE = 'mouse-position-change';
const MIME_TYPE = 'text/html';

module.exports = function (fileEditor, options) {

  /**
   * Holds the last published position object
   * so that same positions are not published.
   */
  var _lastPublishedPosition;

  /**
   * Publishes an event with the position and filepath
   */
  function _publishPosition(eventName, position) {

    if (_lastPublishedPosition &&
      position.row === _lastPublishedPosition.row &&
      position.column === _lastPublishedPosition.column) {
      return;
    }

    var posIsWithinChangeArea = fileEditor.changeManager.isPositionWithinChangeArea(position);

    if (posIsWithinChangeArea) {
      // ignore any cursor movements within a change area.
      return;
    }

    var doc = fileEditor.aceEditor.getSession().getDocument();

    var unsavedChars = fileEditor.changeManager.computeUnsavedCharCount(position);
    var cursorIndex  = doc.positionToIndex(position) - unsavedChars;

    fileEditor.hDev.publish(eventName, {
      f: fileEditor.filepath,
      p: position,
      c: cursorIndex,
      mode: MIME_TYPE,
    });

    // save the _lastPublishedPosition
    _lastPublishedPosition = position;
  }

  /**
   * Executed when the mouse moves on the editor container element
   * @param  {Event} e
   */
  function onContainerMousemove(e) {
    var docPos = aux.aceGetDocPosFromPixelPos(fileEditor.aceEditor, {
      left: e.clientX,
      top: e.clientY
    });

    _publishPosition(MOUSE_POSITION_CHANGE, docPos);
  }

  /**
   * Executed when teh mouse leaves the editor container element
   * @param  {Event} e
   */
  function onContainerMouseleave(e) {
    _publishPosition(MOUSE_POSITION_CHANGE, {});
  }

  var aceEditor    = fileEditor.aceEditor;
  var aceContainer = aceEditor.container;

  aceContainer.addEventListener('mousemove', onContainerMousemove);
  aceContainer.addEventListener('mouseleave', onContainerMouseleave);

  // return the teardown function
  return function teardown() {
    aceContainer.removeEventListener('mousemove', onContainerMousemove);
    aceContainer.removeEventListener('mouseleave', onContainerMouseleave);
  };
}
},{"../../auxiliary":24}],35:[function(require,module,exports){
const Bluebird = require('bluebird');

exports['text/html'] = require('./html');

exports['text/css'] = require('./css');

exports['application/javascript'] = require('./javascript');

exports['text'] = {
  setup: function () {
    return function teardown() {
      
    };
  },
};

},{"./css":29,"./html":32,"./javascript":36,"bluebird":11}],36:[function(require,module,exports){
exports.setup = function () {
  return function teardown() {

  };
};
},{}],37:[function(require,module,exports){
// native dependencies
const util         = require('util');
const EventEmitter = require('events');
const _path        = require('path');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const fsModel = require('./model/fs');
const UiCore  = require('./ui-core');

function HappinessTree(options) {
  if (!options.hDev) { throw new Error('hDev is required'); }
  if (!options.rootName) { throw new Error('rootName is required'); }

  this.hDev      = options.hDev;
  this.rootName = options.rootName;

  /**
   * Instantiate a directory model
   * @type {HFSDir}
   */
  this.rootModel = fsModel({
    name: this.rootName,
    rootPath: this.rootName,
    hDev: this.hDev,
  });

  /**
   * Instantiate a ui core
   * @type {UiCore}
   */
  this.uiCore = new UiCore(this.rootModel);

  var rootModel = this.rootModel;
  var uiCore    = this.uiCore;

  /**
   * Wire model events to the ui core
   */
  rootModel.on('node-added', function (parentNode, node, index) {
    if (node.isBranch) {
      uiCore.addBranch(node, index);
    } else {
      uiCore.addLeaf(node, index);
    }
  });

  rootModel.on('node-removed', function (parentNode, node, index) {
    // as the node was removed it no longer has a reference to its parent
    var nodePath = parentNode.path + '/' + node.name;
    
    uiCore.removeElement(nodePath);
  });

  rootModel.on('node-moved', function (fromNode, toParentNode, node, index) {

    var nodePath = fromNode.path + '/' + node.name;
    var toPath   = node.path;

    uiCore.removeElement(nodePath);

    // re-render the branch/leaf
    if (node.isBranch) {
      uiCore.addBranch(node, index);
    } else {
      uiCore.addLeaf(node, index);
    }
  });

  /**
   * Propagate events from uiCore and rootModel 
   * to the HappinessTree instance
   */
  rootModel.on('node-added', this.emit.bind(this, 'node-added'));
  rootModel.on('node-removed', this.emit.bind(this, 'node-removed'));
  rootModel.on('node-moved', this.emit.bind(this, 'node-moved'));

  /**
   * Load interactions
   */
  require('./interactions/drag-and-drop')(this, rootModel, uiCore, options);
  require('./interactions/click')(this, rootModel, uiCore, options);
  require('./interactions/context-menu')(this, rootModel, uiCore, options);
}

util.inherits(HappinessTree, EventEmitter);

/**
 * Proxy some ui methods
 */
HappinessTree.prototype.uiAddTreeEventListener = function (eventName, elementRole, eventHandler) {
  this.uiCore.addTreeEventListener(eventName, elementRole, eventHandler);
};
HappinessTree.prototype.uiSelect = function (path, options) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiSelectElement(element, options);
};
HappinessTree.prototype.attach = function (containerElement) {
  this.uiCore.attach(containerElement);
};
HappinessTree.prototype.uiToggleBranch = function (path, open) {
  var element = this.uiCore.getElement(path);
  this.uiCore.uiToggleBranchElement(element, open);
};

/**
 * Macro level methods:
 * these methods involve both the tree model and the tree ui
 */

/**
 * Opens the directory.
 *
 * If the path has not been loaded yet,
 * opens all directories before up to the path
 * 
 * @param  {String} path
 * @return {Bluebird}
 */
HappinessTree.prototype.openDirectory = function (path) {
  if (!path && path !== '') { throw new Error('path is required'); }

  if (path === '') {
    // read the root directory contents
    // as the root ui branch is always open, no need of
    // toggling it open
    return this.rootModel.fsRead().then(function () {
      // ensure empty return
      return;
    });
  } else {

    var self = this;

    // retrieve the deepest path that currently exists
    var deepestNodeData = this.rootModel.getDeepestNodeByPath(path);

    var deepestNode        = deepestNodeData.node;
    var remainingPathParts = deepestNodeData.remainingPathParts;

    if (remainingPathParts.length === 0) {
      // target node exists
      // check if is a directory and open it
      if (deepestNode.isBranch) {

        if (deepestNode.status === 'loaded') {
          
          // read succesful,
          // toggle the branch open
          self.uiToggleBranch(deepestNode.path, true);

          return Bluebird.resolve();
        } else {
          
          return deepestNode.fsRead()
            .then(function () {
              
              // read succesful,
              // toggle the branch open
              self.uiToggleBranch(deepestNode.path, true);
            });
        }
      } else {
        console.warn('target node is not a branch');
      }
    } else {
      // target node does not exist
      // loop through remainingPathParts
      
      var _successfullyReadPaths = [];

      function _retrieveNodeContents(node) {
        return node.fsRead().then(function () {
          // read succesful,
          // schedule to toggle it open
          _successfullyReadPaths.push(node.path);

          // return node so that we can chain the promises
          return node;
        });
      }

      // chain of read promises
      return remainingPathParts.reduce(function (parentNodeRead, part) {

        return parentNodeRead.then(function (parentNode) {

          var childNode = parentNode.getChild(part);

          if (!childNode) {
            // not found
            return Bluebird.reject(
              new Error('node `' + parentNode.path + '` does not have a `' + part + '` child')
            );
          } else if (!childNode.isBranch) {
            // found, but not a branch
            return Bluebird.reject(
              new Error('node `' + childNode.path + '` is not a branch')
            );
          } else {
            // read deeper
            return _retrieveNodeContents(childNode);
          }
        })

      }, _retrieveNodeContents(deepestNode))
      .then(function () {
        // all reads succesful
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return;
      })
      .catch(function (err) {
        // read error: open the successful reads and return rejection
        _successfullyReadPaths.forEach(function (path) {
          self.uiToggleBranch(path, true);
        });

        return Bluebird.reject(err);
      });
    }
  }

};

/**
 * Reveals the file and optionally selects it
 * If the file has not been loaded yet,
 * attempts to load it.
 * 
 * @param  {String} path
 * @param  {Object} options
 * @return {Bluebird}
 */
HappinessTree.prototype.revealPath = function (path, options) {
  return this.openDirectory(_path.dirname(path))
    .then(function () {
      this.uiSelect(path, options);
    }.bind(this));
};

module.exports = function (options) {
  return new HappinessTree(options);
};
},{"./interactions/click":38,"./interactions/context-menu":40,"./interactions/drag-and-drop":42,"./model/fs":45,"./ui-core":58,"bluebird":11,"events":23,"path":64,"util":89}],38:[function(require,module,exports){
// third-party
const Bluebird = require('bluebird');

module.exports = function (happinessTree, rootModel, uiCore, options) {
  /**
   * Select on click
   */
  uiCore.addTreeEventListener('click', 'leaf', function (data) {
    var leafEl = data.element;

    uiCore.uiSelectElement(leafEl, {
      // clear previous selection
      clearSelection: true,
    });
  });

  /**
   * Handle click on branch labels
   *
   * Load the branch's child nodes and open.
   * If data is already loaded, simply toggle.
   *
   * @param {Object} data
   *        - path
   *        - element
   */
  uiCore.addTreeEventListener('click', 'branch', function (data) {
    var branchModel = data.model;
    var branchEl    = data.element;
    
    if (branchModel.status !== 'loaded') {

      branchEl.classList.add(uiCore.LOADING);

      branchModel.fsRead()
        .then(function () {
          branchEl.classList.remove(uiCore.LOADING);

          // reveal branch contents
          uiCore.uiToggleBranchElement(branchEl, true);
        })
        .catch(function (err) {
          branchEl.classList.remove(uiCore.LOADING);

          console.warn('there was an error loading', err);
        });
    } else {
      // toggle the branch
      uiCore.uiToggleBranchElement(branchEl);
    }
  });

};

},{"bluebird":11}],39:[function(require,module,exports){
module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for branch context menus
   * @type {Array}
   */
  var BRANCH_MENU_OPTIONS = [
    {
      label: 'new file',
      callback: function (data) {
        data.menuElement.close();

        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            var element = uiCore.getElement(nodeModel.path, 'branch-child-container');

            /////////////////
            // placeholder //
            //
            // TODO: improve the api of creating a element
            // we are currently using a private method (_leafEl)
            var newFilePlacehodler = uiCore._leafEl({ name: 'new-file' });
            newFilePlacehodler.classList.add(uiCore.ENTER);
            var editableLabel = newFilePlacehodler.querySelector('hab-editable-label');

            if (element.childNodes.length > 0) {
              element.insertBefore(newFilePlacehodler, element.childNodes[0]);
            } else {
              element.appendChild(newFilePlacehodler);
            }

            editableLabel.addEventListener('cancel', function () {
              newFilePlacehodler.remove();
            });
            
            editableLabel.edit(function (value) {
              if (value === '') {
                alert('filename must not be empty');
                editableLabel.cancel();

                newFilePlacehodler.remove();
                return;
              }

              nodeModel.fsCreateFile(value)
                .then(function () {
                  newFilePlacehodler.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  newFilePlacehodler.remove();
                });
            });

          });
      }
    },
    {
      label: 'new folder',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        happinessTree.openDirectory(nodeModel.path)
          .then(function () {

            var element = uiCore.getElement(nodeModel.path, 'branch-child-container');

            /////////////////
            // placeholder //
            //
            // TODO: improve the api of creating a element
            // we are currently using a private method (_branchEl)
            var newFilePlacehodler = uiCore._branchEl({ name: 'new-folder' });
            newFilePlacehodler.classList.add(uiCore.ENTER);
            var editableLabel = newFilePlacehodler.querySelector('hab-editable-label');

            if (element.childNodes.length > 0) {
              element.insertBefore(newFilePlacehodler, element.childNodes[0]);
            } else {
              element.appendChild(newFilePlacehodler);
            }

            editableLabel.addEventListener('cancel', function () {
              newFilePlacehodler.remove();
            });

            editableLabel.edit(function (value) {
              if (value === '') {
                alert('filename must not be empty');
                editableLabel.cancel();

                newFilePlacehodler.remove();
                return;
              }

              nodeModel.fsCreateDirectory(value)          
                .then(function () {
                  newFilePlacehodler.remove();
                })
                .catch(function (err) {
                  alert('error creating file');
                  console.warn(err);
                  newFilePlacehodler.remove();
                });
            })
          });
      }
    },
    {
      label: 'rename',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('name must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              alert('error renaming');
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
    },
  ];

  /**
   * Add the dirMenu that were passed
   */
  var _dirMenu;
  if (typeof options.dirMenu === 'function') {
    _dirMenu = options.dirMenu(happinessTree);
  } else if (Array.isArray(options.dirMenu)) {
    _dirMenu = options.dirMenu;
  }
  _dirMenu = _dirMenu || [];

  BRANCH_MENU_OPTIONS = BRANCH_MENU_OPTIONS.concat(_dirMenu);

  var branchMenu = document.createElement('hab-context-menu');
  branchMenu.set('options', BRANCH_MENU_OPTIONS);
  document.body.appendChild(branchMenu);

  uiCore.addTreeEventListener('contextmenu', 'branch', function (data) {

    // prevent default
    data.event.preventDefault();

    // select the branch element
    uiCore.uiSelectElement(data.element, { clearSelection: true });

    // offset the context menu open position
    var left = data.event.clientX + 2;
    var top = data.event.clientY - 2;

    var position = {
      left: left,
      top: top,
    };

    branchMenu.menuOpenWithContext(data.model, position);
  });
};

},{}],40:[function(require,module,exports){
module.exports = function (happinessTree, rootModel, uiCore, options) {
  require('./branch')(happinessTree, rootModel, uiCore, options);
  require('./leaf')(happinessTree, rootModel, uiCore, options);
};

},{"./branch":39,"./leaf":41}],41:[function(require,module,exports){
module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Options for leaf context menus
   * @type {Array}
   */
  var LEAF_MENU_OPTIONS = [
    {
      label: 'rename',
      callback: function (data) {
        data.menuElement.close();
        var nodeModel = data.context;

        var element = uiCore.getElement(nodeModel.path);
        var editableLabel = element.querySelector('hab-editable-label');

        editableLabel.edit(function (value) {
          if (value === '') {
            alert('value must not be empty');
            editableLabel.cancel();

            return;
          }

          return nodeModel.fsRename(value)
            .catch(function (err) {
              alert('error renaming');
              console.warn(err);

              editableLabel.cancel();
            });
        });
      }
    },
  ];

  /**
   * Add the fileMenu that were passed
   */
  var _fileMenu;
  if (typeof options.fileMenu === 'function') {
    _fileMenu = options.fileMenu(happinessTree);
  } else if (Array.isArray(options.fileMenu)) {
    _fileMenu = options.fileMenu;
  }
  _fileMenu = _fileMenu || [];

  LEAF_MENU_OPTIONS = LEAF_MENU_OPTIONS.concat(_fileMenu);

  var leafMenu = document.createElement('hab-context-menu');
  leafMenu.set('options', LEAF_MENU_OPTIONS);
  document.body.appendChild(leafMenu);

  uiCore.addTreeEventListener('contextmenu', 'leaf', function (data) {

    // prevent default
    data.event.preventDefault();
    
    // select the branch element
    uiCore.uiSelectElement(data.element, { clearSelection: true });

    // offset the context menu open position
    var left = data.event.clientX + 3;
    var top = data.event.clientY - 2;

    var position = {
      left: left,
      top: top,
    };

    leafMenu.menuOpenWithContext(data.model, position);
  });
};

},{}],42:[function(require,module,exports){
const DND_FORMAT_NAME = 'text/plain';

module.exports = function (happinessTree, rootModel, uiCore, options) {

  /**
   * Variable that holds data about the current drag interaction.
   * .path refers to the dragged node path
   * .node refers to the dragged node itself
   *
   * It is used to store the dragged node path for use on 
   * 'dragover' events (dragover events do not have access to the dataTransfer's data)
   */
  var _currentDragData = {};

  /**
   * Auxiliary function that clears all drag-related classes from the ui
   * and resets the _currentDragData to null.
   */
  function _clearDrag() {

    // reset drag data
    _currentDragData = {};

    // on dragend, remove all drag-related classes
    var selector = [
      '.' + uiCore.DRAGGING,
      '.' + uiCore.DRAGOVER,
    ].join(',');

    var dragAffectedElements = uiCore.rootElement.parentNode.querySelectorAll(selector);
    
    Array.prototype.forEach.call(dragAffectedElements, function (el) {
      el.classList.remove(uiCore.DRAGGING);
      el.classList.remove(uiCore.DRAGOVER);
    });
  }

  /**
   * Drag start
   */
  uiCore.addTreeEventListener('dragstart', 'leaf', function (data) {
    // console.log('dragstart on leaf', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);
    
    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, _currentDragData.path);
  });

  uiCore.addTreeEventListener('dragstart', 'branch', function (data) {
    // console.log('dragstart on branch', data.element, data.path);
    data.element.classList.add(uiCore.DRAGGING);

    _currentDragData.node = data.model;
    _currentDragData.path = data.model.path;

    data.event.dataTransfer.effectAllowed = 'move';
    data.event.dataTransfer.setData(DND_FORMAT_NAME, _currentDragData.path);
  });

  /**
   * Clear all status on drag end
   */
  uiCore.rootElement.addEventListener('dragend', _clearDrag);
  
  /**
   * Dragover and dragleave
   */
  uiCore.addTreeEventListener(
    'dragover',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {
      /**
       * Dragover: cancel the event, so that we can do drop
       * (weird, but that's how it works according to docs)
       * http://www.html5rocks.com/en/tutorials/dnd/basics/
       */
      if (data.event.preventDefault) {
        data.event.preventDefault(); // Necessary. Allows us to drop.
      }

      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNode = _currentDragData.node;

      if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
        // not allowed
        return;
      } else if (closestBranchModel === draggedNode.parent) {
        // no change
        return;
      } else {
        // we should add the DRAGOVER class to the branch element
        var branchElement = uiCore.getElement(closestBranchModel.path);

        branchElement.classList.add(uiCore.DRAGOVER);
      }
    }
  );

  uiCore.addTreeEventListener(
    'dragleave',
    // listen both on branch and leaf
    ['branch', 'leaf'],
    function (data) {
      // we should remove the DRAGOVER class from the branch element
      var branchElement = uiCore.getElement(data.closestBranchModel.path);
      
      branchElement.classList.remove(uiCore.DRAGOVER);
    }
  );

  /**
   * Drop
   */
  uiCore.addTreeEventListener(
    'drop',
    ['branch-label', 'branch', 'leaf-label', 'leaf'],
    function (data) {
      data.event.stopPropagation(); // stops the browser from redirecting.


      // the destination is related to the event drop target
      var closestBranchModel = data.closestBranchModel;

      // check if the hovered model is the dragged node itself or 
      // if it has the dragged node as an ancestor
      // and prohibit that drop
      var draggedNodePath = data.event.dataTransfer.getData(DND_FORMAT_NAME);
      var draggedNode     = rootModel.getNodeByPath(draggedNodePath);

      if (closestBranchModel.hasAncestor(draggedNode) || closestBranchModel === draggedNode) {
        // not allowed
      } else if (closestBranchModel === draggedNode.parent) {
        // will have no effect, as the dragged node is already at the right position
      } else {

        rootModel.fsMove(draggedNode, closestBranchModel)
          .then(function () {
            _clearDrag();
          })
          .catch(function (err) {
            console.warn(err);
            console.warn(err.stack);

            alert('there was an error moving!');
          });
      }
    }
  );
};

},{}],43:[function(require,module,exports){
const util   = require('util');

const Branch = require('../tree').Branch;
const HFSFile = require('./file');

const DIRECTORY_STATUSES = {
  UNTOUCHED: 'untouched',
  LOADING: 'loading',
  LOADED: 'loaded'
};

const INITIAL_DIR_DATA = {
  collapsed: true,
  status: DIRECTORY_STATUSES.UNTOUCHED,
};

/**
 * Directory model constructor
 * @param {Object} data
 */
function HFSDir(data) {
  Branch.call(this, data);

  if (this.isRoot) {
    this.hDev = data.hDev;

    var rootDir = this;

    // rootDir directory listens to hDev events
    rootDir.hDev.subscribe('file-removed', function (data) {
      rootDir.ensureDoesNotExist('leaf', data.path);
    });

    rootDir.hDev.subscribe('directory-removed', function (data) {
      rootDir.ensureDoesNotExist('branch', data.path);
    });

    rootDir.hDev.subscribe('file-created', function (data) {
      rootDir.ensureExists('leaf', data.path);
    });

    rootDir.hDev.subscribe('directory-created', function (data) {
      rootDir.ensureExists('branch', data.path);
    });
  }

  // set starting statuses
  this.set(INITIAL_DIR_DATA);
}
util.inherits(HFSDir, Branch);

HFSDir.prototype.BranchConstructor = HFSDir;
HFSDir.prototype.LeafConstructor = HFSFile;

/**
 * Loads child nodes of the directory using hDev.readDirectory method.
 * @return {Promise -> undefined}
 */
HFSDir.prototype.fsRead = function () {
  var self = this;

  // the directory path
  var dirPath = this.path;

  self.set('status', DIRECTORY_STATUSES.LOADING);

  return this.root.hDev.readDirectory(dirPath)
    .then(function (contents) {
      // set status to loaded
      self.set('status', DIRECTORY_STATUSES.LOADED);

      // create child nodes
      contents.forEach(function (stat) {

        var childType = stat.isDirectory ? 'branch' : 'leaf';

        // check if the node is already in the tree
        // and try to add the node only if it does not exist
        if (!self.getChild(stat.basename)) {
          self.createChild(childType, stat.basename);
        } else {
          console.warn('ignoring repeated add of ' + stat.basename);
        }
      });

      // start watching the path
      return self.root.hDev.startWatching(dirPath)
        .catch(function (err) {
          console.warn('Non-fatal error upon watching ' + self.filepath, err);
          return;
        });
    });
};

HFSDir.prototype.fsRemove = function () {
  var self = this;

  return this.root.hDev.remove(self.path)
    // .then(function () {
    //   self.parent.ensureDoesNotExist(self.name);
    // });
};

HFSDir.prototype.fsMove = function (node, destBranch) {

  var self = this;

  var srcPath = node.path;
  var destPath = destBranch.path + '/' + node.name;

  return this.root.hDev.move(srcPath, destPath)
    // we now depend upon fs events to move the nodes.
    // TODO: study whether this is required at all.
    // Keep for the moment.
    // .then(function () {
    //   self.moveNode(node.path, destBranch.path);
    // });
};

HFSDir.prototype.fsRename = function (name) {
  var self = this;
  var parent = self.parent;

  var srcPath = this.path;
  var destPath = this.parent.path + '/' + name;

  console.log(srcPath, destPath);

  return this.root.hDev.move(srcPath, destPath)
    // .then(function () {
    //   parent.removeChild(self.name);

    //   self.name = name;

    //   parent.addChild(self);
    // });
};

HFSDir.prototype.fsCreateFile = function (name, contents) {

  var self = this;

  var path = this.path + '/' + name;

  return this.root.hDev.createFile(path, contents)
    // .then(function () {
    //   self.ensureExists('leaf', name);
    // });
};

HFSDir.prototype.fsCreateDirectory = function (name) {

  var self = this;
  var path = this.path + '/' + name;

  return this.root.hDev.createDirectory(path)
    // .then(function () {
    //   self.ensureExists('branch', name, { loaded: true });
    // });
};

module.exports = HFSDir;

},{"../tree":53,"./file":44,"util":89}],44:[function(require,module,exports){
const util = require('util');

const Leaf = require('../tree').Leaf;

const INITIAL_FILE_DATA = {
  selected: false,
  loaded: false
};

// file constructor
function HFSFile(data) {
  Leaf.call(this, data);
  
  // set initial data
  this.set(INITIAL_FILE_DATA);
}

util.inherits(HFSFile, Leaf);

HFSFile.prototype.fsRemove = function () {
  var self = this;

  return this.root.hDev.remove(self.path)
    // .then(function () {
    //   self.parent.ensureDoesNotExist(self.name);
    // });
};

HFSFile.prototype.fsRename = function (name) {
  var self = this;
  var parent = self.parent;

  var srcPath = this.path;
  var destPath = this.parent.path + '/' + name;

  return this.root.hDev.move(srcPath, destPath)
    // .then(function () {
    //   parent.ensureDoesNotExist(self.name);

    //   self.name = name;

    //   parent.addChild(self);
    // });
};

const startingSlashRegExp = /^\//;
const trailingSlashRegExp = /\/$/;

/**
 * Generates an url for the file based
 * on hDev.projectRootURL
 * @return {URLString}
 */
HFSFile.prototype.getURL = function () {
  var projectRootURL = this.root.hDev.projectRootURL.replace(trailingSlashRegExp, '');

  return projectRootURL + this.path;
};

module.exports = HFSFile;

},{"../tree":53,"util":89}],45:[function(require,module,exports){
// own dependencies
const treeModel = require('../tree');
const File      = require('./file');
const Directory = require('./directory');

/**
 * Checks that the api object has all the methods defined in the methodList
 * Throws error if the check fails
 * @param  {String} name
 * @param  {Object} api
 * @param  {Array} methodList
 */
function _ensureAPI(options) {

  var name = options.name;
  var api  = options.api;
  var definition = options.definition;
  var throwError = options.throwError || false;

  if (!api) {
    return false;
  }

  return Object.keys(definition).every(function (prop) {
    var valid = (typeof api[prop] === definition[prop]);
    
    if (throwError && !valid) {
      throw new TypeError(name + '.' + prop + ' must be a ' + definition[prop]);
    }

    return valid;
  });

}

const H_DEV_API_DEF = {
  // file and directory
  remove: 'function',
  move: 'function',

  // directory only
  readDirectory: 'function',
  createFile: 'function',
  createDirectory: 'function',

  // events
  subscribe: 'function',

  // watching
  startWatching: 'function',
  stopWatching: 'function',

  // project-related
  projectRootURL: 'string',
};


/**
 * Ensure H_DEV interface and instantiate a directory
 * @param  {Object} options
 * @return {Directory}
 */
module.exports = function (options) {

  _ensureAPI({
    name: 'hDev',
    api: options.hDev,
    definition: H_DEV_API_DEF,
    throwError: true,
  });

  return new Directory(options);

};

module.exports.Directory = Directory;
module.exports.File      = File;
module.exports.auxiliary = treeModel.auxiliary;

},{"../tree":53,"./directory":43,"./file":44}],46:[function(require,module,exports){
const startingSlashRegExp = /^\//;
const trailingSlashRegExp = /\/$/;
const slashesRegExp = /(^\/)|(\/$)/g;

// function trimStart(p) {
//   return p.replace(startingSlashRegExp, '');
// }

// function trimTrailing(p) {
//   return p.replace(trailingSlashRegExp, '');
// }

function trim(p) {
  return p.replace(slashesRegExp, '');
}

function splitPath(p) {
  return trim(p).split('/');
};

// exports.trimStart = trimStart;
// exports.trimTrailing = trimTrailing;
exports.trim = trim;
exports.splitPath = splitPath;

},{}],47:[function(require,module,exports){
const util = require('util');

// third-party dependencies
const SortedArray = require('sorted-array');

const Node = require('../node');

/**
 * Creates a child node and adds it to the branch
 * @param  {String} type Either 'branch' or 'leaf'
 * @param  {String} name Must not be empty
 * @param  {Object} data
 * @return {Node}
 */
exports.createChild = function (type, name, data) {
  if (!type) { throw new Error('type is required'); }
  if (!name) { throw new Error('name is required'); }

  data = data || {};
  data.name = name;
  data.parent = this;

  var node = (type === 'branch') ?
    new this.BranchConstructor(data) : new this.LeafConstructor(data);

  this.addChild(node);

  return node;
};

/**
 * Adds the node to the _childNodes sorted array
 * It emits the 'node-added' event.
 * @param {Node} node
 */
exports.addChild = function (node, options) {

  if (node instanceof Node === false) {
    throw new TypeError('Add child node requires a node object to be added');
  }

  if (node.isRoot) {
    throw new TypeError('Not possible to add root node as a branch');
  }

  // check if the child node already exists
  if (this.getChild(node.name)) {
    throw new Error(this.path + '/' + name + ' already exists');
  }

  options = options || {};

  // set the childNode's parent
  node.parent = this;

  // insert the node using SortedArray#insert method
  // so that insertion is always done according to sort function
  this._childNodes.insert(node);

  // retrieve the inserted node's index
  var nodeIndex = this._childNodes.search(node);
  
  if (!options.silent) {
    // emit node added event only if the silent option is not passed
    this.emit('node-added', this, node, nodeIndex);
  }

  return;
};

},{"../node":55,"sorted-array":71,"util":89}],48:[function(require,module,exports){
exports.ensureExists = function (type, path, data) {

  var deepestNodeData = this.getDeepestNodeByPath(path);

  var remainingPathParts = deepestNodeData.remainingPathParts;
  var deepestNode = deepestNodeData.node;

  while (remainingPathParts.length > 0) {
    if (remainingPathParts.length === 1) {
      // create a node of the required type, as it is the last one
      deepestNode = deepestNode.createChild(type, remainingPathParts.shift(), data);

    } else {
      deepestNode = deepestNode.createChild('branch', remainingPathParts.shift());
    }
  }
};

exports.ensureDoesNotExist = function (type, path) {
  // attempt to retrive the node for the path
  // if it exists, remove it
  var node = this.getNodeByPath(path);

  if (node && node.type === type) {
    node.removeSelf();
  }

};

},{}],49:[function(require,module,exports){
// own dependencies
const aux = require('../auxiliary');

/**
 * Retrieves a child node by its name
 * @param  {String} nodeName
 * @return {Node}
 */
exports.getChild = function (nodeName) {
  if (!nodeName) { throw new Error('nodeName is required'); }

  return this.childNodes.find(function (node) {
    return node.name === nodeName;
  });
};

exports.getChildIndex = function (nodeName) {
  if (!nodeName) { throw new Error('nodeName is required'); }
  
  return this.childNodes.findIndex(function (node) {
    return node.name === nodeName;
  });
};

/**
 * Retrieves a descendant node by path
 * @param  {String|Array} nodepath
 * @return {Node}
 */
exports.getNodeByPath = function (path) {
  if (!path) { throw new Error('path must not be empty'); }

  // break the path into parts so its easier to manipulate it
  var parts = Array.isArray(path) ? path : aux.splitPath(path);

  var currentPart = parts.shift();

  var isTarget = (parts.length === 0);

  // try to find current part
  var node = this.childNodes.find(function (cn) {
    return cn.name === currentPart;
  });

  if (node) {
    return isTarget ? node : node.getNodeByPath(parts);
  } else {
    return;
  }
};

// TODO: merge getDeepestNodeByPath with getNodeByPath

/**
 * Retrieves the deepest node that corresponds to the path given.
 * Returns an object with the remaining path parts and the node.
 * @param  {String} path
 * @return {Object}
 *         - node: Node
 *         - remainingParts: Array
 */
exports.getDeepestNodeByPath = function (path) {
  if (!path) { throw new Error('path must not be empty'); }

  // break the path into parts so its easier to manipulate it
  var parts = Array.isArray(path) ? path : aux.splitPath(path);

  var currentPart = parts.shift();

  var isTarget = (parts.length === 0);

  // try to find current part
  var node = this.childNodes.find(function (cn) {
    return cn.name === currentPart;
  });

  if (node) {

    if (isTarget) {
      // we arrived at the target node
      return {
        node: node,
        remainingPathParts: parts,
      };

    } else {
      // go deeper
      return node.getDeepestNodeByPath(parts);
    }

  } else {
    // put back the not found part
    parts.unshift(currentPart);

    return {
      node: this,
      remainingPathParts: parts
    }
  }
}
},{"../auxiliary":46}],50:[function(require,module,exports){
const util = require('util');

// third-party dependencies
const SortedArray = require('sorted-array');

const Node = require('../node');
const Leaf = require('../leaf');

const aux = require('../auxiliary');

/**
 * Sorts nodes.
 * branches to the top,
 * leaves to the end and
 * among equals, sort alphabetically
 */
function _defaultNodeSortFn(a, b) {
  if (!b) {
    // if no b, a comes first
    return -1;
  }

  if (!a) {
    // if no a, b comes first
    return 1;
  }

  if (a.isBranch && b.isLeaf) {
    // branches come first
    return -1;
  } else if (a.isLeaf && b.isBranch) {
    // leaves come later
    return 1;
  } else {

    // both are of the same level, compare names
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    } else {
      return 0;
    }
  }

}

/**
 * Branch constructor
 * @param {String} name
 * @param {Object} data
 * @param {Node} parent */
// function Branch(name, data, parent) {
function Branch(data) {

  if (data.parent) {
    data.type = 'branch';
  } else {
    data.type = 'root';
  }

  Node.call(this, data);

  if (this.isBranch) {
    // propagate events to parents
    this.on('node-added', function (parentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-added', parentNode, node, index);
      }
    }.bind(this));

    this.on('node-removed', function (parentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-removed', parentNode, node, index);
      }
    }.bind(this));

    this.on('node-moved', function (fromParentNode, toParentNode, node, index) {
      if (this.parent) {
        this.parent.emit('node-moved', fromParentNode, toParentNode, node, index);
      }
    }.bind(this));
  }

  /**
   * Child nodes in sorted format
   * @type {sorted}
   */
  this._childNodes = new SortedArray([], _defaultNodeSortFn);
}

util.inherits(Branch, Node);
/**
 * Constructor function to be used when creating child branches
 * @type {Branch}
 */
Branch.prototype.BranchConstructor = Branch;

/**
 * Constructor function to be used when creating child leaves
 * @type {Leaf}
 */
Branch.prototype.LeafConstructor = Leaf;

/**
 * Define a pseudo property for 'childNodes'
 * so that it returns the SortedArray#array
 * @type {Array}
 */
Object.defineProperty(Branch.prototype, 'childNodes', {
  get: function () {
    return this._childNodes.array;
  },
  set: function () {
    throw new Error('cannot set childNodes');
  }
});

/**
 * ADD methods
 */
Object.assign(Branch.prototype, require('./add'));

/**
 * GET methods
 */
Object.assign(Branch.prototype, require('./get'));

/**
 * REMOVE methods
 */
Object.assign(Branch.prototype, require('./remove'));

/**
 * MOVE methods
 */
Object.assign(Branch.prototype, require('./move'));

/**
 * ENSURE methods
 */
Object.assign(Branch.prototype, require('./ensure'));

module.exports = Branch;
},{"../auxiliary":46,"../leaf":54,"../node":55,"./add":47,"./ensure":48,"./get":49,"./move":51,"./remove":52,"sorted-array":71,"util":89}],51:[function(require,module,exports){
/**
 * Moves a descendant node to another position path.
 * @param  {String} nodePath
 * @param  {String} toPath
 * @param  {Object} options
 * @return {undefined}
 */
exports.moveNode = function (nodePath, toPath, options) {

  if (typeof nodePath !== 'string') { throw new Error('nodePath is required'); }
  if (typeof toPath !== 'string') { throw new Error('toPath is required'); }

  // check that both paths exist
  // and that the destination path is a branch or the root itself
  var node = this.getNodeByPath(nodePath);
  if (!node) { throw new Error(nodePath + ' does not exist'); }

  // if the toPath is an empty string, the destination node is this node
  var toNode = (toPath === '') ? this : this.getNodeByPath(toPath);
  if (!toNode) { throw new Error(toPath + ' does not exist'); }
  if (toNode.isLeaf) { throw new Error('target path is not a branch node'); }

  // throw error if the toNode has the node itself as an ancestor
  // or is the node itself
  if (toNode.hasAncestor(node) || node === toNode) {
    throw new Error('target path is within the node\'s path');
  }

  // do nothing if the node is already at the destination
  if (node.parent === toNode) {
    return;
  }

  options = options || {};

  // grab reference to the source node
  // (the parent branch of the moved node)
  var fromNode = node.parent;

  // silently remove the node
  fromNode.removeChild(node.name, { silent: true });

  // silently add the node
  toNode.addChild(node, { silent: true });

  // retrieve index of the newly added node
  var nodeIndex = toNode.getChildIndex(node.name);

  // if no silent option was passed, emit event
  // on the source branch 
  if (!options.silent) {
    this.emit('node-moved', fromNode, toNode, node, nodeIndex);
  }

  // return nothing
  return;
}
},{}],52:[function(require,module,exports){
exports.removeChild = function (nodeName, options) {
  if (!nodeName) { throw new Error('nodeName is required'); }

  options = options || {};

  var node = this.getChild(nodeName);

  if (!node) {
    throw new Error(this.path + '/' + nodeName + ' does not exist');

  } else {

    // get the index for the event
    var nodeIndex = this.getChildIndex(nodeName);

    // remove
    this._childNodes.remove(node);

    // only emit the 'node-removed' event if the silent option is not passed
    if (!options.silent) {
      this.emit('node-removed', this, node, nodeIndex);
    }

    // delete the node's reference to its parent
    // after everything else is done
    delete node.parent;

    return;
  }
};

},{}],53:[function(require,module,exports){
const Node = require('./node');
const Leaf = require('./leaf');
const Branch = require('./branch');

exports.Node   = Node;
exports.Leaf   = Leaf;
exports.Branch = Branch;
exports.aux    = require('./auxiliary');
},{"./auxiliary":46,"./branch":50,"./leaf":54,"./node":55}],54:[function(require,module,exports){
const util = require('util');

const Node = require('./node');

function Leaf(data) {
  data.type = 'leaf';
  
  Node.call(this, data);
}

util.inherits(Leaf, Node);

module.exports = Leaf;
},{"./node":55,"util":89}],55:[function(require,module,exports){
// native
const EventEmitter = require('events').EventEmitter;
const util         = require('util');

/**
 * List of properties that must not be set at the instance level
 * @type {Array}
 */
const PROHIBITED_PROPERTIES = [
  'path',
  'absolutePath',
  'isRoot',
  'isBranch',
  'isLeaf',
  'set',
  'get',
  'root',

  // event emitter
  'emit',
  'addListener',
  'on',
  'once',
  'removeListener'
];

/**
 * Node constructor
 * @param {String} type   The type of the node. May be 'root', 'branch' or 'leaf'
 * @param {String} name   The name of the node.
 * @param {Object} data   Arbitrary data to be saved onto the node
 * @param {Node} parent   The parent node this node refers to.
 */
// function Node(type, name, data, parent) {
function Node(data) {

  if (!data) { throw new Error('data must not be undefined'); }

  // set the data
  this.set(data);
  
  // verify required properties according to type
  if (this.type === 'branch') {
    this.isBranch = true;

    if (!(this.parent instanceof Node)) {
      throw new TypeError('parent must be instance of Node');
    }
    if (!this.name) {
      throw new Error('branch node must have a name');
    }

  } else if (this.type === 'leaf') {
    this.isLeaf = true;

    if (!(this.parent instanceof Node)) {
      throw new TypeError('parent must be instance of Node');
    }

    if (!this.name) {
      throw new Error('leaf node must have a name');
    }

  } else if (this.type === 'root') {
    this.isRoot = true;

    if (!this.rootPath) {
      throw new Error('root node must have a rootPath');
    }
  } else {
    throw new TypeError('invalid type `' + this.type + '`');
  }
}

util.inherits(Node, EventEmitter);

/**
 * The path to the node starting at the root
 * excluding rootPath
 */
Object.defineProperty(Node.prototype, 'path', {
  get: function () {
    if (this.isRoot) {
      return '';
    } else {
      return this.parent.path + '/' + this.name;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * The absolutePath to the node starting at the root
 * including rootPath
 */
Object.defineProperty(Node.prototype, 'absolutePath', {
  get: function () {
    if (this.isRoot) {
      return this.get('rootPath');
    } else {
      return this.parent.absolutePath + '/' + this.name;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * Reference to the root node
 */
Object.defineProperty(Node.prototype, 'root', {
  get: function () {
    if (this.isRoot) {
      return this;
    } else {
      return this.parent.root;
    }
  },
  set: function () {
    throw new Error('prohibited')
  }
});

/**
 * Sets data
 * @param {Object} data data object
 *
 * or
 *
 * @param {String} key
 * @param {*}      value
 */
Node.prototype.set = function () {

  if (typeof arguments[0] === 'object') {

    var dataObj = arguments[0];

    Object.keys(dataObj).forEach(function (key) {

      if (PROHIBITED_PROPERTIES.indexOf(key) !== -1) {
        throw new TypeError('Setting ' + key + ' is prohibited');
      }

      this[key] = dataObj[key];

    }.bind(this));

  } else {
    
    var key = arguments[0];
    var value = arguments[1];

    if (PROHIBITED_PROPERTIES.indexOf(key) !== -1) {
      throw new TypeError('Setting ' + key + ' is prohibited');
    }

    this[key] = value;
  }
};

/**
 * Retrieves the value for a given key
 * @param  {String} key
 * @return {*}
 */
Node.prototype.get = function (key) {
  return this[key];
};

/**
 * Checks whether the current node has a given ancestor
 * (is beneath)
 * @param  {Node}    node
 * @return {Boolean}
 */
Node.prototype.hasAncestor = function (node) {

  if (this.isRoot) {
    return false;
  } else {
    // if the node is a root node, immediately return true
    if (node.isRoot) { return true; }

    if (this.parent === node) {
      return true
    } else {
      return this.parent.hasAncestor(node);
    }
  }
};

/**
 * Only a helper method that actually invokes parent's removeChild method
 * @param  {Object} options
 * @return {undefined}
 */
Node.prototype.removeSelf = function (options) {
  if (this.isRoot) {
    throw new Error('root node cannot remove itself');
  }
  this.parent.removeChild(this.name);
  return;
};

module.exports = Node;
},{"events":23,"util":89}],56:[function(require,module,exports){
/**
 * Auxiliary function to assign values from a source to a target object
 */
exports.assign = function(target, source) {
  if (typeof Object.assign === 'function') {
    Object.assign(target, source);
  } else {
    for (var prop in source) {
      if (source.hasOwnProperty(prop)) {
        target[prop] = source[prop];
      }
    }
  }
};

},{}],57:[function(require,module,exports){
exports.ROOT         = 'ht-root';
exports.NODE         = 'ht-node';
exports.LABEL        = 'ht-label';

exports.BRANCH       = 'ht-branch';
exports.BRANCH_LABEL = 'ht-branch-label';
exports.LEAF         = 'ht-leaf';
exports.LEAF_LABEL   = 'ht-leaf-label';

// drag and drop
exports.DRAGGING = 'ht-dragging';
exports.DRAGOVER = 'ht-dragover';

// statuses
exports.LOADING = 'ht-loading';

/**
 * Class added to a new node element.
 * It is removed sometime before the node's complete removal.
 * Should be used for animations
 * @type {String}
 */
exports.ENTER            = 'ht-enter';
exports.EXIT             = 'ht-exit';


/**
 * Creates a leaf element
 * @param  {Node} nodeModel
 * @return {DOM Element}
 */
exports._leafEl = function (nodeModel) {
  var el = this.$leafEl(nodeModel);
  var label = this.$leafLabel(nodeModel);

  /**
   * Associate the leaf element to its model
   */
  el.model = nodeModel;

  el.setAttribute('data-role', 'leaf');
  // leaf element is draggable
  el.setAttribute('draggable', true);

  label.setAttribute('data-role', 'leaf-label');

  el.appendChild(label);

  return el;
}

/**
 * Branch element creation
 * @private
 * @param  {Node} nodeModel
 * @return {DOM Element}
 */
exports._branchEl = function (nodeModel) {
  var el = nodeModel.isRoot ?
    this.$rootEl(nodeModel) : this.$branchEl(nodeModel);
  var label = this.$branchLabel(nodeModel);
  var container = this.$branchContainer(nodeModel);

  /**
   * Associate all branch elements to corresponding nodeModel
   */
  el.model = nodeModel;

  el.setAttribute('data-role', 'branch');

  // branch element is always draggable
  el.setAttribute('draggable', true);

  // special attributes for the label
  label.setAttribute('data-role', 'branch-label');

  // special attributes for the container
  container.setAttribute('data-role', 'branch-child-container');

  // add the collapsed class to nodes that have the collapsed attribute set to true
  // only root containers start visible
  if (nodeModel.collapsed && !nodeModel.isRoot) {
    el.classList.add(this.BRANCH_COLLAPSED);
  }

  // append elements
  el.appendChild(label);
  el.appendChild(container);

  return el;
}


/**
 * Method called to create the element for the root model
 * @param  {Node} nodeData
 * @return {DOM Element}
 */
exports.$rootEl = function (nodeData) {
  var el = document.createElement('div');
  el.classList.add(this.NODE);
  el.classList.add(this.ROOT);

  return el;
}

/**
 * Creates a nodeData element
 * @param  {Node} The nodeData this element refers to
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchEl = function (nodeData) {

  var el = document.createElement('li');
  el.classList.add(this.NODE);
  el.classList.add(this.BRANCH);
  return el;
};

/**
 * Creates a label element for the nodeData
 * @param  {Node} nodeData
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchLabel = function (nodeData) {
  var label = document.createElement('span');
  label.classList.add(this.LABEL);
  label.classList.add(this.BRANCH_LABEL);
  label.innerHTML = [
    '<iron-icon icon="chevron-right"></iron-icon>',
    '<iron-icon icon="folder"></iron-icon>',
    '<hab-editable-label value="' + nodeData.name + '"><hab-editable-label>'
  ].join('');

  return label;
};

/**
 * Creates a container element for child nodeDatas
 * @param  {Node} nodeData
 *         - name
 *         - path
 * @return {DOM Element}
 */
exports.$branchContainer = function (nodeData) {
  var container = document.createElement('ul');
  container.className = 'branch-child-container';

  return container;
};

/**
 * Creates the leaf element
 * @param  {[type]} nodeData [description]
 * @return {[type]}      [description]
 */
exports.$leafEl = function (nodeData) {
  var el = document.createElement('li');
  el.classList.add(this.NODE);
  el.classList.add(this.LEAF);

  return el;
};

exports.$leafLabel = function(nodeData) {
  var el = document.createElement('span');
  el.classList.add(this.LABEL);
  el.classList.add(this.LEAF_LABEL);
  el.innerHTML = [
    '<iron-icon icon="editor:insert-drive-file"></iron-icon>',
    '<hab-editable-label value="' + nodeData.name + '"><hab-editable-label>'
  ].join('');

  return el;
};

},{}],58:[function(require,module,exports){
// element-related methods
const aux = require('./auxiliary');

/**
 * UI constructor
 * @param {Node} rootModel
 */
function Happiness(rootModel) {
  /**
   * The root of the ui
   * @type {DOMElement}
   */
  this.rootElement = this._branchEl(rootModel);

  this.rootModel = rootModel;
}

// assign methods to prototype from sub-modules
aux.assign(Happiness.prototype, require('./elements'));
aux.assign(Happiness.prototype, require('./ui'));

/**
 * Attaches the tree's root element to the container
 * @param  {DOM Element} containerElement
 */
Happiness.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;

  this.containerElement.appendChild(this.rootElement);
};

/**
 * Retrieves the element's corresponding model (closest)
 * @param  {DOM Element} element
 * @return {Node}
 */
Happiness.prototype.getElementModel = function (element) {
  var _el = element;

  /**
   * Walk the node tree until a model is found.
   */
  while (!_el.model) {
    _el = _el.parentNode;
  }

  if (!_el) {
    return false;
  } else {
    return _el.model;
  }
}

/**
 * Event delegation for the tree
 *
 * @param {String} DOMEventName
 * @param {String|Array} role
 *        The role the target element has
 *          - leaf
 *          - branch
 *          - branch-label
 *          - branch-child-container
 *        It may be an array of roles
 *
 * @param {Function} eventHandler
 *        Special event handler that receives a special event object
 */
Happiness.prototype.addTreeEventListener = function (DOMEventName, requiredRoles, eventHandler) {

  var self = this;

  // transform requiredRoles in an array of requiredRoless
  // if it is a single one
  requiredRoles = (typeof requiredRoles === 'string') ? [requiredRoles] : requiredRoles;

  this.rootElement.addEventListener(DOMEventName, function (e) {
    /**
     *
     * Target element
     * @type {DOM Element}
     */
    var target = e.target;

    /**
     * Target element model
     * @type {Node}
     */
    var targetModel = self.getElementModel(target);
    var targetPath = targetModel.path;

    // check that the target has a path defined
    if (targetPath !== false) {
      var targetRole = self.getElementRole(target);
      /**
       * The closest branch model.
       * If the node is a leaf, return parent
       * if the node is the root or a branch, return the node itself
       * @type {Node}
       */
      var closestBranchModel = (targetModel.isLeaf) ? targetModel.parent : targetModel;

      // check that the target's requiredRoles matches the required one
      if (requiredRoles.indexOf(targetRole) !== -1) {
        eventHandler({
          path: targetPath,
          role: targetRole,
          element: target,
          model: targetModel,
          closestBranchModel: closestBranchModel,
          // original event
          event: e,
        });
      }
    }
  });
};

/**
 * Retrieves the element that represents the path
 * @param  {String} path
 * @param  {String} role
 * @return {DOM Element}
 */
Happiness.prototype.getElement = function (path, role) {
  if (!path && path !== '') { throw new Error('path is required to retrieve element'); }
  if (!this.containerElement) { throw new Error('tree not attached!'); }

  var pathElement = path === '' ?
    this.rootElement : this.rootElement.querySelector('[data-path="' + path + '"]');

  if (role) {
    return pathElement.querySelector('[data-role="' + role + '"]');
  } else {
    return pathElement;
  }
};

/**
 * Retrieves the role the element represents
 * @param  {DOM Element} element The element to check for role
 * @return {String}      Returns false if the element represents no role
 */
Happiness.prototype.getElementRole = function (element) {
  return element.getAttribute('data-role') || false;
};

/**
 * Adds a branch element to the tree at the given parentPath
 * @param {String} parentPath Path to the parentNode
 * @param {String} name       The name of the new branch.
 *                            Will be added to the parentPath to compose the
 *                            branch's path
 * @param {Number} index      Position at which insert the branch
 * @param {Object} data       Arbitrary data used to render the branch element
 */
Happiness.prototype.addBranch = function (nodeModel, index) {

  // create an element for the branch
  var branchElement = this._branchEl(nodeModel);

  this.addNodeElement(nodeModel, branchElement, index);

  // loop childNodes and add corresponding nodes
  nodeModel.childNodes.forEach(function (childNode) {
    if (childNode.isBranch) {
      this.addBranch(childNode);
    } else if (childNode.isLeaf) {
      this.addLeaf(childNode);
    }
  }.bind(this));

  return branchElement;
};

/**
 * Adds a leaf element to the tree at the given parentPath
 * @param {String} parentPath Path to the parentNode
 * @param {String} name       The name of the new leaf.
 *                            Will be added to the parentPath to compose the
 *                            leaf's path
 * @param {Number} index      Position at which insert the leaf
 * @param {Object} data       Arbitrary data used to render the leaf element
 */
Happiness.prototype.addLeaf = function (nodeModel, index) {
  // create an element for the branch
  var leafElement = this._leafEl(nodeModel);

  this.addNodeElement(nodeModel, leafElement, index)

  return leafElement;
};

/**
 * Adds a node element to the tree at a given index
 * @param {Node} nodeModel
 * @param {DOM Element} element
 * @param {Number} index
 */
Happiness.prototype.addNodeElement = function (nodeModel, element, index) {

  // set the 'data-path' attribute of the element
  // to match the model's
  element.setAttribute('data-path', nodeModel.path);

  // add the EXIT class so that the node initially
  // does not appear
  element.classList.add(this.EXIT);
  // remove EXIT class on the next tick
  // so that the ui first renders the element then animates it in
  setTimeout(function () {
    element.classList.remove(this.EXIT);
  }.bind(this), 0);

  // retrieve the parent's branch-child-container
  var container = this.getElement(nodeModel.parent.path, 'branch-child-container');

  // try to get an element before which the new node element should be inserted
  var before = container.childNodes[index];

  if (before) {
    container.insertBefore(element, before);
  } else {
    container.appendChild(element);
  }

  // return nothing
  return;
}

/**
 * Removes the element at the given path
 * Sets the removal for 200 ms, to wait for the exit animation to be over
 * @param  {String} path
 */
Happiness.prototype.removeElement = function (path) {
  var el = this.getElement(path);

  el.classList.add(this.EXIT);

  setTimeout(function () {
    el.remove();
  }, 200);

  return;
};

module.exports = Happiness;

},{"./auxiliary":56,"./elements":57,"./ui":59}],59:[function(require,module,exports){
// constants
exports.BRANCH_COLLAPSED = 'ht-collapsed';
exports.SELECTED         = 'ht-selected';

/**
 * Toggles a branch element collapsed state
 * @param element {DOMElement}
 * @param open {Boolean}
 */
exports.uiToggleBranchElement = function (element, open) {
  if (typeof open === 'boolean') {
    // use opposite value of open, because we are using a
    // negative class (collapsed)
    element.classList.toggle(this.BRANCH_COLLAPSED, !open);
  } else {
    element.classList.toggle(this.BRANCH_COLLAPSED);
  }
};

/**
 * Collapses all branches
 */
exports.uiCollapseAllBranches = function () {
  var branches = this.rootElement.querySelectorAll('.' + this.BRANCH);

  Array.prototype.forEach.call(branches, function (branchEl) {
    branchEl.classList.add(this.BRANCH_COLLAPSED);
  }.bind(this));
};

/**
 * Selects element
 * @param element {DOMElement}
 * @param options {Object}
 */
exports.uiSelectElement = function (element, options) {

  if (options && options.clearSelection) {
    this.uiClearSelection();
  }

  element.classList.add(this.SELECTED);
};

/**
 * Deselects an element
 * @param element {DOMElement}
 */
exports.uiDeselectElement = function (element) {
  element.classList.remove(this.SELECTED)
};

/**
 * Clears all selected elements
 */
exports.uiClearSelection = function () {
  var selected = this.containerElement.querySelectorAll('.' + this.SELECTED);

  Array.prototype.forEach.call(selected, function (el) {
    el.classList.remove(this.SELECTED);
  }.bind(this));
};

},{}],60:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],61:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],62:[function(require,module,exports){
(function (process){
var path = require('path');
var fs = require('fs');

function Mime() {
  // Map of extension -> mime type
  this.types = Object.create(null);

  // Map of mime type -> extension
  this.extensions = Object.create(null);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * @param map (Object) type definitions
 */
Mime.prototype.define = function (map) {
  for (var type in map) {
    var exts = map[type];
    for (var i = 0; i < exts.length; i++) {
      if (process.env.DEBUG_MIME && this.types[exts]) {
        console.warn(this._loading.replace(/.*\//, ''), 'changes "' + exts[i] + '" extension type from ' +
          this.types[exts] + ' to ' + type);
      }

      this.types[exts[i]] = type;
    }

    // Default extension is the first one we encounter
    if (!this.extensions[type]) {
      this.extensions[type] = exts[0];
    }
  }
};

/**
 * Load an Apache2-style ".types" file
 *
 * This may be called multiple times (it's expected).  Where files declare
 * overlapping types/extensions, the last file wins.
 *
 * @param file (String) path of file to load.
 */
Mime.prototype.load = function(file) {
  this._loading = file;
  // Read file and split into lines
  var map = {},
      content = fs.readFileSync(file, 'ascii'),
      lines = content.split(/[\r\n]+/);

  lines.forEach(function(line) {
    // Clean up whitespace/comments, and split into fields
    var fields = line.replace(/\s*#.*|^\s*|\s*$/g, '').split(/\s+/);
    map[fields.shift()] = fields;
  });

  this.define(map);

  this._loading = null;
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.lookup = function(path, fallback) {
  var ext = path.replace(/.*[\.\/\\]/, '').toLowerCase();

  return this.types[ext] || fallback || this.default_type;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.extension = function(mimeType) {
  var type = mimeType.match(/^\s*([^;\s]*)(?:;|\s|$)/)[1].toLowerCase();
  return this.extensions[type];
};

// Default instance
var mime = new Mime();

// Define built-in types
mime.define(require('./types.json'));

// Default type
mime.default_type = mime.lookup('bin');

//
// Additional API specific to the default instance
//

mime.Mime = Mime;

/**
 * Lookup a charset based on mime type.
 */
mime.charsets = {
  lookup: function(mimeType, fallback) {
    // Assume text types are utf8
    return (/^text\//).test(mimeType) ? 'UTF-8' : fallback;
  }
};

module.exports = mime;

}).call(this,require('_process'))
},{"./types.json":63,"_process":65,"fs":12,"path":64}],63:[function(require,module,exports){
module.exports={"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomsvc+xml":["atomsvc"],"application/ccxml+xml":["ccxml"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mdp"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma"],"application/emma+xml":["emma"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/font-tdpfr":["pfr"],"application/font-woff":["woff"],"application/font-woff2":["woff2"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/java-archive":["jar"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/patch-ops-error+xml":["xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/prs.cww":["cww"],"application/pskc+xml":["pskcxml"],"application/rdf+xml":["rdf"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/vnd.3gpp.pic-bw-large":["plb"],"application/vnd.3gpp.pic-bw-small":["psb"],"application/vnd.3gpp.pic-bw-var":["pvb"],"application/vnd.3gpp2.tcap":["tcap"],"application/vnd.3m.post-it-notes":["pwn"],"application/vnd.accpac.simply.aso":["aso"],"application/vnd.accpac.simply.imp":["imp"],"application/vnd.acucobol":["acu"],"application/vnd.acucorp":["atc","acutc"],"application/vnd.adobe.air-application-installer-package+zip":["air"],"application/vnd.adobe.formscentral.fcdt":["fcdt"],"application/vnd.adobe.fxp":["fxp","fxpl"],"application/vnd.adobe.xdp+xml":["xdp"],"application/vnd.adobe.xfdf":["xfdf"],"application/vnd.ahead.space":["ahead"],"application/vnd.airzip.filesecure.azf":["azf"],"application/vnd.airzip.filesecure.azs":["azs"],"application/vnd.amazon.ebook":["azw"],"application/vnd.americandynamics.acc":["acc"],"application/vnd.amiga.ami":["ami"],"application/vnd.android.package-archive":["apk"],"application/vnd.anser-web-certificate-issue-initiation":["cii"],"application/vnd.anser-web-funds-transfer-initiation":["fti"],"application/vnd.antix.game-component":["atx"],"application/vnd.apple.installer+xml":["mpkg"],"application/vnd.apple.mpegurl":["m3u8"],"application/vnd.aristanetworks.swi":["swi"],"application/vnd.astraea-software.iota":["iota"],"application/vnd.audiograph":["aep"],"application/vnd.blueice.multipass":["mpm"],"application/vnd.bmi":["bmi"],"application/vnd.businessobjects":["rep"],"application/vnd.chemdraw+xml":["cdxml"],"application/vnd.chipnuts.karaoke-mmd":["mmd"],"application/vnd.cinderella":["cdy"],"application/vnd.claymore":["cla"],"application/vnd.cloanto.rp9":["rp9"],"application/vnd.clonk.c4group":["c4g","c4d","c4f","c4p","c4u"],"application/vnd.cluetrust.cartomobile-config":["c11amc"],"application/vnd.cluetrust.cartomobile-config-pkg":["c11amz"],"application/vnd.commonspace":["csp"],"application/vnd.contact.cmsg":["cdbcmsg"],"application/vnd.cosmocaller":["cmc"],"application/vnd.crick.clicker":["clkx"],"application/vnd.crick.clicker.keyboard":["clkk"],"application/vnd.crick.clicker.palette":["clkp"],"application/vnd.crick.clicker.template":["clkt"],"application/vnd.crick.clicker.wordbank":["clkw"],"application/vnd.criticaltools.wbs+xml":["wbs"],"application/vnd.ctc-posml":["pml"],"application/vnd.cups-ppd":["ppd"],"application/vnd.curl.car":["car"],"application/vnd.curl.pcurl":["pcurl"],"application/vnd.dart":["dart"],"application/vnd.data-vision.rdz":["rdz"],"application/vnd.dece.data":["uvf","uvvf","uvd","uvvd"],"application/vnd.dece.ttml+xml":["uvt","uvvt"],"application/vnd.dece.unspecified":["uvx","uvvx"],"application/vnd.dece.zip":["uvz","uvvz"],"application/vnd.denovo.fcselayout-link":["fe_launch"],"application/vnd.dna":["dna"],"application/vnd.dolby.mlp":["mlp"],"application/vnd.dpgraph":["dpg"],"application/vnd.dreamfactory":["dfac"],"application/vnd.ds-keypoint":["kpxx"],"application/vnd.dvb.ait":["ait"],"application/vnd.dvb.service":["svc"],"application/vnd.dynageo":["geo"],"application/vnd.ecowin.chart":["mag"],"application/vnd.enliven":["nml"],"application/vnd.epson.esf":["esf"],"application/vnd.epson.msf":["msf"],"application/vnd.epson.quickanime":["qam"],"application/vnd.epson.salt":["slt"],"application/vnd.epson.ssf":["ssf"],"application/vnd.eszigno3+xml":["es3","et3"],"application/vnd.ezpix-album":["ez2"],"application/vnd.ezpix-package":["ez3"],"application/vnd.fdf":["fdf"],"application/vnd.fdsn.mseed":["mseed"],"application/vnd.fdsn.seed":["seed","dataless"],"application/vnd.flographit":["gph"],"application/vnd.fluxtime.clip":["ftc"],"application/vnd.framemaker":["fm","frame","maker","book"],"application/vnd.frogans.fnc":["fnc"],"application/vnd.frogans.ltf":["ltf"],"application/vnd.fsc.weblaunch":["fsc"],"application/vnd.fujitsu.oasys":["oas"],"application/vnd.fujitsu.oasys2":["oa2"],"application/vnd.fujitsu.oasys3":["oa3"],"application/vnd.fujitsu.oasysgp":["fg5"],"application/vnd.fujitsu.oasysprs":["bh2"],"application/vnd.fujixerox.ddd":["ddd"],"application/vnd.fujixerox.docuworks":["xdw"],"application/vnd.fujixerox.docuworks.binder":["xbd"],"application/vnd.fuzzysheet":["fzs"],"application/vnd.genomatix.tuxedo":["txd"],"application/vnd.geogebra.file":["ggb"],"application/vnd.geogebra.tool":["ggt"],"application/vnd.geometry-explorer":["gex","gre"],"application/vnd.geonext":["gxt"],"application/vnd.geoplan":["g2w"],"application/vnd.geospace":["g3w"],"application/vnd.gmx":["gmx"],"application/vnd.google-earth.kml+xml":["kml"],"application/vnd.google-earth.kmz":["kmz"],"application/vnd.grafeq":["gqf","gqs"],"application/vnd.groove-account":["gac"],"application/vnd.groove-help":["ghf"],"application/vnd.groove-identity-message":["gim"],"application/vnd.groove-injector":["grv"],"application/vnd.groove-tool-message":["gtm"],"application/vnd.groove-tool-template":["tpl"],"application/vnd.groove-vcard":["vcg"],"application/vnd.hal+xml":["hal"],"application/vnd.handheld-entertainment+xml":["zmm"],"application/vnd.hbci":["hbci"],"application/vnd.hhe.lesson-player":["les"],"application/vnd.hp-hpgl":["hpgl"],"application/vnd.hp-hpid":["hpid"],"application/vnd.hp-hps":["hps"],"application/vnd.hp-jlyt":["jlt"],"application/vnd.hp-pcl":["pcl"],"application/vnd.hp-pclxl":["pclxl"],"application/vnd.ibm.minipay":["mpy"],"application/vnd.ibm.modcap":["afp","listafp","list3820"],"application/vnd.ibm.rights-management":["irm"],"application/vnd.ibm.secure-container":["sc"],"application/vnd.iccprofile":["icc","icm"],"application/vnd.igloader":["igl"],"application/vnd.immervision-ivp":["ivp"],"application/vnd.immervision-ivu":["ivu"],"application/vnd.insors.igm":["igm"],"application/vnd.intercon.formnet":["xpw","xpx"],"application/vnd.intergeo":["i2g"],"application/vnd.intu.qbo":["qbo"],"application/vnd.intu.qfx":["qfx"],"application/vnd.ipunplugged.rcprofile":["rcprofile"],"application/vnd.irepository.package+xml":["irp"],"application/vnd.is-xpr":["xpr"],"application/vnd.isac.fcs":["fcs"],"application/vnd.jam":["jam"],"application/vnd.jcp.javame.midlet-rms":["rms"],"application/vnd.jisp":["jisp"],"application/vnd.joost.joda-archive":["joda"],"application/vnd.kahootz":["ktz","ktr"],"application/vnd.kde.karbon":["karbon"],"application/vnd.kde.kchart":["chrt"],"application/vnd.kde.kformula":["kfo"],"application/vnd.kde.kivio":["flw"],"application/vnd.kde.kontour":["kon"],"application/vnd.kde.kpresenter":["kpr","kpt"],"application/vnd.kde.kspread":["ksp"],"application/vnd.kde.kword":["kwd","kwt"],"application/vnd.kenameaapp":["htke"],"application/vnd.kidspiration":["kia"],"application/vnd.kinar":["kne","knp"],"application/vnd.koan":["skp","skd","skt","skm"],"application/vnd.kodak-descriptor":["sse"],"application/vnd.las.las+xml":["lasxml"],"application/vnd.llamagraphics.life-balance.desktop":["lbd"],"application/vnd.llamagraphics.life-balance.exchange+xml":["lbe"],"application/vnd.lotus-1-2-3":["123"],"application/vnd.lotus-approach":["apr"],"application/vnd.lotus-freelance":["pre"],"application/vnd.lotus-notes":["nsf"],"application/vnd.lotus-organizer":["org"],"application/vnd.lotus-screencam":["scm"],"application/vnd.lotus-wordpro":["lwp"],"application/vnd.macports.portpkg":["portpkg"],"application/vnd.mcd":["mcd"],"application/vnd.medcalcdata":["mc1"],"application/vnd.mediastation.cdkey":["cdkey"],"application/vnd.mfer":["mwf"],"application/vnd.mfmp":["mfm"],"application/vnd.micrografx.flo":["flo"],"application/vnd.micrografx.igx":["igx"],"application/vnd.mif":["mif"],"application/vnd.mobius.daf":["daf"],"application/vnd.mobius.dis":["dis"],"application/vnd.mobius.mbk":["mbk"],"application/vnd.mobius.mqy":["mqy"],"application/vnd.mobius.msl":["msl"],"application/vnd.mobius.plc":["plc"],"application/vnd.mobius.txf":["txf"],"application/vnd.mophun.application":["mpn"],"application/vnd.mophun.certificate":["mpc"],"application/vnd.mozilla.xul+xml":["xul"],"application/vnd.ms-artgalry":["cil"],"application/vnd.ms-cab-compressed":["cab"],"application/vnd.ms-excel":["xls","xlm","xla","xlc","xlt","xlw"],"application/vnd.ms-excel.addin.macroenabled.12":["xlam"],"application/vnd.ms-excel.sheet.binary.macroenabled.12":["xlsb"],"application/vnd.ms-excel.sheet.macroenabled.12":["xlsm"],"application/vnd.ms-excel.template.macroenabled.12":["xltm"],"application/vnd.ms-fontobject":["eot"],"application/vnd.ms-htmlhelp":["chm"],"application/vnd.ms-ims":["ims"],"application/vnd.ms-lrm":["lrm"],"application/vnd.ms-officetheme":["thmx"],"application/vnd.ms-pki.seccat":["cat"],"application/vnd.ms-pki.stl":["stl"],"application/vnd.ms-powerpoint":["ppt","pps","pot"],"application/vnd.ms-powerpoint.addin.macroenabled.12":["ppam"],"application/vnd.ms-powerpoint.presentation.macroenabled.12":["pptm"],"application/vnd.ms-powerpoint.slide.macroenabled.12":["sldm"],"application/vnd.ms-powerpoint.slideshow.macroenabled.12":["ppsm"],"application/vnd.ms-powerpoint.template.macroenabled.12":["potm"],"application/vnd.ms-project":["mpp","mpt"],"application/vnd.ms-word.document.macroenabled.12":["docm"],"application/vnd.ms-word.template.macroenabled.12":["dotm"],"application/vnd.ms-works":["wps","wks","wcm","wdb"],"application/vnd.ms-wpl":["wpl"],"application/vnd.ms-xpsdocument":["xps"],"application/vnd.mseq":["mseq"],"application/vnd.musician":["mus"],"application/vnd.muvee.style":["msty"],"application/vnd.mynfc":["taglet"],"application/vnd.neurolanguage.nlu":["nlu"],"application/vnd.nitf":["ntf","nitf"],"application/vnd.noblenet-directory":["nnd"],"application/vnd.noblenet-sealer":["nns"],"application/vnd.noblenet-web":["nnw"],"application/vnd.nokia.n-gage.data":["ngdat"],"application/vnd.nokia.radio-preset":["rpst"],"application/vnd.nokia.radio-presets":["rpss"],"application/vnd.novadigm.edm":["edm"],"application/vnd.novadigm.edx":["edx"],"application/vnd.novadigm.ext":["ext"],"application/vnd.oasis.opendocument.chart":["odc"],"application/vnd.oasis.opendocument.chart-template":["otc"],"application/vnd.oasis.opendocument.database":["odb"],"application/vnd.oasis.opendocument.formula":["odf"],"application/vnd.oasis.opendocument.formula-template":["odft"],"application/vnd.oasis.opendocument.graphics":["odg"],"application/vnd.oasis.opendocument.graphics-template":["otg"],"application/vnd.oasis.opendocument.image":["odi"],"application/vnd.oasis.opendocument.image-template":["oti"],"application/vnd.oasis.opendocument.presentation":["odp"],"application/vnd.oasis.opendocument.presentation-template":["otp"],"application/vnd.oasis.opendocument.spreadsheet":["ods"],"application/vnd.oasis.opendocument.spreadsheet-template":["ots"],"application/vnd.oasis.opendocument.text":["odt"],"application/vnd.oasis.opendocument.text-master":["odm"],"application/vnd.oasis.opendocument.text-template":["ott"],"application/vnd.oasis.opendocument.text-web":["oth"],"application/vnd.olpc-sugar":["xo"],"application/vnd.oma.dd2+xml":["dd2"],"application/vnd.openofficeorg.extension":["oxt"],"application/vnd.openxmlformats-officedocument.presentationml.presentation":["pptx"],"application/vnd.openxmlformats-officedocument.presentationml.slide":["sldx"],"application/vnd.openxmlformats-officedocument.presentationml.slideshow":["ppsx"],"application/vnd.openxmlformats-officedocument.presentationml.template":["potx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":["xlsx"],"application/vnd.openxmlformats-officedocument.spreadsheetml.template":["xltx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.document":["docx"],"application/vnd.openxmlformats-officedocument.wordprocessingml.template":["dotx"],"application/vnd.osgeo.mapguide.package":["mgp"],"application/vnd.osgi.dp":["dp"],"application/vnd.osgi.subsystem":["esa"],"application/vnd.palm":["pdb","pqa","oprc"],"application/vnd.pawaafile":["paw"],"application/vnd.pg.format":["str"],"application/vnd.pg.osasli":["ei6"],"application/vnd.picsel":["efif"],"application/vnd.pmi.widget":["wg"],"application/vnd.pocketlearn":["plf"],"application/vnd.powerbuilder6":["pbd"],"application/vnd.previewsystems.box":["box"],"application/vnd.proteus.magazine":["mgz"],"application/vnd.publishare-delta-tree":["qps"],"application/vnd.pvi.ptid1":["ptid"],"application/vnd.quark.quarkxpress":["qxd","qxt","qwd","qwt","qxl","qxb"],"application/vnd.realvnc.bed":["bed"],"application/vnd.recordare.musicxml":["mxl"],"application/vnd.recordare.musicxml+xml":["musicxml"],"application/vnd.rig.cryptonote":["cryptonote"],"application/vnd.rim.cod":["cod"],"application/vnd.rn-realmedia":["rm"],"application/vnd.rn-realmedia-vbr":["rmvb"],"application/vnd.route66.link66+xml":["link66"],"application/vnd.sailingtracker.track":["st"],"application/vnd.seemail":["see"],"application/vnd.sema":["sema"],"application/vnd.semd":["semd"],"application/vnd.semf":["semf"],"application/vnd.shana.informed.formdata":["ifm"],"application/vnd.shana.informed.formtemplate":["itp"],"application/vnd.shana.informed.interchange":["iif"],"application/vnd.shana.informed.package":["ipk"],"application/vnd.simtech-mindmapper":["twd","twds"],"application/vnd.smaf":["mmf"],"application/vnd.smart.teacher":["teacher"],"application/vnd.solent.sdkm+xml":["sdkm","sdkd"],"application/vnd.spotfire.dxp":["dxp"],"application/vnd.spotfire.sfs":["sfs"],"application/vnd.stardivision.calc":["sdc"],"application/vnd.stardivision.draw":["sda"],"application/vnd.stardivision.impress":["sdd"],"application/vnd.stardivision.math":["smf"],"application/vnd.stardivision.writer":["sdw","vor"],"application/vnd.stardivision.writer-global":["sgl"],"application/vnd.stepmania.package":["smzip"],"application/vnd.stepmania.stepchart":["sm"],"application/vnd.sun.xml.calc":["sxc"],"application/vnd.sun.xml.calc.template":["stc"],"application/vnd.sun.xml.draw":["sxd"],"application/vnd.sun.xml.draw.template":["std"],"application/vnd.sun.xml.impress":["sxi"],"application/vnd.sun.xml.impress.template":["sti"],"application/vnd.sun.xml.math":["sxm"],"application/vnd.sun.xml.writer":["sxw"],"application/vnd.sun.xml.writer.global":["sxg"],"application/vnd.sun.xml.writer.template":["stw"],"application/vnd.sus-calendar":["sus","susp"],"application/vnd.svd":["svd"],"application/vnd.symbian.install":["sis","sisx"],"application/vnd.syncml+xml":["xsm"],"application/vnd.syncml.dm+wbxml":["bdm"],"application/vnd.syncml.dm+xml":["xdm"],"application/vnd.tao.intent-module-archive":["tao"],"application/vnd.tcpdump.pcap":["pcap","cap","dmp"],"application/vnd.tmobile-livetv":["tmo"],"application/vnd.trid.tpt":["tpt"],"application/vnd.triscape.mxs":["mxs"],"application/vnd.trueapp":["tra"],"application/vnd.ufdl":["ufd","ufdl"],"application/vnd.uiq.theme":["utz"],"application/vnd.umajin":["umj"],"application/vnd.unity":["unityweb"],"application/vnd.uoml+xml":["uoml"],"application/vnd.vcx":["vcx"],"application/vnd.visio":["vsd","vst","vss","vsw"],"application/vnd.visionary":["vis"],"application/vnd.vsf":["vsf"],"application/vnd.wap.wbxml":["wbxml"],"application/vnd.wap.wmlc":["wmlc"],"application/vnd.wap.wmlscriptc":["wmlsc"],"application/vnd.webturbo":["wtb"],"application/vnd.wolfram.player":["nbp"],"application/vnd.wordperfect":["wpd"],"application/vnd.wqd":["wqd"],"application/vnd.wt.stf":["stf"],"application/vnd.xara":["xar"],"application/vnd.xfdl":["xfdl"],"application/vnd.yamaha.hv-dic":["hvd"],"application/vnd.yamaha.hv-script":["hvs"],"application/vnd.yamaha.hv-voice":["hvp"],"application/vnd.yamaha.openscoreformat":["osf"],"application/vnd.yamaha.openscoreformat.osfpvg+xml":["osfpvg"],"application/vnd.yamaha.smaf-audio":["saf"],"application/vnd.yamaha.smaf-phrase":["spf"],"application/vnd.yellowriver-custom-menu":["cmp"],"application/vnd.zul":["zir","zirz"],"application/vnd.zzazz.deck+xml":["zaz"],"application/voicexml+xml":["vxml"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/x-7z-compressed":["7z"],"application/x-abiword":["abw"],"application/x-ace-compressed":["ace"],"application/x-apple-diskimage":["dmg"],"application/x-authorware-bin":["aab","x32","u32","vox"],"application/x-authorware-map":["aam"],"application/x-authorware-seg":["aas"],"application/x-bcpio":["bcpio"],"application/x-bittorrent":["torrent"],"application/x-blorb":["blb","blorb"],"application/x-bzip":["bz"],"application/x-bzip2":["bz2","boz"],"application/x-cbr":["cbr","cba","cbt","cbz","cb7"],"application/x-cdlink":["vcd"],"application/x-cfs-compressed":["cfs"],"application/x-chat":["chat"],"application/x-chess-pgn":["pgn"],"application/x-chrome-extension":["crx"],"application/x-conference":["nsc"],"application/x-cpio":["cpio"],"application/x-csh":["csh"],"application/x-debian-package":["deb","udeb"],"application/x-dgc-compressed":["dgc"],"application/x-director":["dir","dcr","dxr","cst","cct","cxt","w3d","fgd","swa"],"application/x-doom":["wad"],"application/x-dtbncx+xml":["ncx"],"application/x-dtbook+xml":["dtb"],"application/x-dtbresource+xml":["res"],"application/x-dvi":["dvi"],"application/x-envoy":["evy"],"application/x-eva":["eva"],"application/x-font-bdf":["bdf"],"application/x-font-ghostscript":["gsf"],"application/x-font-linux-psf":["psf"],"application/x-font-otf":["otf"],"application/x-font-pcf":["pcf"],"application/x-font-snf":["snf"],"application/x-font-ttf":["ttf","ttc"],"application/x-font-type1":["pfa","pfb","pfm","afm"],"application/x-freearc":["arc"],"application/x-futuresplash":["spl"],"application/x-gca-compressed":["gca"],"application/x-glulx":["ulx"],"application/x-gnumeric":["gnumeric"],"application/x-gramps-xml":["gramps"],"application/x-gtar":["gtar"],"application/x-hdf":["hdf"],"application/x-install-instructions":["install"],"application/x-iso9660-image":["iso"],"application/x-java-jnlp-file":["jnlp"],"application/x-latex":["latex"],"application/x-lua-bytecode":["luac"],"application/x-lzh-compressed":["lzh","lha"],"application/x-mie":["mie"],"application/x-mobipocket-ebook":["prc","mobi"],"application/x-ms-application":["application"],"application/x-ms-shortcut":["lnk"],"application/x-ms-wmd":["wmd"],"application/x-ms-wmz":["wmz"],"application/x-ms-xbap":["xbap"],"application/x-msaccess":["mdb"],"application/x-msbinder":["obd"],"application/x-mscardfile":["crd"],"application/x-msclip":["clp"],"application/x-msdownload":["exe","dll","com","bat","msi"],"application/x-msmediaview":["mvb","m13","m14"],"application/x-msmetafile":["wmf","wmz","emf","emz"],"application/x-msmoney":["mny"],"application/x-mspublisher":["pub"],"application/x-msschedule":["scd"],"application/x-msterminal":["trm"],"application/x-mswrite":["wri"],"application/x-netcdf":["nc","cdf"],"application/x-nzb":["nzb"],"application/x-pkcs12":["p12","pfx"],"application/x-pkcs7-certificates":["p7b","spc"],"application/x-pkcs7-certreqresp":["p7r"],"application/x-rar-compressed":["rar"],"application/x-research-info-systems":["ris"],"application/x-sh":["sh"],"application/x-shar":["shar"],"application/x-shockwave-flash":["swf"],"application/x-silverlight-app":["xap"],"application/x-sql":["sql"],"application/x-stuffit":["sit"],"application/x-stuffitx":["sitx"],"application/x-subrip":["srt"],"application/x-sv4cpio":["sv4cpio"],"application/x-sv4crc":["sv4crc"],"application/x-t3vm-image":["t3"],"application/x-tads":["gam"],"application/x-tar":["tar"],"application/x-tcl":["tcl"],"application/x-tex":["tex"],"application/x-tex-tfm":["tfm"],"application/x-texinfo":["texinfo","texi"],"application/x-tgif":["obj"],"application/x-ustar":["ustar"],"application/x-wais-source":["src"],"application/x-web-app-manifest+json":["webapp"],"application/x-x509-ca-cert":["der","crt"],"application/x-xfig":["fig"],"application/x-xliff+xml":["xlf"],"application/x-xpinstall":["xpi"],"application/x-xz":["xz"],"application/x-zmachine":["z1","z2","z3","z4","z5","z6","z7","z8"],"application/xaml+xml":["xaml"],"application/xcap-diff+xml":["xdf"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xml":["xml","xsl","xsd"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mp4":["mp4a","m4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/vnd.dece.audio":["uva","uvva"],"audio/vnd.digital-winds":["eol"],"audio/vnd.dra":["dra"],"audio/vnd.dts":["dts"],"audio/vnd.dts.hd":["dtshd"],"audio/vnd.lucent.voice":["lvp"],"audio/vnd.ms-playready.media.pya":["pya"],"audio/vnd.nuera.ecelp4800":["ecelp4800"],"audio/vnd.nuera.ecelp7470":["ecelp7470"],"audio/vnd.nuera.ecelp9600":["ecelp9600"],"audio/vnd.rip":["rip"],"audio/webm":["weba"],"audio/x-aac":["aac"],"audio/x-aiff":["aif","aiff","aifc"],"audio/x-caf":["caf"],"audio/x-flac":["flac"],"audio/x-matroska":["mka"],"audio/x-mpegurl":["m3u"],"audio/x-ms-wax":["wax"],"audio/x-ms-wma":["wma"],"audio/x-pn-realaudio":["ram","ra"],"audio/x-pn-realaudio-plugin":["rmp"],"audio/x-wav":["wav"],"audio/xm":["xm"],"chemical/x-cdx":["cdx"],"chemical/x-cif":["cif"],"chemical/x-cmdf":["cmdf"],"chemical/x-cml":["cml"],"chemical/x-csml":["csml"],"chemical/x-xyz":["xyz"],"font/opentype":["otf"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/g3fax":["g3"],"image/gif":["gif"],"image/ief":["ief"],"image/jpeg":["jpeg","jpg","jpe"],"image/ktx":["ktx"],"image/png":["png"],"image/prs.btif":["btif"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/tiff":["tiff","tif"],"image/vnd.adobe.photoshop":["psd"],"image/vnd.dece.graphic":["uvi","uvvi","uvg","uvvg"],"image/vnd.djvu":["djvu","djv"],"image/vnd.dvb.subtitle":["sub"],"image/vnd.dwg":["dwg"],"image/vnd.dxf":["dxf"],"image/vnd.fastbidsheet":["fbs"],"image/vnd.fpx":["fpx"],"image/vnd.fst":["fst"],"image/vnd.fujixerox.edmics-mmr":["mmr"],"image/vnd.fujixerox.edmics-rlc":["rlc"],"image/vnd.ms-modi":["mdi"],"image/vnd.ms-photo":["wdp"],"image/vnd.net-fpx":["npx"],"image/vnd.wap.wbmp":["wbmp"],"image/vnd.xiff":["xif"],"image/webp":["webp"],"image/x-3ds":["3ds"],"image/x-cmu-raster":["ras"],"image/x-cmx":["cmx"],"image/x-freehand":["fh","fhc","fh4","fh5","fh7"],"image/x-icon":["ico"],"image/x-mrsid-image":["sid"],"image/x-pcx":["pcx"],"image/x-pict":["pic","pct"],"image/x-portable-anymap":["pnm"],"image/x-portable-bitmap":["pbm"],"image/x-portable-graymap":["pgm"],"image/x-portable-pixmap":["ppm"],"image/x-rgb":["rgb"],"image/x-tga":["tga"],"image/x-xbitmap":["xbm"],"image/x-xpixmap":["xpm"],"image/x-xwindowdump":["xwd"],"message/rfc822":["eml","mime"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/vnd.collada+xml":["dae"],"model/vnd.dwf":["dwf"],"model/vnd.gdl":["gdl"],"model/vnd.gtw":["gtw"],"model/vnd.mts":["mts"],"model/vnd.vtu":["vtu"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["x3db","x3dbz"],"model/x3d+vrml":["x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee"],"text/css":["css"],"text/csv":["csv"],"text/hjson":["hjson"],"text/html":["html","htm"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/prs.lines.tag":["dsc"],"text/richtext":["rtx"],"text/sgml":["sgml","sgm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vnd.curl":["curl"],"text/vnd.curl.dcurl":["dcurl"],"text/vnd.curl.mcurl":["mcurl"],"text/vnd.curl.scurl":["scurl"],"text/vnd.dvb.subtitle":["sub"],"text/vnd.fly":["fly"],"text/vnd.fmi.flexstor":["flx"],"text/vnd.graphviz":["gv"],"text/vnd.in3d.3dml":["3dml"],"text/vnd.in3d.spot":["spot"],"text/vnd.sun.j2me.app-descriptor":["jad"],"text/vnd.wap.wml":["wml"],"text/vnd.wap.wmlscript":["wmls"],"text/vtt":["vtt"],"text/x-asm":["s","asm"],"text/x-c":["c","cc","cxx","cpp","h","hh","dic"],"text/x-component":["htc"],"text/x-fortran":["f","for","f77","f90"],"text/x-handlebars-template":["hbs"],"text/x-java-source":["java"],"text/x-lua":["lua"],"text/x-markdown":["markdown","md","mkd"],"text/x-nfo":["nfo"],"text/x-opml":["opml"],"text/x-pascal":["p","pas"],"text/x-sass":["sass"],"text/x-scss":["scss"],"text/x-setext":["etx"],"text/x-sfv":["sfv"],"text/x-uuencode":["uu"],"text/x-vcalendar":["vcs"],"text/x-vcard":["vcf"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/vnd.dece.hd":["uvh","uvvh"],"video/vnd.dece.mobile":["uvm","uvvm"],"video/vnd.dece.pd":["uvp","uvvp"],"video/vnd.dece.sd":["uvs","uvvs"],"video/vnd.dece.video":["uvv","uvvv"],"video/vnd.dvb.file":["dvb"],"video/vnd.fvt":["fvt"],"video/vnd.mpegurl":["mxu","m4u"],"video/vnd.ms-playready.media.pyv":["pyv"],"video/vnd.uvvu.mp4":["uvu","uvvu"],"video/vnd.vivo":["viv"],"video/webm":["webm"],"video/x-f4v":["f4v"],"video/x-fli":["fli"],"video/x-flv":["flv"],"video/x-m4v":["m4v"],"video/x-matroska":["mkv","mk3d","mks"],"video/x-mng":["mng"],"video/x-ms-asf":["asf","asx"],"video/x-ms-vob":["vob"],"video/x-ms-wm":["wm"],"video/x-ms-wmv":["wmv"],"video/x-ms-wmx":["wmx"],"video/x-ms-wvx":["wvx"],"video/x-msvideo":["avi"],"video/x-sgi-movie":["movie"],"video/x-smv":["smv"],"x-conference/x-cooltalk":["ice"]}

},{}],64:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":65}],65:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],66:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],67:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],68:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],69:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":67,"./encode":68}],70:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],71:[function(require,module,exports){
var SortedArray = (function () {
    var SortedArray = defclass({
        constructor: function (array, compare) {
            this.array   = [];
            this.compare = compare || compareDefault;
            var length   = array.length;
            var index    = 0;

            while (index < length) this.insert(array[index++]);
        },
        insert: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var index   = array.length;

            array.push(element);

            while (index > 0) {
                var i = index, j = --index;

                if (compare(array[i], array[j]) < 0) {
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                }
            }

            return this;
        },
        search: function (element) {
            var array   = this.array;
            var compare = this.compare;
            var high    = array.length;
            var low     = 0;

            while (high > low) {
                var index    = (high + low) / 2 >>> 0;
                var ordering = compare(array[index], element);

                     if (ordering < 0) low  = index + 1;
                else if (ordering > 0) high = index;
                else return index;
            }

            return -1;
        },
        remove: function (element) {
            var index = this.search(element);
            if (index >= 0) this.array.splice(index, 1);
            return this;
        }
    });

    SortedArray.comparing = function (property, array) {
        return new SortedArray(array, function (a, b) {
            return compareDefault(property(a), property(b));
        });
    };

    return SortedArray;

    function defclass(prototype) {
        var constructor = prototype.constructor;
        constructor.prototype = prototype;
        return constructor;
    }

    function compareDefault(a, b) {
        if (a === b) return 0;
        return a < b ? -1 : 1;
    }
}());

if (typeof module === "object") module.exports = SortedArray;
if (typeof define === "function" && define.amd) define(SortedArray);
},{}],72:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

// Note: source-map-resolve.js is generated from source-map-resolve-node.js and
// source-map-resolve-template.js. Only edit the two latter files, _not_
// source-map-resolve.js!

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["source-map-url", "resolve-url"], factory)
  } else if (typeof exports === "object") {
    var sourceMappingURL = require("source-map-url")
    var resolveUrl = require("resolve-url")
    module.exports = factory(sourceMappingURL, resolveUrl)
  } else {
    root.sourceMapResolve = factory(root.sourceMappingURL, root.resolveUrl)
  }
}(this, function(sourceMappingURL, resolveUrl) {

  function callbackAsync(callback, error, result) {
    setImmediate(function() { callback(error, result) })
  }

  function parseMapToJSON(string) {
    return JSON.parse(string.replace(/^\)\]\}'/, ""))
  }



  function resolveSourceMap(code, codeUrl, read, callback) {
    var mapData
    try {
      mapData = resolveSourceMapHelper(code, codeUrl)
    } catch (error) {
      return callbackAsync(callback, error)
    }
    if (!mapData || mapData.map) {
      return callbackAsync(callback, null, mapData)
    }
    read(mapData.url, function(error, result) {
      if (error) {
        return callback(error)
      }
      try {
        mapData.map = parseMapToJSON(String(result))
      } catch (error) {
        return callback(error)
      }
      callback(null, mapData)
    })
  }

  function resolveSourceMapSync(code, codeUrl, read) {
    var mapData = resolveSourceMapHelper(code, codeUrl)
    if (!mapData || mapData.map) {
      return mapData
    }
    mapData.map = parseMapToJSON(String(read(mapData.url)))
    return mapData
  }

  var dataUriRegex = /^data:([^,;]*)(;[^,;]*)*(?:,(.*))?$/
  var jsonMimeTypeRegex = /^(?:application|text)\/json$/

  function resolveSourceMapHelper(code, codeUrl) {
    var url = sourceMappingURL.getFrom(code)
    if (!url) {
      return null
    }

    var dataUri = url.match(dataUriRegex)
    if (dataUri) {
      var mimeType = dataUri[1]
      var lastParameter = dataUri[2]
      var encoded = dataUri[3]
      if (!jsonMimeTypeRegex.test(mimeType)) {
        throw new Error("Unuseful data uri mime type: " + (mimeType || "text/plain"))
      }
      return {
        sourceMappingURL: url,
        url: null,
        sourcesRelativeTo: codeUrl,
        map: parseMapToJSON(lastParameter === ";base64" ? atob(encoded) : decodeURIComponent(encoded))
      }
    }

    var mapUrl = resolveUrl(codeUrl, url)
    return {
      sourceMappingURL: url,
      url: mapUrl,
      sourcesRelativeTo: mapUrl,
      map: null
    }
  }



  function resolveSources(map, mapUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    var pending = map.sources.length
    var errored = false
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }

    var done = function(error) {
      if (errored) {
        return
      }
      if (error) {
        errored = true
        return callback(error)
      }
      pending--
      if (pending === 0) {
        callback(null, result)
      }
    }

    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (typeof sourceContent === "string") {
        result.sourcesContent[index] = sourceContent
        callbackAsync(done, null)
      } else {
        read(fullUrl, function(error, source) {
          result.sourcesContent[index] = String(source)
          done(error)
        })
      }
    })
  }

  function resolveSourcesSync(map, mapUrl, read, options) {
    var result = {
      sourcesResolved: [],
      sourcesContent:  []
    }
    resolveSourcesHelper(map, mapUrl, options, function(fullUrl, sourceContent, index) {
      result.sourcesResolved[index] = fullUrl
      if (read !== null) {
        if (typeof sourceContent === "string") {
          result.sourcesContent[index] = sourceContent
        } else {
          result.sourcesContent[index] = String(read(fullUrl))
        }
      }
    })
    return result
  }

  var endingSlash = /\/?$/

  function resolveSourcesHelper(map, mapUrl, options, fn) {
    options = options || {}
    var fullUrl
    var sourceContent
    for (var index = 0, len = map.sources.length; index < len; index++) {
      if (map.sourceRoot && !options.ignoreSourceRoot) {
        // Make sure that the sourceRoot ends with a slash, so that `/scripts/subdir` becomes
        // `/scripts/subdir/<source>`, not `/scripts/<source>`. Pointing to a file as source root
        // does not make sense.
        fullUrl = resolveUrl(mapUrl, map.sourceRoot.replace(endingSlash, "/"), map.sources[index])
      } else {
        fullUrl = resolveUrl(mapUrl, map.sources[index])
      }
      sourceContent = (map.sourcesContent || [])[index]
      fn(fullUrl, sourceContent, index)
    }
  }



  function resolve(code, codeUrl, read, options, callback) {
    if (typeof options === "function") {
      callback = options
      options = {}
    }
    resolveSourceMap(code, codeUrl, read, function(error, mapData) {
      if (error) {
        return callback(error)
      }
      if (!mapData) {
        return callback(null, null)
      }
      resolveSources(mapData.map, mapData.sourcesRelativeTo, read, options, function(error, result) {
        if (error) {
          return callback(error)
        }
        mapData.sourcesResolved = result.sourcesResolved
        mapData.sourcesContent  = result.sourcesContent
        callback(null, mapData)
      })
    })
  }

  function resolveSync(code, codeUrl, read, options) {
    var mapData = resolveSourceMapSync(code, codeUrl, read)
    if (!mapData) {
      return null
    }
    var result = resolveSourcesSync(mapData.map, mapData.sourcesRelativeTo, read, options)
    mapData.sourcesResolved = result.sourcesResolved
    mapData.sourcesContent  = result.sourcesContent
    return mapData
  }



  return {
    resolveSourceMap:     resolveSourceMap,
    resolveSourceMapSync: resolveSourceMapSync,
    resolveSources:       resolveSources,
    resolveSourcesSync:   resolveSourcesSync,
    resolve:              resolve,
    resolveSync:          resolveSync
  }

}));

},{"resolve-url":70,"source-map-url":73}],73:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.sourceMappingURL = factory()
  }
}(this, function() {

  var innerRegex = /[#@] sourceMappingURL=([^\s'"]*)/

  var regex = RegExp(
    "(?:" +
      "/\\*" +
      "(?:\\s*\r?\n(?://)?)?" +
      "(?:" + innerRegex.source + ")" +
      "\\s*" +
      "\\*/" +
      "|" +
      "//(?:" + innerRegex.source + ")" +
    ")" +
    "\\s*$"
  )

  return {

    regex: regex,
    _innerRegex: innerRegex,

    getFrom: function(code) {
      var match = code.match(regex)
      return (match ? match[1] || match[2] || "" : null)
    },

    existsIn: function(code) {
      return regex.test(code)
    },

    removeFrom: function(code) {
      return code.replace(regex, "")
    },

    insertBefore: function(code, string) {
      var match = code.match(regex)
      if (match) {
        return code.slice(0, match.index) + string + code.slice(match.index)
      } else {
        return code + string
      }
    }
  }

}));

},{}],74:[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./source-map/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./source-map/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./source-map/source-node').SourceNode;

},{"./source-map/source-map-consumer":80,"./source-map/source-map-generator":81,"./source-map/source-node":82}],75:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * A data structure which is a combination of an array and a set. Adding a new
   * member is O(1), testing for membership is O(1), and finding the index of an
   * element is O(1). Removing elements from the set is not supported. Only
   * strings are supported for membership.
   */
  function ArraySet() {
    this._array = [];
    this._set = {};
  }

  /**
   * Static method for creating ArraySet instances from an existing array.
   */
  ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
    var set = new ArraySet();
    for (var i = 0, len = aArray.length; i < len; i++) {
      set.add(aArray[i], aAllowDuplicates);
    }
    return set;
  };

  /**
   * Add the given string to this set.
   *
   * @param String aStr
   */
  ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
    var isDuplicate = this.has(aStr);
    var idx = this._array.length;
    if (!isDuplicate || aAllowDuplicates) {
      this._array.push(aStr);
    }
    if (!isDuplicate) {
      this._set[util.toSetString(aStr)] = idx;
    }
  };

  /**
   * Is the given string a member of this set?
   *
   * @param String aStr
   */
  ArraySet.prototype.has = function ArraySet_has(aStr) {
    return Object.prototype.hasOwnProperty.call(this._set,
                                                util.toSetString(aStr));
  };

  /**
   * What is the index of the given string in the array?
   *
   * @param String aStr
   */
  ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
    if (this.has(aStr)) {
      return this._set[util.toSetString(aStr)];
    }
    throw new Error('"' + aStr + '" is not in the set.');
  };

  /**
   * What is the element at the given index?
   *
   * @param Number aIdx
   */
  ArraySet.prototype.at = function ArraySet_at(aIdx) {
    if (aIdx >= 0 && aIdx < this._array.length) {
      return this._array[aIdx];
    }
    throw new Error('No element indexed by ' + aIdx);
  };

  /**
   * Returns the array representation of this set (which has the proper indices
   * indicated by indexOf). Note that this is a copy of the internal array used
   * for storing the members so that no one can mess with internal state.
   */
  ArraySet.prototype.toArray = function ArraySet_toArray() {
    return this._array.slice();
  };

  exports.ArraySet = ArraySet;

});

},{"./util":83,"amdefine":9}],76:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64 = require('./base64');

  // A single base 64 digit can contain 6 bits of data. For the base 64 variable
  // length quantities we use in the source map spec, the first bit is the sign,
  // the next four bits are the actual value, and the 6th bit is the
  // continuation bit. The continuation bit tells us whether there are more
  // digits in this value following this digit.
  //
  //   Continuation
  //   |    Sign
  //   |    |
  //   V    V
  //   101011

  var VLQ_BASE_SHIFT = 5;

  // binary: 100000
  var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

  // binary: 011111
  var VLQ_BASE_MASK = VLQ_BASE - 1;

  // binary: 100000
  var VLQ_CONTINUATION_BIT = VLQ_BASE;

  /**
   * Converts from a two-complement value to a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
   *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
   */
  function toVLQSigned(aValue) {
    return aValue < 0
      ? ((-aValue) << 1) + 1
      : (aValue << 1) + 0;
  }

  /**
   * Converts to a two-complement value from a value where the sign bit is
   * placed in the least significant bit.  For example, as decimals:
   *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
   *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
   */
  function fromVLQSigned(aValue) {
    var isNegative = (aValue & 1) === 1;
    var shifted = aValue >> 1;
    return isNegative
      ? -shifted
      : shifted;
  }

  /**
   * Returns the base 64 VLQ encoded value.
   */
  exports.encode = function base64VLQ_encode(aValue) {
    var encoded = "";
    var digit;

    var vlq = toVLQSigned(aValue);

    do {
      digit = vlq & VLQ_BASE_MASK;
      vlq >>>= VLQ_BASE_SHIFT;
      if (vlq > 0) {
        // There are still more digits in this value, so we must make sure the
        // continuation bit is marked.
        digit |= VLQ_CONTINUATION_BIT;
      }
      encoded += base64.encode(digit);
    } while (vlq > 0);

    return encoded;
  };

  /**
   * Decodes the next base 64 VLQ value from the given string and returns the
   * value and the rest of the string via the out parameter.
   */
  exports.decode = function base64VLQ_decode(aStr, aOutParam) {
    var i = 0;
    var strLen = aStr.length;
    var result = 0;
    var shift = 0;
    var continuation, digit;

    do {
      if (i >= strLen) {
        throw new Error("Expected more digits in base 64 VLQ value.");
      }
      digit = base64.decode(aStr.charAt(i++));
      continuation = !!(digit & VLQ_CONTINUATION_BIT);
      digit &= VLQ_BASE_MASK;
      result = result + (digit << shift);
      shift += VLQ_BASE_SHIFT;
    } while (continuation);

    aOutParam.value = fromVLQSigned(result);
    aOutParam.rest = aStr.slice(i);
  };

});

},{"./base64":77,"amdefine":9}],77:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var charToIntMap = {};
  var intToCharMap = {};

  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    .split('')
    .forEach(function (ch, index) {
      charToIntMap[ch] = index;
      intToCharMap[index] = ch;
    });

  /**
   * Encode an integer in the range of 0 to 63 to a single base 64 digit.
   */
  exports.encode = function base64_encode(aNumber) {
    if (aNumber in intToCharMap) {
      return intToCharMap[aNumber];
    }
    throw new TypeError("Must be between 0 and 63: " + aNumber);
  };

  /**
   * Decode a single base 64 digit to an integer.
   */
  exports.decode = function base64_decode(aChar) {
    if (aChar in charToIntMap) {
      return charToIntMap[aChar];
    }
    throw new TypeError("Not a valid base 64 digit: " + aChar);
  };

});

},{"amdefine":9}],78:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * Recursive implementation of binary search.
   *
   * @param aLow Indices here and lower do not contain the needle.
   * @param aHigh Indices here and higher do not contain the needle.
   * @param aNeedle The element being searched for.
   * @param aHaystack The non-empty array being searched.
   * @param aCompare Function which takes two elements and returns -1, 0, or 1.
   */
  function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare) {
    // This function terminates when one of the following is true:
    //
    //   1. We find the exact element we are looking for.
    //
    //   2. We did not find the exact element, but we can return the index of
    //      the next closest element that is less than that element.
    //
    //   3. We did not find the exact element, and there is no next-closest
    //      element which is less than the one we are searching for, so we
    //      return -1.
    var mid = Math.floor((aHigh - aLow) / 2) + aLow;
    var cmp = aCompare(aNeedle, aHaystack[mid], true);
    if (cmp === 0) {
      // Found the element we are looking for.
      return mid;
    }
    else if (cmp > 0) {
      // aHaystack[mid] is greater than our needle.
      if (aHigh - mid > 1) {
        // The element is in the upper half.
        return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare);
      }
      // We did not find an exact match, return the next closest one
      // (termination case 2).
      return mid;
    }
    else {
      // aHaystack[mid] is less than our needle.
      if (mid - aLow > 1) {
        // The element is in the lower half.
        return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare);
      }
      // The exact needle element was not found in this haystack. Determine if
      // we are in termination case (2) or (3) and return the appropriate thing.
      return aLow < 0 ? -1 : aLow;
    }
  }

  /**
   * This is an implementation of binary search which will always try and return
   * the index of next lowest value checked if there is no exact hit. This is
   * because mappings between original and generated line/col pairs are single
   * points, and there is an implicit region between each of them, so a miss
   * just means that you aren't on the very start of a region.
   *
   * @param aNeedle The element you are looking for.
   * @param aHaystack The array that is being searched.
   * @param aCompare A function which takes the needle and an element in the
   *     array and returns -1, 0, or 1 depending on whether the needle is less
   *     than, equal to, or greater than the element, respectively.
   */
  exports.search = function search(aNeedle, aHaystack, aCompare) {
    if (aHaystack.length === 0) {
      return -1;
    }
    return recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack, aCompare)
  };

});

},{"amdefine":9}],79:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');

  /**
   * Determine whether mappingB is after mappingA with respect to generated
   * position.
   */
  function generatedPositionAfter(mappingA, mappingB) {
    // Optimized for most common case
    var lineA = mappingA.generatedLine;
    var lineB = mappingB.generatedLine;
    var columnA = mappingA.generatedColumn;
    var columnB = mappingB.generatedColumn;
    return lineB > lineA || lineB == lineA && columnB >= columnA ||
           util.compareByGeneratedPositions(mappingA, mappingB) <= 0;
  }

  /**
   * A data structure to provide a sorted view of accumulated mappings in a
   * performance conscious manner. It trades a neglibable overhead in general
   * case for a large speedup in case of mappings being added in order.
   */
  function MappingList() {
    this._array = [];
    this._sorted = true;
    // Serves as infimum
    this._last = {generatedLine: -1, generatedColumn: 0};
  }

  /**
   * Iterate through internal items. This method takes the same arguments that
   * `Array.prototype.forEach` takes.
   *
   * NOTE: The order of the mappings is NOT guaranteed.
   */
  MappingList.prototype.unsortedForEach =
    function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };

  /**
   * Add the given source mapping.
   *
   * @param Object aMapping
   */
  MappingList.prototype.add = function MappingList_add(aMapping) {
    var mapping;
    if (generatedPositionAfter(this._last, aMapping)) {
      this._last = aMapping;
      this._array.push(aMapping);
    } else {
      this._sorted = false;
      this._array.push(aMapping);
    }
  };

  /**
   * Returns the flat, sorted array of mappings. The mappings are sorted by
   * generated position.
   *
   * WARNING: This method returns internal data without copying, for
   * performance. The return value must NOT be mutated, and should be treated as
   * an immutable borrow. If you want to take ownership, you must make your own
   * copy.
   */
  MappingList.prototype.toArray = function MappingList_toArray() {
    if (!this._sorted) {
      this._array.sort(util.compareByGeneratedPositions);
      this._sorted = true;
    }
    return this._array;
  };

  exports.MappingList = MappingList;

});

},{"./util":83,"amdefine":9}],80:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var util = require('./util');
  var binarySearch = require('./binary-search');
  var ArraySet = require('./array-set').ArraySet;
  var base64VLQ = require('./base64-vlq');

  /**
   * A SourceMapConsumer instance represents a parsed source map which we can
   * query for information about the original file positions by giving it a file
   * position in the generated source.
   *
   * The only parameter is the raw source map (either as a JSON string, or
   * already parsed to an object). According to the spec, source maps have the
   * following attributes:
   *
   *   - version: Which version of the source map spec this map is following.
   *   - sources: An array of URLs to the original source files.
   *   - names: An array of identifiers which can be referrenced by individual mappings.
   *   - sourceRoot: Optional. The URL root from which all sources are relative.
   *   - sourcesContent: Optional. An array of contents of the original source files.
   *   - mappings: A string of base64 VLQs which contain the actual mappings.
   *   - file: Optional. The generated file this source map is associated with.
   *
   * Here is an example source map, taken from the source map spec[0]:
   *
   *     {
   *       version : 3,
   *       file: "out.js",
   *       sourceRoot : "",
   *       sources: ["foo.js", "bar.js"],
   *       names: ["src", "maps", "are", "fun"],
   *       mappings: "AA,AB;;ABCDE;"
   *     }
   *
   * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
   */
  function SourceMapConsumer(aSourceMap) {
    var sourceMap = aSourceMap;
    if (typeof aSourceMap === 'string') {
      sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
    }

    var version = util.getArg(sourceMap, 'version');
    var sources = util.getArg(sourceMap, 'sources');
    // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
    // requires the array) to play nice here.
    var names = util.getArg(sourceMap, 'names', []);
    var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
    var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
    var mappings = util.getArg(sourceMap, 'mappings');
    var file = util.getArg(sourceMap, 'file', null);

    // Once again, Sass deviates from the spec and supplies the version as a
    // string rather than a number, so we use loose equality checking here.
    if (version != this._version) {
      throw new Error('Unsupported version: ' + version);
    }

    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    sources = sources.map(util.normalize);

    // Pass `true` below to allow duplicate names and sources. While source maps
    // are intended to be compressed and deduplicated, the TypeScript compiler
    // sometimes generates source maps with duplicates in them. See Github issue
    // #72 and bugzil.la/889492.
    this._names = ArraySet.fromArray(names, true);
    this._sources = ArraySet.fromArray(sources, true);

    this.sourceRoot = sourceRoot;
    this.sourcesContent = sourcesContent;
    this._mappings = mappings;
    this.file = file;
  }

  /**
   * Create a SourceMapConsumer from a SourceMapGenerator.
   *
   * @param SourceMapGenerator aSourceMap
   *        The source map that will be consumed.
   * @returns SourceMapConsumer
   */
  SourceMapConsumer.fromSourceMap =
    function SourceMapConsumer_fromSourceMap(aSourceMap) {
      var smc = Object.create(SourceMapConsumer.prototype);

      smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                              smc.sourceRoot);
      smc.file = aSourceMap._file;

      smc.__generatedMappings = aSourceMap._mappings.toArray().slice();
      smc.__originalMappings = aSourceMap._mappings.toArray().slice()
        .sort(util.compareByOriginalPositions);

      return smc;
    };

  /**
   * The version of the source mapping spec that we are consuming.
   */
  SourceMapConsumer.prototype._version = 3;

  /**
   * The list of original sources.
   */
  Object.defineProperty(SourceMapConsumer.prototype, 'sources', {
    get: function () {
      return this._sources.toArray().map(function (s) {
        return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
      }, this);
    }
  });

  // `__generatedMappings` and `__originalMappings` are arrays that hold the
  // parsed mapping coordinates from the source map's "mappings" attribute. They
  // are lazily instantiated, accessed via the `_generatedMappings` and
  // `_originalMappings` getters respectively, and we only parse the mappings
  // and create these arrays once queried for a source location. We jump through
  // these hoops because there can be many thousands of mappings, and parsing
  // them is expensive, so we only want to do it if we must.
  //
  // Each object in the arrays is of the form:
  //
  //     {
  //       generatedLine: The line number in the generated code,
  //       generatedColumn: The column number in the generated code,
  //       source: The path to the original source file that generated this
  //               chunk of code,
  //       originalLine: The line number in the original source that
  //                     corresponds to this chunk of generated code,
  //       originalColumn: The column number in the original source that
  //                       corresponds to this chunk of generated code,
  //       name: The name of the original symbol which generated this chunk of
  //             code.
  //     }
  //
  // All properties except for `generatedLine` and `generatedColumn` can be
  // `null`.
  //
  // `_generatedMappings` is ordered by the generated positions.
  //
  // `_originalMappings` is ordered by the original positions.

  SourceMapConsumer.prototype.__generatedMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
    get: function () {
      if (!this.__generatedMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__generatedMappings;
    }
  });

  SourceMapConsumer.prototype.__originalMappings = null;
  Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
    get: function () {
      if (!this.__originalMappings) {
        this.__generatedMappings = [];
        this.__originalMappings = [];
        this._parseMappings(this._mappings, this.sourceRoot);
      }

      return this.__originalMappings;
    }
  });

  SourceMapConsumer.prototype._nextCharIsMappingSeparator =
    function SourceMapConsumer_nextCharIsMappingSeparator(aStr) {
      var c = aStr.charAt(0);
      return c === ";" || c === ",";
    };

  /**
   * Parse the mappings in a string in to a data structure which we can easily
   * query (the ordered arrays in the `this.__generatedMappings` and
   * `this.__originalMappings` properties).
   */
  SourceMapConsumer.prototype._parseMappings =
    function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var str = aStr;
      var temp = {};
      var mapping;

      while (str.length > 0) {
        if (str.charAt(0) === ';') {
          generatedLine++;
          str = str.slice(1);
          previousGeneratedColumn = 0;
        }
        else if (str.charAt(0) === ',') {
          str = str.slice(1);
        }
        else {
          mapping = {};
          mapping.generatedLine = generatedLine;

          // Generated column.
          base64VLQ.decode(str, temp);
          mapping.generatedColumn = previousGeneratedColumn + temp.value;
          previousGeneratedColumn = mapping.generatedColumn;
          str = temp.rest;

          if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
            // Original source.
            base64VLQ.decode(str, temp);
            mapping.source = this._sources.at(previousSource + temp.value);
            previousSource += temp.value;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source, but no line and column');
            }

            // Original line.
            base64VLQ.decode(str, temp);
            mapping.originalLine = previousOriginalLine + temp.value;
            previousOriginalLine = mapping.originalLine;
            // Lines are stored 0-based
            mapping.originalLine += 1;
            str = temp.rest;
            if (str.length === 0 || this._nextCharIsMappingSeparator(str)) {
              throw new Error('Found a source and line, but no column');
            }

            // Original column.
            base64VLQ.decode(str, temp);
            mapping.originalColumn = previousOriginalColumn + temp.value;
            previousOriginalColumn = mapping.originalColumn;
            str = temp.rest;

            if (str.length > 0 && !this._nextCharIsMappingSeparator(str)) {
              // Original name.
              base64VLQ.decode(str, temp);
              mapping.name = this._names.at(previousName + temp.value);
              previousName += temp.value;
              str = temp.rest;
            }
          }

          this.__generatedMappings.push(mapping);
          if (typeof mapping.originalLine === 'number') {
            this.__originalMappings.push(mapping);
          }
        }
      }

      this.__generatedMappings.sort(util.compareByGeneratedPositions);
      this.__originalMappings.sort(util.compareByOriginalPositions);
    };

  /**
   * Find the mapping that best matches the hypothetical "needle" mapping that
   * we are searching for in the given "haystack" of mappings.
   */
  SourceMapConsumer.prototype._findMapping =
    function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                           aColumnName, aComparator) {
      // To return the position we are searching for, we must first find the
      // mapping for the given position and then return the opposite position it
      // points to. Because the mappings are sorted, we can use binary search to
      // find the best mapping.

      if (aNeedle[aLineName] <= 0) {
        throw new TypeError('Line must be greater than or equal to 1, got '
                            + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError('Column must be greater than or equal to 0, got '
                            + aNeedle[aColumnName]);
      }

      return binarySearch.search(aNeedle, aMappings, aComparator);
    };

  /**
   * Compute the last column for each generated mapping. The last column is
   * inclusive.
   */
  SourceMapConsumer.prototype.computeColumnSpans =
    function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];

        // Mappings do not contain a field for the last generated columnt. We
        // can come up with an optimistic estimate, however, by assuming that
        // mappings are contiguous (i.e. given two consecutive mappings, the
        // first mapping ends where the second one starts).
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];

          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }

        // The last mapping for each line spans the entire line.
        mapping.lastGeneratedColumn = Infinity;
      }
    };

  /**
   * Returns the original source, line, and column information for the generated
   * source's line and column positions provided. The only argument is an object
   * with the following properties:
   *
   *   - line: The line number in the generated source.
   *   - column: The column number in the generated source.
   *
   * and an object is returned with the following properties:
   *
   *   - source: The original source file, or null.
   *   - line: The line number in the original source, or null.
   *   - column: The column number in the original source, or null.
   *   - name: The original identifier, or null.
   */
  SourceMapConsumer.prototype.originalPositionFor =
    function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util.getArg(aArgs, 'line'),
        generatedColumn: util.getArg(aArgs, 'column')
      };

      var index = this._findMapping(needle,
                                    this._generatedMappings,
                                    "generatedLine",
                                    "generatedColumn",
                                    util.compareByGeneratedPositions);

      if (index >= 0) {
        var mapping = this._generatedMappings[index];

        if (mapping.generatedLine === needle.generatedLine) {
          var source = util.getArg(mapping, 'source', null);
          if (source != null && this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
          return {
            source: source,
            line: util.getArg(mapping, 'originalLine', null),
            column: util.getArg(mapping, 'originalColumn', null),
            name: util.getArg(mapping, 'name', null)
          };
        }
      }

      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };

  /**
   * Returns the original source content. The only argument is the url of the
   * original source file. Returns null if no original source content is
   * availible.
   */
  SourceMapConsumer.prototype.sourceContentFor =
    function SourceMapConsumer_sourceContentFor(aSource) {
      if (!this.sourcesContent) {
        return null;
      }

      if (this.sourceRoot != null) {
        aSource = util.relative(this.sourceRoot, aSource);
      }

      if (this._sources.has(aSource)) {
        return this.sourcesContent[this._sources.indexOf(aSource)];
      }

      var url;
      if (this.sourceRoot != null
          && (url = util.urlParse(this.sourceRoot))) {
        // XXX: file:// URIs and absolute paths lead to unexpected behavior for
        // many users. We can help them out when they expect file:// URIs to
        // behave like it would if they were running a local HTTP server. See
        // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
        var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
        if (url.scheme == "file"
            && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
        }

        if ((!url.path || url.path == "/")
            && this._sources.has("/" + aSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + aSource)];
        }
      }

      throw new Error('"' + aSource + '" is not in the SourceMap.');
    };

  /**
   * Returns the generated line and column information for the original source,
   * line, and column positions provided. The only argument is an object with
   * the following properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *   - column: The column number in the original source.
   *
   * and an object is returned with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.generatedPositionFor =
    function SourceMapConsumer_generatedPositionFor(aArgs) {
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: util.getArg(aArgs, 'column')
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);

      if (index >= 0) {
        var mapping = this._originalMappings[index];

        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }

      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };

  /**
   * Returns all generated line and column information for the original source
   * and line provided. The only argument is an object with the following
   * properties:
   *
   *   - source: The filename of the original source.
   *   - line: The line number in the original source.
   *
   * and an array of objects is returned, each with the following properties:
   *
   *   - line: The line number in the generated source, or null.
   *   - column: The column number in the generated source, or null.
   */
  SourceMapConsumer.prototype.allGeneratedPositionsFor =
    function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      // When there is no exact match, SourceMapConsumer.prototype._findMapping
      // returns the index of the closest mapping less than the needle. By
      // setting needle.originalColumn to Infinity, we thus find the last
      // mapping for the given line, provided such a mapping exists.
      var needle = {
        source: util.getArg(aArgs, 'source'),
        originalLine: util.getArg(aArgs, 'line'),
        originalColumn: Infinity
      };

      if (this.sourceRoot != null) {
        needle.source = util.relative(this.sourceRoot, needle.source);
      }

      var mappings = [];

      var index = this._findMapping(needle,
                                    this._originalMappings,
                                    "originalLine",
                                    "originalColumn",
                                    util.compareByOriginalPositions);
      if (index >= 0) {
        var mapping = this._originalMappings[index];

        while (mapping && mapping.originalLine === needle.originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[--index];
        }
      }

      return mappings.reverse();
    };

  SourceMapConsumer.GENERATED_ORDER = 1;
  SourceMapConsumer.ORIGINAL_ORDER = 2;

  /**
   * Iterate over each mapping between an original source/line/column and a
   * generated line/column in this source map.
   *
   * @param Function aCallback
   *        The function that is called with each mapping.
   * @param Object aContext
   *        Optional. If specified, this object will be the value of `this` every
   *        time that `aCallback` is called.
   * @param aOrder
   *        Either `SourceMapConsumer.GENERATED_ORDER` or
   *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
   *        iterate over the mappings sorted by the generated file's line/column
   *        order or the original's source/line/column order, respectively. Defaults to
   *        `SourceMapConsumer.GENERATED_ORDER`.
   */
  SourceMapConsumer.prototype.eachMapping =
    function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

      var mappings;
      switch (order) {
      case SourceMapConsumer.GENERATED_ORDER:
        mappings = this._generatedMappings;
        break;
      case SourceMapConsumer.ORIGINAL_ORDER:
        mappings = this._originalMappings;
        break;
      default:
        throw new Error("Unknown order of iteration.");
      }

      var sourceRoot = this.sourceRoot;
      mappings.map(function (mapping) {
        var source = mapping.source;
        if (source != null && sourceRoot != null) {
          source = util.join(sourceRoot, source);
        }
        return {
          source: source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name
        };
      }).forEach(aCallback, context);
    };

  exports.SourceMapConsumer = SourceMapConsumer;

});

},{"./array-set":75,"./base64-vlq":76,"./binary-search":78,"./util":83,"amdefine":9}],81:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var base64VLQ = require('./base64-vlq');
  var util = require('./util');
  var ArraySet = require('./array-set').ArraySet;
  var MappingList = require('./mapping-list').MappingList;

  /**
   * An instance of the SourceMapGenerator represents a source map which is
   * being built incrementally. You may pass an object with the following
   * properties:
   *
   *   - file: The filename of the generated source.
   *   - sourceRoot: A root for all relative URLs in this source map.
   */
  function SourceMapGenerator(aArgs) {
    if (!aArgs) {
      aArgs = {};
    }
    this._file = util.getArg(aArgs, 'file', null);
    this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
    this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
    this._sources = new ArraySet();
    this._names = new ArraySet();
    this._mappings = new MappingList();
    this._sourcesContents = null;
  }

  SourceMapGenerator.prototype._version = 3;

  /**
   * Creates a new SourceMapGenerator based on a SourceMapConsumer
   *
   * @param aSourceMapConsumer The SourceMap.
   */
  SourceMapGenerator.fromSourceMap =
    function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot: sourceRoot
      });
      aSourceMapConsumer.eachMapping(function (mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };

        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util.relative(sourceRoot, newMapping.source);
          }

          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };

          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }

        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };

  /**
   * Add a single mapping from original source line and column to the generated
   * source's line and column for this source map being created. The mapping
   * object should have the following properties:
   *
   *   - generated: An object with the generated line and column positions.
   *   - original: An object with the original line and column positions.
   *   - source: The original source file (relative to the sourceRoot).
   *   - name: An optional original token name for this mapping.
   */
  SourceMapGenerator.prototype.addMapping =
    function SourceMapGenerator_addMapping(aArgs) {
      var generated = util.getArg(aArgs, 'generated');
      var original = util.getArg(aArgs, 'original', null);
      var source = util.getArg(aArgs, 'source', null);
      var name = util.getArg(aArgs, 'name', null);

      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }

      if (source != null && !this._sources.has(source)) {
        this._sources.add(source);
      }

      if (name != null && !this._names.has(name)) {
        this._names.add(name);
      }

      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source: source,
        name: name
      });
    };

  /**
   * Set the source content for a source file.
   */
  SourceMapGenerator.prototype.setSourceContent =
    function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util.relative(this._sourceRoot, source);
      }

      if (aSourceContent != null) {
        // Add the source content to the _sourcesContents map.
        // Create a new _sourcesContents map if the property is null.
        if (!this._sourcesContents) {
          this._sourcesContents = {};
        }
        this._sourcesContents[util.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        // Remove the source file from the _sourcesContents map.
        // If the _sourcesContents map is empty, set the property to null.
        delete this._sourcesContents[util.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };

  /**
   * Applies the mappings of a sub-source-map for a specific source file to the
   * source map being generated. Each mapping to the supplied source file is
   * rewritten using the supplied source map. Note: The resolution for the
   * resulting mappings is the minimium of this map and the supplied map.
   *
   * @param aSourceMapConsumer The source map to be applied.
   * @param aSourceFile Optional. The filename of the source file.
   *        If omitted, SourceMapConsumer's file property will be used.
   * @param aSourceMapPath Optional. The dirname of the path to the source map
   *        to be applied. If relative, it is relative to the SourceMapConsumer.
   *        This parameter is needed when the two source maps aren't in the same
   *        directory, and the source map to be applied contains relative source
   *        paths. If so, those relative source paths need to be rewritten
   *        relative to the SourceMapGenerator.
   */
  SourceMapGenerator.prototype.applySourceMap =
    function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      // If aSourceFile is omitted, we will use the file property of the SourceMap
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
            'or the source map\'s "file" property. Both were omitted.'
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      // Make "sourceFile" relative if an absolute Url is passed.
      if (sourceRoot != null) {
        sourceFile = util.relative(sourceRoot, sourceFile);
      }
      // Applying the SourceMap can add and remove items from the sources and
      // the names array.
      var newSources = new ArraySet();
      var newNames = new ArraySet();

      // Find mappings for the "sourceFile"
      this._mappings.unsortedForEach(function (mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          // Check if it can be mapped by the source map, then update the mapping.
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            // Copy mapping
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util.join(aSourceMapPath, mapping.source)
            }
            if (sourceRoot != null) {
              mapping.source = util.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }

        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }

        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }

      }, this);
      this._sources = newSources;
      this._names = newNames;

      // Copy sourcesContents of applied map.
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile = util.join(aSourceMapPath, sourceFile);
          }
          if (sourceRoot != null) {
            sourceFile = util.relative(sourceRoot, sourceFile);
          }
          this.setSourceContent(sourceFile, content);
        }
      }, this);
    };

  /**
   * A mapping can have one of the three levels of data:
   *
   *   1. Just the generated position.
   *   2. The Generated position, original position, and original source.
   *   3. Generated and original position, original source, as well as a name
   *      token.
   *
   * To maintain consistency, we validate that any new mapping being added falls
   * in to one of these categories.
   */
  SourceMapGenerator.prototype._validateMapping =
    function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                                aName) {
      if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
          && aGenerated.line > 0 && aGenerated.column >= 0
          && !aOriginal && !aSource && !aName) {
        // Case 1.
        return;
      }
      else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
               && aOriginal && 'line' in aOriginal && 'column' in aOriginal
               && aGenerated.line > 0 && aGenerated.column >= 0
               && aOriginal.line > 0 && aOriginal.column >= 0
               && aSource) {
        // Cases 2 and 3.
        return;
      }
      else {
        throw new Error('Invalid mapping: ' + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };

  /**
   * Serialize the accumulated mappings in to the stream of base 64 VLQs
   * specified by the source map format.
   */
  SourceMapGenerator.prototype._serializeMappings =
    function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = '';
      var mapping;

      var mappings = this._mappings.toArray();

      for (var i = 0, len = mappings.length; i < len; i++) {
        mapping = mappings[i];

        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            result += ';';
            previousGeneratedLine++;
          }
        }
        else {
          if (i > 0) {
            if (!util.compareByGeneratedPositions(mapping, mappings[i - 1])) {
              continue;
            }
            result += ',';
          }
        }

        result += base64VLQ.encode(mapping.generatedColumn
                                   - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;

        if (mapping.source != null) {
          result += base64VLQ.encode(this._sources.indexOf(mapping.source)
                                     - previousSource);
          previousSource = this._sources.indexOf(mapping.source);

          // lines are stored 0-based in SourceMap spec version 3
          result += base64VLQ.encode(mapping.originalLine - 1
                                     - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;

          result += base64VLQ.encode(mapping.originalColumn
                                     - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;

          if (mapping.name != null) {
            result += base64VLQ.encode(this._names.indexOf(mapping.name)
                                       - previousName);
            previousName = this._names.indexOf(mapping.name);
          }
        }
      }

      return result;
    };

  SourceMapGenerator.prototype._generateSourcesContent =
    function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function (source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util.relative(aSourceRoot, source);
        }
        var key = util.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents,
                                                    key)
          ? this._sourcesContents[key]
          : null;
      }, this);
    };

  /**
   * Externalize the source map.
   */
  SourceMapGenerator.prototype.toJSON =
    function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }

      return map;
    };

  /**
   * Render the source map being generated to a string.
   */
  SourceMapGenerator.prototype.toString =
    function SourceMapGenerator_toString() {
      return JSON.stringify(this);
    };

  exports.SourceMapGenerator = SourceMapGenerator;

});

},{"./array-set":75,"./base64-vlq":76,"./mapping-list":79,"./util":83,"amdefine":9}],82:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
  var util = require('./util');

  // Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
  // operating systems these days (capturing the result).
  var REGEX_NEWLINE = /(\r?\n)/;

  // Newline character code for charCodeAt() comparisons
  var NEWLINE_CODE = 10;

  // Private symbol for identifying `SourceNode`s when multiple versions of
  // the source-map library are loaded. This MUST NOT CHANGE across
  // versions!
  var isSourceNode = "$$$isSourceNode$$$";

  /**
   * SourceNodes provide a way to abstract over interpolating/concatenating
   * snippets of generated JavaScript source code while maintaining the line and
   * column information associated with the original source code.
   *
   * @param aLine The original line number.
   * @param aColumn The original column number.
   * @param aSource The original source's filename.
   * @param aChunks Optional. An array of strings which are snippets of
   *        generated JS, or other SourceNodes.
   * @param aName The original identifier.
   */
  function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
    this.children = [];
    this.sourceContents = {};
    this.line = aLine == null ? null : aLine;
    this.column = aColumn == null ? null : aColumn;
    this.source = aSource == null ? null : aSource;
    this.name = aName == null ? null : aName;
    this[isSourceNode] = true;
    if (aChunks != null) this.add(aChunks);
  }

  /**
   * Creates a SourceNode from generated code and a SourceMapConsumer.
   *
   * @param aGeneratedCode The generated code
   * @param aSourceMapConsumer The SourceMap for the generated code
   * @param aRelativePath Optional. The path that relative sources in the
   *        SourceMapConsumer should be relative to.
   */
  SourceNode.fromStringWithSourceMap =
    function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      // The SourceNode we want to fill with the generated code
      // and the SourceMap
      var node = new SourceNode();

      // All even indices of this array are one line of the generated code,
      // while all odd indices are the newlines between two adjacent lines
      // (since `REGEX_NEWLINE` captures its match).
      // Processed fragments are removed from this array, by calling `shiftNextLine`.
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var shiftNextLine = function() {
        var lineContents = remainingLines.shift();
        // The last line of a file might not have a newline.
        var newLine = remainingLines.shift() || "";
        return lineContents + newLine;
      };

      // We need to remember the position of "remainingLines"
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;

      // The generate SourceNodes we need a code range.
      // To extract it current and last mapping is used.
      // Here we store the last mapping.
      var lastMapping = null;

      aSourceMapConsumer.eachMapping(function (mapping) {
        if (lastMapping !== null) {
          // We add the code from "lastMapping" to "mapping":
          // First check if there is a new line in between.
          if (lastGeneratedLine < mapping.generatedLine) {
            var code = "";
            // Associate first line with "lastMapping"
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
            // The remaining code is added without mapping
          } else {
            // There is no new line in between.
            // Associate the code between "lastGeneratedColumn" and
            // "mapping.generatedColumn" with "lastMapping"
            var nextLine = remainingLines[0];
            var code = nextLine.substr(0, mapping.generatedColumn -
                                          lastGeneratedColumn);
            remainingLines[0] = nextLine.substr(mapping.generatedColumn -
                                                lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            // No more remaining code, continue
            lastMapping = mapping;
            return;
          }
        }
        // We add the generated code until the first mapping
        // to the SourceNode without any mapping.
        // Each line is added as separate string.
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[0];
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[0] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      // We have processed all mappings.
      if (remainingLines.length > 0) {
        if (lastMapping) {
          // Associate the remaining code in the current line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        // and add the remaining lines without any mapping
        node.add(remainingLines.join(""));
      }

      // Copy sourcesContent into SourceNode
      aSourceMapConsumer.sources.forEach(function (sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });

      return node;

      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === undefined) {
          node.add(code);
        } else {
          var source = aRelativePath
            ? util.join(aRelativePath, mapping.source)
            : mapping.source;
          node.add(new SourceNode(mapping.originalLine,
                                  mapping.originalColumn,
                                  source,
                                  code,
                                  mapping.name));
        }
      }
    };

  /**
   * Add a chunk of generated JS to this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.add = function SourceNode_add(aChunk) {
    if (Array.isArray(aChunk)) {
      aChunk.forEach(function (chunk) {
        this.add(chunk);
      }, this);
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      if (aChunk) {
        this.children.push(aChunk);
      }
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Add a chunk of generated JS to the beginning of this source node.
   *
   * @param aChunk A string snippet of generated JS code, another instance of
   *        SourceNode, or an array where each member is one of those things.
   */
  SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
    if (Array.isArray(aChunk)) {
      for (var i = aChunk.length-1; i >= 0; i--) {
        this.prepend(aChunk[i]);
      }
    }
    else if (aChunk[isSourceNode] || typeof aChunk === "string") {
      this.children.unshift(aChunk);
    }
    else {
      throw new TypeError(
        "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
      );
    }
    return this;
  };

  /**
   * Walk over the tree of JS snippets in this node and its children. The
   * walking function is called once for each snippet of JS and is passed that
   * snippet and the its original associated source's line/column location.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walk = function SourceNode_walk(aFn) {
    var chunk;
    for (var i = 0, len = this.children.length; i < len; i++) {
      chunk = this.children[i];
      if (chunk[isSourceNode]) {
        chunk.walk(aFn);
      }
      else {
        if (chunk !== '') {
          aFn(chunk, { source: this.source,
                       line: this.line,
                       column: this.column,
                       name: this.name });
        }
      }
    }
  };

  /**
   * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
   * each of `this.children`.
   *
   * @param aSep The separator.
   */
  SourceNode.prototype.join = function SourceNode_join(aSep) {
    var newChildren;
    var i;
    var len = this.children.length;
    if (len > 0) {
      newChildren = [];
      for (i = 0; i < len-1; i++) {
        newChildren.push(this.children[i]);
        newChildren.push(aSep);
      }
      newChildren.push(this.children[i]);
      this.children = newChildren;
    }
    return this;
  };

  /**
   * Call String.prototype.replace on the very right-most source snippet. Useful
   * for trimming whitespace from the end of a source node, etc.
   *
   * @param aPattern The pattern to replace.
   * @param aReplacement The thing to replace the pattern with.
   */
  SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
    var lastChild = this.children[this.children.length - 1];
    if (lastChild[isSourceNode]) {
      lastChild.replaceRight(aPattern, aReplacement);
    }
    else if (typeof lastChild === 'string') {
      this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
    }
    else {
      this.children.push(''.replace(aPattern, aReplacement));
    }
    return this;
  };

  /**
   * Set the source content for a source file. This will be added to the SourceMapGenerator
   * in the sourcesContent field.
   *
   * @param aSourceFile The filename of the source file
   * @param aSourceContent The content of the source file
   */
  SourceNode.prototype.setSourceContent =
    function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
    };

  /**
   * Walk over the tree of SourceNodes. The walking function is called for each
   * source file content and is passed the filename and source content.
   *
   * @param aFn The traversal function.
   */
  SourceNode.prototype.walkSourceContents =
    function SourceNode_walkSourceContents(aFn) {
      for (var i = 0, len = this.children.length; i < len; i++) {
        if (this.children[i][isSourceNode]) {
          this.children[i].walkSourceContents(aFn);
        }
      }

      var sources = Object.keys(this.sourceContents);
      for (var i = 0, len = sources.length; i < len; i++) {
        aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
      }
    };

  /**
   * Return the string representation of this source node. Walks over the tree
   * and concatenates all the various snippets together to one string.
   */
  SourceNode.prototype.toString = function SourceNode_toString() {
    var str = "";
    this.walk(function (chunk) {
      str += chunk;
    });
    return str;
  };

  /**
   * Returns the string representation of this source node along with a source
   * map.
   */
  SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
    var generated = {
      code: "",
      line: 1,
      column: 0
    };
    var map = new SourceMapGenerator(aArgs);
    var sourceMappingActive = false;
    var lastOriginalSource = null;
    var lastOriginalLine = null;
    var lastOriginalColumn = null;
    var lastOriginalName = null;
    this.walk(function (chunk, original) {
      generated.code += chunk;
      if (original.source !== null
          && original.line !== null
          && original.column !== null) {
        if(lastOriginalSource !== original.source
           || lastOriginalLine !== original.line
           || lastOriginalColumn !== original.column
           || lastOriginalName !== original.name) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
        lastOriginalSource = original.source;
        lastOriginalLine = original.line;
        lastOriginalColumn = original.column;
        lastOriginalName = original.name;
        sourceMappingActive = true;
      } else if (sourceMappingActive) {
        map.addMapping({
          generated: {
            line: generated.line,
            column: generated.column
          }
        });
        lastOriginalSource = null;
        sourceMappingActive = false;
      }
      for (var idx = 0, length = chunk.length; idx < length; idx++) {
        if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
          generated.line++;
          generated.column = 0;
          // Mappings end at eol
          if (idx + 1 === length) {
            lastOriginalSource = null;
            sourceMappingActive = false;
          } else if (sourceMappingActive) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
        } else {
          generated.column++;
        }
      }
    });
    this.walkSourceContents(function (sourceFile, sourceContent) {
      map.setSourceContent(sourceFile, sourceContent);
    });

    return { code: generated.code, map: map };
  };

  exports.SourceNode = SourceNode;

});

},{"./source-map-generator":81,"./util":83,"amdefine":9}],83:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module, require);
}
define(function (require, exports, module) {

  /**
   * This is a helper function for getting values from parameter/options
   * objects.
   *
   * @param args The object we are extracting values from
   * @param name The name of the property we are getting.
   * @param defaultValue An optional value to return if the property is missing
   * from the object. If this is not specified and the property is missing, an
   * error will be thrown.
   */
  function getArg(aArgs, aName, aDefaultValue) {
    if (aName in aArgs) {
      return aArgs[aName];
    } else if (arguments.length === 3) {
      return aDefaultValue;
    } else {
      throw new Error('"' + aName + '" is a required argument.');
    }
  }
  exports.getArg = getArg;

  var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
  var dataUrlRegexp = /^data:.+\,.+$/;

  function urlParse(aUrl) {
    var match = aUrl.match(urlRegexp);
    if (!match) {
      return null;
    }
    return {
      scheme: match[1],
      auth: match[2],
      host: match[3],
      port: match[4],
      path: match[5]
    };
  }
  exports.urlParse = urlParse;

  function urlGenerate(aParsedUrl) {
    var url = '';
    if (aParsedUrl.scheme) {
      url += aParsedUrl.scheme + ':';
    }
    url += '//';
    if (aParsedUrl.auth) {
      url += aParsedUrl.auth + '@';
    }
    if (aParsedUrl.host) {
      url += aParsedUrl.host;
    }
    if (aParsedUrl.port) {
      url += ":" + aParsedUrl.port
    }
    if (aParsedUrl.path) {
      url += aParsedUrl.path;
    }
    return url;
  }
  exports.urlGenerate = urlGenerate;

  /**
   * Normalizes a path, or the path portion of a URL:
   *
   * - Replaces consequtive slashes with one slash.
   * - Removes unnecessary '.' parts.
   * - Removes unnecessary '<dir>/..' parts.
   *
   * Based on code in the Node.js 'path' core module.
   *
   * @param aPath The path or url to normalize.
   */
  function normalize(aPath) {
    var path = aPath;
    var url = urlParse(aPath);
    if (url) {
      if (!url.path) {
        return aPath;
      }
      path = url.path;
    }
    var isAbsolute = (path.charAt(0) === '/');

    var parts = path.split(/\/+/);
    for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
      part = parts[i];
      if (part === '.') {
        parts.splice(i, 1);
      } else if (part === '..') {
        up++;
      } else if (up > 0) {
        if (part === '') {
          // The first part is blank if the path is absolute. Trying to go
          // above the root is a no-op. Therefore we can remove all '..' parts
          // directly after the root.
          parts.splice(i + 1, up);
          up = 0;
        } else {
          parts.splice(i, 2);
          up--;
        }
      }
    }
    path = parts.join('/');

    if (path === '') {
      path = isAbsolute ? '/' : '.';
    }

    if (url) {
      url.path = path;
      return urlGenerate(url);
    }
    return path;
  }
  exports.normalize = normalize;

  /**
   * Joins two paths/URLs.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be joined with the root.
   *
   * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
   *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
   *   first.
   * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
   *   is updated with the result and aRoot is returned. Otherwise the result
   *   is returned.
   *   - If aPath is absolute, the result is aPath.
   *   - Otherwise the two paths are joined with a slash.
   * - Joining for example 'http://' and 'www.example.com' is also supported.
   */
  function join(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }
    if (aPath === "") {
      aPath = ".";
    }
    var aPathUrl = urlParse(aPath);
    var aRootUrl = urlParse(aRoot);
    if (aRootUrl) {
      aRoot = aRootUrl.path || '/';
    }

    // `join(foo, '//www.example.org')`
    if (aPathUrl && !aPathUrl.scheme) {
      if (aRootUrl) {
        aPathUrl.scheme = aRootUrl.scheme;
      }
      return urlGenerate(aPathUrl);
    }

    if (aPathUrl || aPath.match(dataUrlRegexp)) {
      return aPath;
    }

    // `join('http://', 'www.example.com')`
    if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
      aRootUrl.host = aPath;
      return urlGenerate(aRootUrl);
    }

    var joined = aPath.charAt(0) === '/'
      ? aPath
      : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

    if (aRootUrl) {
      aRootUrl.path = joined;
      return urlGenerate(aRootUrl);
    }
    return joined;
  }
  exports.join = join;

  /**
   * Make a path relative to a URL or another path.
   *
   * @param aRoot The root path or URL.
   * @param aPath The path or URL to be made relative to aRoot.
   */
  function relative(aRoot, aPath) {
    if (aRoot === "") {
      aRoot = ".";
    }

    aRoot = aRoot.replace(/\/$/, '');

    // XXX: It is possible to remove this block, and the tests still pass!
    var url = urlParse(aRoot);
    if (aPath.charAt(0) == "/" && url && url.path == "/") {
      return aPath.slice(1);
    }

    return aPath.indexOf(aRoot + '/') === 0
      ? aPath.substr(aRoot.length + 1)
      : aPath;
  }
  exports.relative = relative;

  /**
   * Because behavior goes wacky when you set `__proto__` on objects, we
   * have to prefix all the strings in our set with an arbitrary character.
   *
   * See https://github.com/mozilla/source-map/pull/31 and
   * https://github.com/mozilla/source-map/issues/30
   *
   * @param String aStr
   */
  function toSetString(aStr) {
    return '$' + aStr;
  }
  exports.toSetString = toSetString;

  function fromSetString(aStr) {
    return aStr.substr(1);
  }
  exports.fromSetString = fromSetString;

  function strcmp(aStr1, aStr2) {
    var s1 = aStr1 || "";
    var s2 = aStr2 || "";
    return (s1 > s2) - (s1 < s2);
  }

  /**
   * Comparator between two mappings where the original positions are compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same original source/line/column, but different generated
   * line and column the same. Useful when searching for a mapping with a
   * stubbed out mapping.
   */
  function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
    var cmp;

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp || onlyCompareOriginal) {
      return cmp;
    }

    cmp = strcmp(mappingA.name, mappingB.name);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    return mappingA.generatedColumn - mappingB.generatedColumn;
  };
  exports.compareByOriginalPositions = compareByOriginalPositions;

  /**
   * Comparator between two mappings where the generated positions are
   * compared.
   *
   * Optionally pass in `true` as `onlyCompareGenerated` to consider two
   * mappings with the same generated line and column, but different
   * source/name/original line and column the same. Useful when searching for a
   * mapping with a stubbed out mapping.
   */
  function compareByGeneratedPositions(mappingA, mappingB, onlyCompareGenerated) {
    var cmp;

    cmp = mappingA.generatedLine - mappingB.generatedLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.generatedColumn - mappingB.generatedColumn;
    if (cmp || onlyCompareGenerated) {
      return cmp;
    }

    cmp = strcmp(mappingA.source, mappingB.source);
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalLine - mappingB.originalLine;
    if (cmp) {
      return cmp;
    }

    cmp = mappingA.originalColumn - mappingB.originalColumn;
    if (cmp) {
      return cmp;
    }

    return strcmp(mappingA.name, mappingB.name);
  };
  exports.compareByGeneratedPositions = compareByGeneratedPositions;

});

},{"amdefine":9}],84:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

var path = require("path")

"use strict"

function urix(aPath) {
  if (path.sep === "\\") {
    return aPath
      .replace(/\\/g, "/")
      .replace(/^[a-z]:\/?/i, "/")
  }
  return aPath
}

module.exports = urix

},{"path":64}],85:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":86,"punycode":66,"querystring":69}],86:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],87:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"dup":61}],88:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],89:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":88,"_process":65,"inherits":87}],90:[function(require,module,exports){
module.exports={
  "name": "habemus-editor-v2",
  "version": "1.0.0-alpha",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "bluebird": "^3.4.1",
    "clipboard-js": "^0.2.0",
    "h-account-client": "git+ssh://git@bitbucket.org/habemus-tutti/h-account-client.git",
    "h-dev-electron": "git+ssh://git@bitbucket.org/habemus-tutti/h-dev-electron.git",
    "h-project-client": "git+ssh://git@bitbucket.org/habemus-tutti/h-project-client.git",
    "h-ui-file-editor": "git+ssh://git@bitbucket.org/habemus-tutti/h-ui-file-editor.git",
    "h-urls": "git+ssh://git@bitbucket.org/habemus-tutti/h-urls.git",
    "h-workspace-client": "git+ssh://git@bitbucket.org/habemus-tutti/h-workspace-client.git",
    "happiness-tree": "git+ssh://git@bitbucket.org/habemus-tutti/happiness-tree.git",
    "path-to-regexp": "^1.5.3"
  },
  "devDependencies": {
    "brfs": "^1.4.3",
    "browser-sync": "^2.13.0",
    "browserify": "^13.0.1",
    "electron-prebuilt": "^1.2.5",
    "envify": "^3.4.1",
    "fs-extra": "^0.30.0",
    "gulp": "^3.9.1",
    "gulp-autoprefixer": "^3.1.0",
    "gulp-changed": "^1.3.0",
    "gulp-header": "^1.8.8",
    "gulp-if": "^2.0.1",
    "gulp-less": "^3.1.0",
    "gulp-load-plugins": "^1.2.4",
    "gulp-notify": "^2.2.0",
    "gulp-polymerize-css": "0.0.1",
    "gulp-rename": "^1.2.2",
    "gulp-size": "^2.1.0",
    "gulp-strip-debug": "^1.1.0",
    "gulp-uglify": "^2.0.0",
    "gulp-util": "^3.0.7",
    "polybuild": "^1.1.0",
    "rimraf": "^2.5.2",
    "run-sequence": "^1.2.2",
    "strictify": "^0.2.0",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0"
  }
}

},{}],91:[function(require,module,exports){
"use strict";
/**
 * Defines a property that cannot be modified
 * 
 * @param  {Object} obj
 * @param  {String} prop
 * @param  {*} value
 */
exports.defineFrozenProperty = function (obj, prop, value) {
  return Object.defineProperty(obj, prop, {
    configurable: false,
    enumerable: true,
    writable: false,
    value: value,
  });
};

exports.defineFrozenProperties = function (obj, values) {

  var _values = {};

  for (var prop in values) {
    _values[prop] = {
      configurable: false,
      enumerable: true,
      writable: false,
      value: values[prop],
    };
  }

  return Object.defineProperties(obj, _values);
};

},{}],92:[function(require,module,exports){
"use strict";
// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const initServices = require('./services');
const initUI       = require('./ui');
const initKeyboard = require('./keyboard');

// The application wrapper
var habemus = document.querySelector('#habemus');

// Only start setting up thing when WebComponentsReady event is fired
window.addEventListener('WebComponentsReady', function () {

  var options = {};

  return Bluebird.resolve(
      // services will load configurations as well
      // and make them available as a service (habemus.services.config)
      initServices(habemus, options)
    )
    .then(function () {
      return Bluebird.resolve(
        initUI(
          habemus,
          habemus.services.config
        )
      );
    })
    .then(function () {
      return Bluebird.resolve(
        initKeyboard(
          habemus,
          habemus.services.config
        )
      );
    });
});

// Export the component scope
module.exports = habemus;

},{"./keyboard":93,"./services":98,"./ui":106,"bluebird":11}],93:[function(require,module,exports){
"use strict";
// third-party dependencies
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var listener = new window.keypress.Listener();

  function _saveActiveFile(e) {
    e.preventDefault();
    habemus.ui.tabbedEditor.saveActiveFile();
  }

  function _closeActiveFile(e) {
    e.preventDefault();
    habemus.ui.tabbedEditor.closeActiveFile();
  }

  listener.simple_combo('cmd s', _saveActiveFile);
  listener.simple_combo('ctrl s', _saveActiveFile);

  listener.simple_combo('cmd w', _closeActiveFile);
  listener.simple_combo('ctrl w', _closeActiveFile);

  return Bluebird.resolve();
};
},{"bluebird":11}],94:[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

/**
 * Auxiliary function that reads a file reference from the browser
 * @param  {File} file
 * @return {Bluebird -> ArrayBuffer}
 */
function browserReadFile(file) {
  return new Bluebird(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function () {
      // resolve with the result
      resolve(reader.result);
    };
    
    // start reading
    reader.readAsArrayBuffer(file);
  });
};

module.exports = browserReadFile;

},{"bluebird":11}],95:[function(require,module,exports){
"use strict";
// TODO: data-model might be very useful as an isolate module

// native dependencies
const util         = require('util');
const EventEmitter = require('events');

function _iterateObject(obj, cb) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      cb(obj[prop], prop);
    }
  }
}

function DataModel() {
  /**
   * Object on which the in-memory version of data is stored.
   */
  this.data = {};
}
util.inherits(DataModel, EventEmitter);

/**
 * Sets key and emits required events
 */
DataModel.prototype.set = function () {
  
  if (typeof arguments[0] === 'object') {
    
    _iterateObject(arguments[0], function (newValue, key) {
      
      var oldValue = this.data[key];
      
      // only set if value has changed
      if (newValue !== oldValue) {
        
        var changeData = {
          key: key,
          oldValue: oldValue,
          newValue: newValue
        };
        
        this.data[key] = newValue;
        this.emit('change', changeData);
        this.emit('change:' + key, changeData);
      }
      
    }.bind(this));
    
  } else {
    var key = arguments[0];
    var newValue = arguments[1];
    var oldValue = this.data[key];
    
    // only set if value has changed
    if (newValue !== oldValue) {
      
      var changeData = {
        key: key,
        oldValue: oldValue,
        newValue: newValue
      };
      
      this.data[key] = newValue;
      this.emit('change', changeData);
      this.emit('change:' + key, changeData);
    }
  }
};

/**
 * Deletes the key
 */
DataModel.prototype.unset = function (key) {
  
  var oldValue = this.data[key];
  
  if (oldValue !== undefined) {
    var changeData = {
      key: key,
      oldValue: oldValue,
      newValue: undefined
    };
    
    delete this.data[key];
    this.emit('change', changeData);
    this.emit('change:' + key, changeData);
  }
};

/**
 * Retrieves the value for a given key
 */
DataModel.prototype.get = function (key) {
  return this.data[key];
};

module.exports = DataModel;

},{"events":23,"util":89}],96:[function(require,module,exports){
"use strict";
// native dependencies
const util         = require('util');

const DataModel = require('./data-model');

const TRAILING_UNDERLINE_RE = /_$/;

function ScopedWebStorage(prefix, localStorageAPI) {
  if (!localStorageAPI) {
    throw new Error('localStorageAPI is required');
  }
  
  if (!prefix) {
    throw new Error('prefix is required');
  }
  
  DataModel.call(this);

  // ensure trailing '_'
  prefix = TRAILING_UNDERLINE_RE.test(prefix) ? prefix : prefix + '_';
  
  this.prefix   = prefix;
  this.prefixRe = new RegExp('^' + prefix + '(.+)')
  this.ls       = localStorageAPI;
  
  // load data before attaching event handlers.
  // especially before start listening to changes on this instance
  this._load();
  
  // bind event handlers and attach them to the events
  this._handleStorageEvent = this._handleStorageEvent.bind(this);
  window.addEventListener('storage', this._handleStorageEvent, false);

  this._handleOwnChange = this._handleOwnChange.bind(this);
  this.on('change', this._handleOwnChange);
}
util.inherits(ScopedWebStorage, DataModel);

/**
 * Private method that generates the prefixed key
 */
ScopedWebStorage.prototype._prefix = function (key) {
  return this.prefix + key;
};

/**
 * Private method that removes the prefix from the key.
 * If the prefix is not present in the given key,
 * returns false.
 */
ScopedWebStorage.prototype._unprefix = function (fullKey) {
  // attempt to match the changedKey against the prefix regular expression
  var match = fullKey.match(this.prefixRe);
  
  if (match) {
    return match[1];
  } else {
    return false;
  }
};

ScopedWebStorage.prototype._handleStorageEvent = function (e) {
  // https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent
  // storage events happen at a global level and we should check
  // if the storage change event refers to a key relevant
  // to this instance
  var unprefixed = this._unprefix(e.key);
  if (unprefixed) {
    this.set(unprefixed, e.newValue);
  }
};

ScopedWebStorage.prototype._handleOwnChange = function (e) {
  // whenever changes happen in this instance,
  // set the changes into the localStorage.
  // according to specs, the storage event is not emitted
  // on the same page/tab that the storage change was made
  // according to MDN:
  // "The StorageEvent is fired whenever a change is made to the Storage object.
  // This won't work on the same page that is making the changes — 
  // it is really a way for other pages on the domain using the storage 
  // to sync any changes that are made. Pages on other domains can't access 
  // the same storage objects."
  // (https://developer.mozilla.org/en-US/
  // docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API)
  
  var lsKey = this._prefix(e.key);
  this.ls.setItem(lsKey, e.newValue);
};

/**
 * Loads data from the localStorage.
 * Loops through localStorage keys to check
 * which are relevant to this instance.
 * 
 * Used upon initialization.
 */
ScopedWebStorage.prototype._load = function () {
  
  var ls = this.ls;
  
  for (var i = 0; i < ls.length; i++) {
    var key = ls.key(i);
    var value = ls.getItem(key);
    
    var unprefixed = this._unprefix(key);
    if (unprefixed) {
      this.set(unprefixed, value);
    }
  }
};


/**
 * Methods that emulate WebStorage-ish interface
 */
ScopedWebStorage.prototype.setItem = function (key, value) {
  this.set(key, value);
};

ScopedWebStorage.prototype.getItem = function (key) {
  return this.get(key);
};

module.exports = ScopedWebStorage;

},{"./data-model":95,"util":89}],97:[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  /**
   * Prompt Dialog
   * @type {DOMElement}
   */
  var promptDialog = Polymer.Base.create('habemus-prompt-dialog', {});
  document.querySelector('body').appendChild(promptDialog);

  var alertDialog = Polymer.Base.create('habemus-alert-dialog', {});
  document.querySelector('body').appendChild(alertDialog);

  var confirmDialog = Polymer.Base.create('habemus-confirm-dialog', {});
  document.querySelector('body').appendChild(confirmDialog);

  /**
   * The dialogs API is designed as to look exactly as the
   * native dialogs API.
   *
   * Thus, all enhancements are passed in options that the native
   * dialog methods would actually ignore.
   */
  return {
    prompt: function (question, options) {
      return Bluebird.resolve(promptDialog.prompt(question, options));
    },

    confirm: function (message, options) {
      return Bluebird.resolve(confirmDialog.confirm(message, options));
    },

    alert: function (message, options) {
      return Bluebird.resolve(alertDialog.alert(message, options));
    },
  };

};

},{"bluebird":11}],98:[function(require,module,exports){
"use strict";
/**
 * This module initializes all services and makes
 * them available to the editor.
 * 
 * All services must be instantiated by this script.
 * 
 * Service constructors may be replaced for custom builds
 * for differing environments (browser, local, etc)
 */

// third-party dependencies
const Bluebird = require('bluebird');

// own
const aux = require('../aux');

module.exports = function (habemus, options) {

  // define the services singleton
  habemus.services = {};

  // start by initializing notification and dialog uis
  // so that we can inform the user about setup progress
  return Bluebird.all([
    require('./notification')(habemus, options),
    require('./dialogs')(habemus, options),
  ])
  .then(function (services) {

    aux.defineFrozenProperties(habemus.services, {
      notification: services[0],
      dialogs: services[1],
    });

    /**
     * Show the loading notification
     * and let it be manually removed
     */
    habemus.services.notification.loading.show({
      text: 'Setting up project',
      duration: Math.Infinity,
    });

    /**
     * Setup environment specific services:
     * Expects the module to define required services
     * onto habemus.services object
     *
     * - config
     * - hDev
     */
    return require('habemus-editor-services')(habemus, options);
  })
  .then(function () {

    if (!habemus.services.config) { throw new Error('config services MUST be defined'); }
    if (!habemus.services.config.projectId) { throw new Error('config.projectId MUST be defined'); }
    if (!habemus.services.hDev) { throw new Error('hDev service MUST be defined'); }

    return Bluebird.all([
      // project-config-storage depends on config.projectId
      require('./project-config-storage')(habemus, options),
    ]);
  })
  .then(function (services) {

    aux.defineFrozenProperties(habemus.services, {
      projectConfigStorage: services[0],
    });

    // TODO: deprecate services.localStorage
    Object.defineProperty(habemus.services, 'localStorage', {
      get: function () {
        console.warn(
          'habemus.services.localStorage will be removed in 1.0.0 release\n' + 
          'please use habemus.services.projectConfigStorage instead'
        );

        return habemus.services.projectConfigStorage;
      }
    });

    /**
     * Hide loading notification
     * and show success
     */
    habemus.services.notification.loading.hide();
    habemus.services.notification.success.show({
      text: 'All set!',
      duration: 7000,
    });

    return;
  })
  .then(function () {

    // freeze services
    Object.freeze(habemus.services);

  })
  .catch(function (err) {

    /**
     * Hide loading notification
     */
    habemus.services.notification.loading.hide();

    /**
     * TODO: these errors should be handled by the external service
     * instantiator.
     */
    switch (err.name) {
      case 'NotFound':
        // TODO:
        // study best way of implementing this messaging system.
        var msg = 'The requested project was not found.';
        msg += 'It may have been renamed recently or the address was mistyped.';

        if (habemus.services.config && habemus.services.config.cloud) {
          msg += 'Please go to the <a href="';
          msg += habemus.services.config.cloud.uiDashboardURI;
          msg += '">dashboard</a> ';
          msg += 'and access the desired workspace again.'
        }

        habemus.services.dialogs.alert(msg);

        break;
      case 'Unauthorized':
        // TODO:
        // study best way of implementing this messaging system.
        var msg = 'Your account does not have the right permissions to access this workspace.';
        msg += 'We are sorry :(';

        if (habemus.services.config && habemus.services.config.cloud) {
          msg += 'Please go to the <a href="';
          msg += habemus.services.config.cloud.uiDashboardURI;
          msg += '">dashboard</a> ';
          msg += 'and access the desired workspace again.'
        }

        habemus.services.dialogs.alert(msg);

        break;
      default:
        /**
         * Unknown error
         * @type {String}
         */
        habemus.services.notification.error.show({
          text: 'An unexpected error occurred: ' + err.name,
          duration: Math.Infinity, 
        });

        console.warn(err);
        break;
    }
  });
};
},{"../aux":91,"./dialogs":97,"./notification":99,"./project-config-storage":100,"bluebird":11,"habemus-editor-services":"habemus-editor-services"}],99:[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  /**
   * Loading toast.
   * Used for displaying data about loading statuses.
   * 
   * @type {DOMElement}
   */
  var loadingToast = Polymer.Base.create('paper-toast', {});
  loadingToast.classList.add('notification', 'loading');
  document.querySelector('body').appendChild(loadingToast);

  var spinningIcon = Polymer.Base.create('iron-icon', {
    icon: 'cached'
  });
  spinningIcon.classList.add('spin');

  Polymer.dom(loadingToast).appendChild(spinningIcon);

  /**
   * Success toast.
   * Used for displaying data about success
   * 
   * @type {DOMElement}
   */
  var successToast = Polymer.Base.create('paper-toast', {});
  successToast.classList.add('notification', 'loading');
  document.querySelector('body').appendChild(successToast);

  var successIcon = Polymer.Base.create('iron-icon', {
    icon: 'check'
  });

  Polymer.dom(successToast).appendChild(successIcon);

  /**
   * Error toast
   * Used for displaying data about errors.
   * @type {DOMElement}
   */
  var errorToast = Polymer.Base.create('paper-toast', {});
  errorToast.classList.add('notification', 'error');
  document.querySelector('body').appendChild(errorToast);

  var errorIcon = Polymer.Base.create('iron-icon', {
    icon: 'error'
  });

  Polymer.dom(errorToast).appendChild(errorIcon);

  /**
   * This API is still in study.
   * But one idea is to follow `console` or PaperToast apis.
   */
  return {
    loading: loadingToast,
    success: successToast,
    error: errorToast,
  };

};

},{"bluebird":11}],100:[function(require,module,exports){
"use strict";
// own deps
const ScopedWebStorage = require('../lib/scoped-web-storage');

module.exports = function (habemus, options) {
  // use the projectId in the prefix
  const PROJECT_CONFIG_PREFIX = 
    'habemus_config_' + habemus.services.config.projectId;

  return new ScopedWebStorage(PROJECT_CONFIG_PREFIX, window.localStorage);
};

},{"../lib/scoped-web-storage":96}],101:[function(require,module,exports){
"use strict";
// third-party
const clipboard = require('clipboard-js');
const Bluebird  = require('bluebird');

// own
const browserReadFile = require('../../lib/browser-read-file');

function _wait(ms) {
  return new Bluebird(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}

module.exports = function (habemus, options) {

  // defaults to 20MB
  const maxFileUploadSize = options.maxFileUploadSize || 20971520;

  /**
   * Reference to the hDev api.
   * @type {HDevAuthenticatedClient}
   */
  const hDev = habemus.services.hDev;

  /**
   * Reference to the ui element iframeBrowser
   */
  const iframeBrowser = habemus.ui.iframeBrowser;

  /**
   * Auxiliary function that reads the contents from a browser
   * file object and writes it to the hDev api.
   * 
   * @param  {String} basepath
   * @param  {File} file
   * @return {Bluebird}
   */
  function _uploadFile(basepath, file) {

    var fileName = file.name;
    var fileSize = file.size;

    if (!fileName) {
      /**
       * No name
       */
      habemus.services.notification.error.show({
        text: 'Could not identify the name of the selected file.',
        duration: 4000, 
      });

      return;
    }

    if (fileSize > maxFileUploadSize) {
      /**
       * Max size]
       */
      habemus.services.notification.error.show({
        text: 'The file "' + fileName + '" exeeds the max upload size',
        duration: 4000, 
      });

      return;
    }

    habemus.services.notification.loading.show({
      text: 'Reading "' + fileName + '"...',
      duration: Math.Infinity
    });

    return _wait(500).then(function () {

      return browserReadFile(file);

    }).then(function (fileContents) {

      habemus.services.notification.loading.show({
        text: 'Uploading "' + fileName + '"',
        duration: Math.Infinity,
      })

      var filepath = basepath + '/' + fileName;

      return hDev.createFile(filepath, fileContents);
    })
    .then(function () {

      habemus.services.notification.loading.hide();
      habemus.services.notification.success.show({
        text: '"' + fileName + '" successfully uploaded',
        duration: 3000,
      });

      // aritificially delay some milliseconds so that
      // the experience is better
      return _wait(500);
    })
    .catch(function (err) {

      habemus.services.notification.loading.hide();
      habemus.services.notification.error.show({
        text: 'Upload failed: ' + err.name,
        duration: 3000
      });

      console.warn(err);

      return _wait(2000);
    });
  }

  /**
   * Reference to the dialogs service.
   * 
   * @type {Object}
   *       - prompt
   *       - confirm
   *       - alert
   */
  const dialogs = habemus.services.dialogs;

  return function genDirMenu(tree) {
    return [
      {
        label: 'remove',
        callback: function (data) {
          // close the context menu immediately
          data.menuElement.close();
          var nodeModel = data.context;

          var path = nodeModel.path;

          var msg = [
            'Confirm removing all files in the directory `',
            path,
            '` This action cannot be undone.'
          ].join('');

          dialogs.confirm(msg)
            .then(function confrmed() {

              return hDev.remove(path)
            }, function cancelled() {
              console.log('removal cancelled by user');
            })
            .catch(function (err) {
              alert('error removing');
              console.warn(err);
            });
        }
      },
      {
        label: 'copy path',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          clipboard.copy(nodeModel.path)
            .then(function () {
              console.log('copied')
            });
        }
      },
      // {
      //   label: 'open in browser',
      //   type: 'url',
      //   target: '_blank',
      //   url: function (data) {
      //     var nodeModel = data.context;
      //     
      //     // TODO: study best way of dealing with getURL that seems
      //     // to be available only at file nodes.
      //     return nodeModel.getURL();
      //   }
      // },
      // {
      //   label: 'open in iframe',
      //   callback: function (data) {
      //     data.menuElement.close();

      //     iframeBrowser.open(data.context.path);
      //   }
      // },
      {
        label: 'upload',
        type: 'input:file',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;
          var basepath  = nodeModel.path;

          var files = data.files;

          if (!files) {
            return;
          }

          return files.reduce(function (lastUploadPromise, file) {

            return lastUploadPromise.then(function () {
              return _uploadFile(basepath, file);
            });

          }, Bluebird.resolve());

        },
      }
    ];
  };
};

},{"../../lib/browser-read-file":94,"bluebird":11,"clipboard-js":15}],102:[function(require,module,exports){
"use strict";
// third-party
const clipboard = require('clipboard-js');
const Bluebird  = require('bluebird');

module.exports = function (habemus, options) {

  /**
   * Reference to the hDev api.
   * @type {HDevAuthenticatedClient}
   */
  const hDev = habemus.services.hDev;

  /**
   * Reference to the ui element iframeBrowser
   */
  const iframeBrowser = habemus.ui.iframeBrowser;

  /**
   * Reference to the dialogs service.
   * 
   * @type {Object}
   *       - prompt
   *       - confirm
   *       - alert
   */
  const dialogs = habemus.services.dialogs;

  return function genFileMenu(tree) {
    return [
      {
        label: 'duplicate',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          var path = nodeModel.path;

          return Bluebird.all([
            dialogs.prompt('Duplicate path', {
              submit: 'duplicate',
              defaultValue: path + '-copy',
            }),
            hDev.readFile(path),
          ])
          .then(function (results) {

            var targetPath = results[0];
            var contents   = results[1];

            if (!targetPath) {
              return Bluebird.reject(new Error('targetPath is required'));
            }

            return hDev.createFile(targetPath, contents);
          });
        }
      },
      {
        label: 'remove',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          var path = nodeModel.path;

          var msg = [
            'Confirm removing `',
            path,
            '` This action cannot be undone.'
          ].join('');

          dialogs.confirm(msg)
            .then(function confrmed() {

              return hDev.remove(path);
            }, function cancelled() {
              console.log('removal cancelled by user');
            })
            .catch(function (err) {
              alert('error removing');
              console.warn(err);
            });
        }
      },
      {
        label: 'copy path',
        callback: function (data) {
          data.menuElement.close();
          var nodeModel = data.context;

          clipboard.copy(nodeModel.path)
            .then(function () {
              console.log('copied')
            });
        }
      },
      {
        label: 'open in browser',
        type: 'url',
        target: '_blank',
        url: function (data) {
          var nodeModel = data.context;

          return nodeModel.getURL();
        }
      },
      {
        label: 'open in iframe',
        callback: function (data) {
          data.menuElement.close();

          iframeBrowser.open(data.context.path);
        }
      }
    ];
  }
};
},{"bluebird":11,"clipboard-js":15}],103:[function(require,module,exports){
"use strict";
// external habemus-modules
const happinessTree = require('happiness-tree');

module.exports = function (habemus, options) {

  // reference to the tabbed editor instance
  var tabbedEditor = habemus.ui.tabbedEditor;
  if (!tabbedEditor) { throw new Error('tabbedEditor is required'); }

  // instantiate a tree navigator
  var tree = happinessTree({
    hDev: habemus.services.hDev,
    rootName: habemus.services.config.projectName,
    
    // the menu generators
    dirMenu: require('./dir-menu')(habemus, options),
    fileMenu: require('./file-menu')(habemus, options),
  });
  tree.attach(document.querySelector('#file-tree-container'));

  /**
   * Wire up the tree ui with the tabbedEditor
   */
  tree.uiAddTreeEventListener('dblclick', 'leaf', function (data) {
    tabbedEditor.openFile(data.model.path);
  });
  tree.uiAddTreeEventListener('click', 'leaf', function (data) {
    tabbedEditor.viewFile(data.model.path);
  });
  tabbedEditor.on('active-filepath-changed', function (current, previous) {

    if (tree.rootModel.getNodeByPath(current)) {

      // if the current filepath is in the tree
      // mark it as selected and deselect all others
      tree.uiSelect(current, {
        clearSelection: true
      });
    }
  });
  
  // run initial load
  tree.openDirectory('');

  return tree;
}
},{"./dir-menu":101,"./file-menu":102,"happiness-tree":37}],104:[function(require,module,exports){
"use strict";
// native
const util         = require('util');
const EventEmitter = require('events');

const STARTING_SLASH_RE = /^\//;
const TRAILING_SLASH_RE = /\/$/;

function _joinPaths(part1, part2) {
  part1 = part1.replace(TRAILING_SLASH_RE, '');
  part2 = part2.replace(STARTING_SLASH_RE, '');
  return part1 + '/' + part2;
}

/**
 * IframeBrowser constructor.
 * 
 * @param {Object} options
 */
function IframeBrowser(options) {

  if (!options.hDev) {
    throw new Error('hDev is required');
  }

  if (!options.structure) {
    throw new Error('structure is required');
  }

  /**
   * The hDev client
   * @type {HDev client}
   */
  this.hDev = options.hDev;

  /**
   * Reference to the editor's structure element
   * @type {DOMElement}
   */
  this.habemusStructure = options.structure;

  /**
   * Browser control element
   * @type {DOMElement}
   */
  this.controlsEl = Polymer.Base.create('habemus-browser-controls', {
    computeLocationURL: function (location) {
      return _joinPaths(this.hDev.projectRootURL, location);
    }.bind(this),
  });
  var controlsEl = this.controlsEl;

  /**
   * Iframe element
   * @type {DOMElement}
   */
  this.iframeEl = document.createElement('iframe');
  var iframeEl = this.iframeEl;

  /**
   * Setup event listeners
   */
  controlsEl.addEventListener('location-changed', function (e) {

    var location = controlsEl.get('location');

    var fullLocation = _joinPaths(this.hDev.projectRootURL, location);

    // update the iframe's src and the newTabAnchor's href
    this.iframeEl.setAttribute('src', fullLocation);

  }.bind(this));

  controlsEl.addEventListener('close-intent', function (e) {
    this.habemusStructure.setMode('LC');
  }.bind(this));
  
}

util.inherits(IframeBrowser, EventEmitter);

IframeBrowser.prototype.open = function (location) {
  this.habemusStructure.setMode('LCR');

  if (typeof location === 'string') {
    this.goTo(location);
  }
};

/**
 * Control proxy methods:
 */
IframeBrowser.prototype.goTo = function (location) {
  this.controlsEl.goTo(location);
};

IframeBrowser.prototype.goBack = function () {
  this.controlsEl.goBack();
};

IframeBrowser.prototype.goForward = function () {
  this.controlsEl.goForward();
};

/**
 * Method that attaches all elements of the IframeBrowser to the given node.
 * @param  {DOMElement} containerElement
 * @return {undefined}
 */
IframeBrowser.prototype.attach = function (containerElement) {

  this.containerElement = containerElement;

  this.containerElement.appendChild(this.controlsEl);
  this.containerElement.appendChild(this.iframeEl);

};


module.exports = IframeBrowser;

},{"events":23,"util":89}],105:[function(require,module,exports){
"use strict";
const IframeBrowser = require('./constructor');

module.exports = function (habemus, options) {
  
  var iframeBrowser = new IframeBrowser({
    hDev: habemus.services.hDev,
    structure: habemus.ui.structure,
  });

  iframeBrowser.attach(document.querySelector('#iframe-browser'));

  return iframeBrowser;
}
},{"./constructor":104}],106:[function(require,module,exports){
"use strict";
// third-party dependencies
const Bluebird = require('bluebird');

// own
const aux = require('../aux');

module.exports = function (habemus, options) {

  /**
   * Define the ui singleton onto the main habemus object
   * @type {Object}
   */
  habemus.ui = {};

  return Bluebird.all([
    require('./structure')(habemus, options),
  ])
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      structure: components[0],
    });

    return Bluebird.all([
      require('./iframe-browser')(habemus, options),
      require('./tabbed-editor')(habemus, options),
    ]);
  })
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      iframeBrowser: components[0],
      tabbedEditor: components[1],
    });

    return Bluebird.all([
      require('./file-tree')(habemus, options),
    ]);
  })
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      fileTree: components[0],
    });

    return require('habemus-editor-ui')(habemus, options);
  })
  .then(function () {
    // freeze ui components
    Object.freeze(habemus.ui);

    /**
     * Set structure to show header and footer
     * according to the components defined
     */
    if (habemus.ui.header) {
      habemus.ui.structure.set('header', true);
    }

    if (habemus.ui.footer) {
      habemus.ui.structure.set('footer', true);
    }
  });
};

},{"../aux":91,"./file-tree":103,"./iframe-browser":105,"./structure":107,"./tabbed-editor":109,"bluebird":11,"habemus-editor-ui":"habemus-editor-ui"}],107:[function(require,module,exports){
"use strict";
module.exports = function (habemus, options) {
  return document.querySelector('#structure');
};

},{}],108:[function(require,module,exports){
"use strict";
// native dependencies
const EventEmitter = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

const FileEditor = require('h-ui-file-editor');

const CLEAN_UP_INTERVAL = 4000;
const CLEAN_UP_DELAY    = 10000;

/**
 * Editor container constructor
 * @param {Object} options
 *        - ace
 *        - hDev
 */
function EditorManager(options) {
  
  /**
   * Reference to the ace global variable
   */
  this.ace = options.ace;
  
  /**
   * The HFS Api to be used by all editors
   */
  this.hDev = options.hDev;
  
  /**
   * The editor manager wrapping element.
   * All editor elements will be appended to this element.
   */
  this.element = document.createElement('div');
  this.element.style.height = 'calc(100% - 32px)';

  /**
   * Array to store a reference to 
   * all fileEditors created
   * @type {Array}
   */
  this._fileEditors = [];
  
  /**
   * Set an interval for temporary fileEditor clean up
   */
  this._setCleanUpInterval(CLEAN_UP_INTERVAL);
}

/**
 * Editors may be flagged as temporary.
 * Temporary editors are cleaned up in the cleanup interval.
 */
EditorManager.prototype._setCleanUpInterval = function (ms) {
  this._cleanUpInterval = setInterval(function () {
    
    this._fileEditors.forEach(function (fileEditor) {
      if (!fileEditor.persistent &&
          (Date.now() - fileEditor.createdAt) > CLEAN_UP_DELAY && 
          fileEditor.element.getAttribute('hidden')) {
        // only destroy non-persistent and hidden editors
        // TODO: make the hidden flag become internal to the fileEditor
        this.destroyEditor(fileEditor.filepath);
      }
    }.bind(this));
    
  }.bind(this), ms);
};

EditorManager.prototype._clearCleanUpInterval = function (ms) {
  clearInterval(this._cleanUpInterval);
};

/**
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
EditorManager.prototype.attach = function (containerElement) {
  this.containerElement = containerElement;
  this.containerElement.appendChild(this.element);
};

/**
 * Creates a file editor object
 * attaches to the container and adds to the _fileEditors array
 * 
 * Flags the editor's persistence
 */
EditorManager.prototype.createEditor = function (persistent) {
  // create an element for the editor
  var editorEl = document.createElement('div');
  editorEl.style.height = '100%';

  // instantiate a file editor
  var fileEditor = new FileEditor(
    this.ace,
    editorEl,
    this.hDev
  );

  ////////////////////////
  // STYLES AND OPTIONS //
  
  // theme
  fileEditor.aceEditor.setTheme('ace/theme/monokai');

  // apply styles
  fileEditor.element.style.fontFamily = 'Source Code Pro';
  // fileEditor.element.style.fontFamily = 'Monaco';
  // fileEditor.element.style.fontFamily = 'Menlo';
  fileEditor.element.style.fontSize = '15px';

  // set aceEditor options
  fileEditor.aceEditor.setOption('scrollPastEnd', true);
  fileEditor.aceEditor.setHighlightActiveLine(true);
  
  fileEditor.aceEditor.getSession().setTabSize(2);
  // STYLES AND OPTIONS //
  ////////////////////////

  // append it to the element container
  this.element.appendChild(editorEl);
  
  // set the persistence flag
  // by default the editor is not persistent
  fileEditor.persistent = persistent || false;
  
  // set the creation timestamp onto the fileEditor
  fileEditor.createdAt = Date.now();

  // save the editor to the editors array
  this._fileEditors.push(fileEditor);

  return fileEditor;
};

/**
 * Activates a given editor
 * throws error if there is no editor for the given filepath
 * @param  {String} filepath
 * @param  {Boolean} persistent
 */
EditorManager.prototype.openEditor = function (filepath, options) {

  if (!filepath) { throw new Error('filepath is required'); }
  if (!options || options.persistent === undefined) {
    throw new Error('options.persistent must be explicitly set');
  }

  // try to find existing editor for the filepath
  // if not found, create a new one
  var editor = this.getEditor(filepath);

  if (editor) {
    // editors that previously were not persistent
    // may become in this moment
    editor.persistent = options.persistent;

    this.showEditor(filepath, options);

    return Bluebird.resolve(editor);

  } else {

    // create a new editor
    editor = this.createEditor(options.persistent);

    return editor.load(filepath)
      .then(function () {

        // show the editor after loading
        this.showEditor(filepath, options);

        // return the editor at the end
        return editor;

      }.bind(this));
  }
};

/**
 * Shows the editor for the given filepath.
 * Once an editor is shown, all other editors
 * are hidden.
 * 
 * @param  {String} filepath
 */
EditorManager.prototype.showEditor = function (filepath, options) {
  options = options || {};

  var self = this;

  this._fileEditors.forEach(function (fileEditor) {
    if (fileEditor.filepath === filepath) {
      // show
      fileEditor.element.removeAttribute('hidden');

      // if focus is required, focus the editor
      if (options.focus) {
        // TODO: internalize focus method
        // into the fileEditor component
        fileEditor.aceEditor.focus();
      }

    } else {
      fileEditor.element.setAttribute('hidden', true);
    }
  });
};

/**
 * Retrieves the file editor for the given filepath
 * @param  {String} filepath
 * @return {FileEditor}
 */
EditorManager.prototype.getEditor = function (filepath) {
  return this._fileEditors.find(function (editor) {
    return editor.filepath === filepath;
  });
};

/**
 * Destroys the editor for the given filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
EditorManager.prototype.destroyEditor = function (filepath) {

  if (!filepath) { throw new Error('filepath is required'); }

  var editorIndex = this._fileEditors.findIndex(function (fileEditor) {
    return fileEditor.filepath === filepath;
  });

  if (editorIndex === -1) {
    throw new Error('editor element for the filepath ' + filepath + ' does not exist');
  }

  // splice it from the array
  var fileEditor = this._fileEditors.splice(editorIndex, 1)[0];
  
  // remove all eventListeners
  fileEditor.removeAllListeners();

  // TODO verify teardown of the editor
  fileEditor.element.remove();
  
  return Bluebird.resolve();
};

module.exports = EditorManager;

},{"bluebird":11,"events":23,"h-ui-file-editor":27}],109:[function(require,module,exports){
"use strict";
const TabbedEditor = require('./tabbed-editor');

module.exports = function (habemus, options) {

  var tabbedEditor = new TabbedEditor({
    hDev: habemus.services.hDev,
    ace: window.ace,
    localStorage: habemus.services.projectConfigStorage,
  });

  tabbedEditor.attach(document.querySelector('#tabbed-editor'));

  return tabbedEditor;
}
},{"./tabbed-editor":110}],110:[function(require,module,exports){
"use strict";
// native dependencies
const util          = require('util');
const EventEmitter  = require('events');

// third-party dependencies
const Bluebird = require('bluebird');

// own dependencies
const EditorManager = require('../editor-manager');

// constants
const LS_PREFIX = 'habemus_editor_tabbed_editor_';

/**
 * TabbedEditor constructor
 * @param {Object} options
 */
function TabbedEditor(options) {

  if (!options.hDev) { throw new Error('hDev is required'); }
  if (!options.ace) { throw new Error('ace is required'); }
  if (!options.localStorage) { throw new Error('localStorage is required'); }

  this.hDev = options.hDev;
  this.ace = options.ace;
  this.localStorage = options.localStorage;

  // ensure hDev api
  if (typeof this.hDev.pathExists !== 'function') {
    throw new TypeError('hDev.pathExists MUST be a function');
  }

  /**
   * Path to the active file.
   * @type {Boolean}
   */
  this.activeFilepath = false;

  // tabs
  this.tabsEl = document.createElement('habemus-editor-tabs');

  // editor container manages open editors
  // it is not a Polymer element because ace-editor
  // appears to lose performance inside shady/shadow dom.
  // at least, it was not made for perfectly working inside shadow dom.
  // TODO: investigate ace editor and shadow/shady dom.
  this.editorManager = new EditorManager({
    hDev: this.hDev,
    ace: this.ace,
  });

  /**
   * Listen to select events on the tabs element
   */
  this.tabsEl.addEventListener('iron-select', function (e) {
    var targetFilepath = this.tabsEl.selected;
    
    this.openFile(targetFilepath);

  }.bind(this));

  /**
   * When tabs emit a close-intention, destroy the editor and
   * confirm closing
   */
  this.tabsEl.addEventListener('close-intention', function (e) {

    this.closeFile(e.detail.item.path);

  }.bind(this));
  
  this.tabsEl.addEventListener('tabs-changed', function (e) {

    var tabs = this.tabsEl.get('tabs');
    this._lsSaveSessionData('tabs', tabs);
    
  }.bind(this));

  // read last session's data from localstorage
  // and restore it
  var lastSession = this._lsReadSessionData();

  this.restoreSession(lastSession);
}

util.inherits(TabbedEditor, EventEmitter);

/**
 * Reads session data from localStorage
 * @return {Object}
 *         - tabs
 *         - activeFilepath
 */
TabbedEditor.prototype._lsReadSessionData = function () {
  var sessionData = this.localStorage.getItem(LS_PREFIX + 'session');
  
  if (sessionData) {
    try {
      sessionData = JSON.parse(sessionData);
    } catch (e) {
      console.warn(
        'Error reading session data from localStorage. Reseting session.');
    }
  } else {
    sessionData = {};
  }
  
  return sessionData;
};

/**
 * Saves session data to the localStorage
 * @param  {String} dataKey
 * @param  {*} dataValue
 */
TabbedEditor.prototype._lsSaveSessionData = function (dataKey, dataValue) {
  if (!dataKey) { throw new Error('Key is required'); }

  var sessionData = this._lsReadSessionData();
  
  sessionData[dataKey] = dataValue;
  
  this.localStorage.setItem(LS_PREFIX + 'session', JSON.stringify(sessionData));
};

/**
 * Sets the activeFilepath property
 * emits event and saves data to the session on localStorage
 * if changes happen
 * @param {String} filepath
 */
TabbedEditor.prototype._setActiveFilepath = function (filepath) {
  var previous = this.activeFilepath;
  
  this.activeFilepath = filepath;
  
  if (previous !== filepath) {
    this._lsSaveSessionData('activeFilepath', filepath);
    this.emit('active-filepath-changed', filepath, previous);
  }
};

/**
 * Checks if there is any selected tab.
 * If none is selected, checks whether there are tabs available
 * and if there are, selects the last one.
 */
TabbedEditor.prototype._ensureSelectedTab = function () {
  
  var tabsEl = this.tabsEl;
  
  // run the selection ensuring in the process' nextTick
  // so that the tabs element is guaranteed to have been rendered
  setTimeout(function () {
    
    if (!tabsEl.selected && tabsEl.tabs.length > 0) {
      tabsEl.selectIndex(0);
    }
    
  }, 0);
  
};

/**
 * Restores a previous session
 * by opening tabs and selecting the previous
 * activeFilepath
 * @param {Array} tabs
 * @param {String} activeFilepath
 */
TabbedEditor.prototype.restoreSession = function (session) {

  var tabs = session.tabs || [];
  var activeFilepath = session.activeFilepath;

  // create the tabs and select the activeFilepath
  tabs.forEach(function (tabData) {

    if (!this.tabsEl.getTab(tabData.id)) {
      // before creating the tab, check if the
      // file exists
      this.hDev.pathExists(tabData.path, 'file')
        .then(function (exists) {
          if (exists) {
            this.tabsEl.createTab(tabData, {
              select: (tabData.path === activeFilepath)
            });
          }
        }.bind(this))
        .catch(function (err) {
          console.warn(err);
        });
    }

  }.bind(this));
  
  // ensure there is a selected tab
  this._ensureSelectedTab();
};

/**
 * Attaches the element to the DOM
 * @param  {DOM Element} containerElement
 */
TabbedEditor.prototype.attach = function (containerElement) {
  containerElement.appendChild(this.tabsEl);

  this.editorManager.attach(containerElement);

  this.containerElement = containerElement;
};

/**
 * Opens a non-persistent editor with the required file
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.viewFile = function (filepath) {
  
  if (!filepath) {
    return Bluebird.reject(new Error('filepath is required'));
  }
  
  if (this.tabsEl.getTab(filepath)) {
    this.tabsEl.select(filepath);
    return Bluebird.resolve();
  }

  // undo selection on tabs
  this.tabsEl.clearSelection();

  // open a non-persistent editor and set focus to it
  return this.editorManager.openEditor(filepath, {
    persistent: false,
    focus: true
  })
  .then(function (fileEditor) {
    // set the active filepath manually
    // as this operation does not modify tab selection
    this._setActiveFilepath(filepath);

    // once any changes happen on the file editor,
    // effectively open the file
    fileEditor.once('change', this.openFile.bind(this, filepath));

    return;
  }.bind(this));
};

/**
 * Attempts to open an in-memory file editor
 * for the given filepath.
 *
 * If the file is not open, create the editor,
 * load it and then open its tab
 * 
 * @param  {String} filepath
 * @param  {Object} options
 *                  - select: Boolean
 * @return {Bluebird -> tabData}
 */
TabbedEditor.prototype.openFile = function (filepath) {
  
  if (!filepath) { return Bluebird.reject(new Error('filepath is required')); }

  if (this.tabsEl.getTab(filepath)) {
    // tab exists: ensure it is selected
    this.tabsEl.select(filepath);
    
  } else {
    // create the tab
    var newTabData = {
      path: filepath
    };
    
    // create the tab and select it
    this.tabsEl.createTab(newTabData, { select: true });
  }

  // open a persistent editor and set the focus to it
  return this.editorManager.openEditor(filepath, {
      persistent: true,
      focus: true,
    })
    .then(function (fileEditor) {

      this._setActiveFilepath(filepath);
      
      // associate the fileEditor events to the tab
      fileEditor.on('change', function () {
        if (fileEditor.changeManager.hasUnsavedChanges()) {
          this.tabsEl.setTabData(filepath, 'status', 'unsaved');
        } else {
          this.tabsEl.setTabData(filepath, 'status', '');
        }
      }.bind(this));
      
      fileEditor.on('loaded-file-removed', function () {
        this.tabsEl.setTabData(filepath, 'status', 'unsaved');
      }.bind(this));

    }.bind(this));
};

/**
 * Closes the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.closeFile = function (filepath) {

  var fileEditor = this.editorManager.getEditor(filepath);

  if (fileEditor && fileEditor.changeManager.hasUnsavedChanges()) {

    // TODO: prompt the user for confirmation instead of preventing close
    // prevent unsaved files from being closed
    alert(filepath + ' has unsaved changes');

    return Bluebird.reject(new Error('unsaved changes'));

  } else {

    // if tab exists, close it
    // (the file may be in preview mode)
    if (this.tabsEl.getTab(filepath)) {
      this.tabsEl.closeTab(filepath);
    }
    
    // ensure there is a selected tab
    this._ensureSelectedTab();

    // if fileEditor exists, destroy it
    // (the tab may have been opened with no corresponding editor)
    if (fileEditor) {
      return this.editorManager.destroyEditor(filepath);
    } else {
      return Bluebird.resolve();
    }
  }
};

/**
 * Saves the editor for the filepath
 * @param  {String} filepath
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveFile = function (filepath) {
  return this.editorManager.getEditor(filepath).save().then(function () {
    this.tabsEl.setTabData(filepath, 'status', '');
  }.bind(this))
  .catch(function (err) {
    console.warn(err);
    
    alert('could not save file ', err.name);
  });
};

/**
 * Saves the active file
 * @return {Bluebird}
 */
TabbedEditor.prototype.saveActiveFile = function () {
  if (this.activeFilepath) {
    return this.saveFile(this.activeFilepath);
  } else {
    return Bluebird.resolve();
  }
};

/**
 * Closes the active file
 * @return {Bluebird}
 */
TabbedEditor.prototype.closeActiveFile = function () {
  if (this.activeFilepath) {
    return this.closeFile(this.activeFilepath);
  } else {
    return Bluebird.resolve();
  }
};

module.exports = TabbedEditor;

},{"../editor-manager":108,"bluebird":11,"events":23,"util":89}],"habemus-editor-services":[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  return Bluebird.resolve(require('./config')(habemus, options))
    .then(function (config) {

      habemus.services.config = config;

      return Bluebird.all([
        require('./h-dev')(habemus, options),
      ]);
    })
    .then(function (services) {

      habemus.services.hDev = services[0];

    });
};

},{"./config":7,"./h-dev":8,"bluebird":11}],"habemus-editor-ui":[function(require,module,exports){
"use strict";
// third-party
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  return Bluebird.all([])
  .then(function (components) {
    
  });
};

},{"bluebird":11}],"habemus-editor-urls":[function(require,module,exports){
"use strict";
// h-deps
// use the h-urls/dev version for now, as the /dev version
// builds urls relative to the hosts instead of using domain names.
// TODO: either remove dependency on h-urls or internalize url writing.
//       needs study
const hUrls = require('h-urls/dev');

var locationString = window.location.toString();

// load url options from env
var urlOptions = {
  hWorkspaceServerURI: window.location.protocol + window.location.host + '/preview',
  workspacePreviewHost: 'sw.habemus.io',
};

/**
 * Helper that builds the urls from a series of configurations
 * @type {Object}
 */
var urls = hUrls(urlOptions);

module.exports = urls;

},{"h-urls/dev":3}]},{},[92])("habemus-editor-urls")
});