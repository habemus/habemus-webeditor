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
  var habemusStructure = this.habemusStructure;

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

  controlsEl.addEventListener(
    'selected-screen-size-changed',
    this._handleScreenSizeChange.bind(this)
  );
  
  /**
   * Listen for changes in the size of the iframe container
   */
  habemusStructure.addEventListener(
    'x2-changed',
    this._handleScreenSizeChange.bind(this)
  );
  habemusStructure.addEventListener(
    'x3-changed',
    this._handleScreenSizeChange.bind(this)
  );
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

  // make the iframe be contained within a div element
  this.iframeContainerEl = document.createElement('div');
  this.iframeContainerEl.setAttribute('id', 'iframe-browser-iframe-container');
  // this.iframeContainerEl.style.height = 'calc(100% - 32px)';
  // this.iframeContainerEl.style.width  = '100%';
  // this.iframeContainerEl.style.position = 'relative';
  // this.iframeContainerEl.style.display = 'flex';
  // this.iframeContainerEl.style['flex-direction'] = 'row';
  // this.iframeContainerEl.style['justify-content'] = 'center';
  // this.iframeContainerEl.style['align-items'] = 'center';
  this.iframeContainerEl.appendChild(this.iframeEl);

  this.containerElement.appendChild(this.iframeContainerEl);
};

IframeBrowser.prototype._handleScreenSizeChange = function () {

  // retrieve the screen size
  var size = this.controlsEl.get('selectedScreenSize');

  this.emulateScreenSize({
    width: size.width,
    height: size.height,
  });
};

IframeBrowser.prototype.emulateScreenSize = function (sizes) {

  // retrieve the container width and height
  var containerWidth = this.habemusStructure.get('x3') - this.habemusStructure.get('x2');
  // 32 is the controlsEl height (set on iframe-browser.less)
  // TODO: improve styling strategy
  var containerHeight = this.containerElement.offsetHeight - 32;

  var horizontalScale = containerWidth / sizes.width;
  var verticalScale   = containerHeight / sizes.height;

  /**
   * Use the smallest scale to resize the viewport
   */
  var scale = (horizontalScale < verticalScale) ? horizontalScale : verticalScale;
  // ensure a fixed margin
  // scale = scale * 0.98;

  // http://jsfiddle.net/dirkk0/EEgTx/?utm_source=website&utm_medium=embed&utm_campaign=EEgTx

  // // zoom: 0.25;
  // -moz-transform: scale(0.25);
  // -moz-transform-origin: 0 0;
  // -o-transform: scale(0.25);
  // -o-transform-origin: 0 0;
  // -webkit-transform: scale(0.25);
  // -webkit-transform-origin: 0 0;
  // transform: scale(0.25);
  // transform-origin: 0 0;

  this.iframeEl.style['width'] = sizes.width + 'px';
  this.iframeEl.style['height'] = sizes.height + 'px';
  this.iframeEl.style['transform'] = 'scale(' + scale + ') translateX(-50%)';
  this.iframeEl.style['transform-origin'] = '0 0';
};


module.exports = IframeBrowser;
