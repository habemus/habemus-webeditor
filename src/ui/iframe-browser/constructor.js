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
