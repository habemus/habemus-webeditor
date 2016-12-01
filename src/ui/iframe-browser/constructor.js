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
  this.browserControlsEl = Polymer.Base.create('habemus-browser-controls', {
    computeLocationURL: function (location) {
      return _joinPaths(this.hDev.projectRootURL, location);
    }.bind(this),
  });
  var browserControlsEl = this.browserControlsEl;

  /**
   * Device control element
   * @type {DOMElement}
   */
  this.deviceControlsEl = Polymer.Base.create('habemus-device-controls', {
    
  });
  var deviceControlsEl = this.deviceControlsEl;

  /**
   * Iframe element
   * @type {DOMElement}
   */
  this.iframeEl = document.createElement('iframe');
  var iframeEl = this.iframeEl;

  /**
   * Browser control events
   */
  browserControlsEl.addEventListener('location-changed', function (e) {

    var location = browserControlsEl.get('location');

    location = (!location || location === '/') ? '/index.html' : location;

    var fullLocation = _joinPaths(this.hDev.projectRootURL, location);

    // update the iframe's src and the newTabAnchor's href
    this.iframeEl.setAttribute('src', fullLocation);

  }.bind(this));

  browserControlsEl.addEventListener('refresh', function (e) {

    // http://stackoverflow.com/questions/86428/whats-the-best-way-to-reload-refresh-an-iframe-using-javascript
    this.iframeEl.src += '';

  }.bind(this));

  browserControlsEl.addEventListener('close-intent', function (e) {
    this.habemusStructure.setMode('LC');
  }.bind(this));
  
  /**
   * Device control events
   */
  deviceControlsEl.addEventListener(
    'selected-screen-size-changed',
    this._handleScreenSizeChange.bind(this)
  );
  deviceControlsEl.addEventListener(
    'selected-screen-orientation-changed',
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
  window.addEventListener(
    'resize',
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
  this.browserControlsEl.goTo(location);
};

IframeBrowser.prototype.goBack = function () {
  this.browserControlsEl.goBack();
};

IframeBrowser.prototype.goForward = function () {
  this.browserControlsEl.goForward();
};

/**
 * Method that attaches all elements of the IframeBrowser to the given node.
 * @param  {DOMElement} containerElement
 * @return {undefined}
 */
IframeBrowser.prototype.attach = function (containerElement) {

  this.containerElement = containerElement;

  this.containerElement.appendChild(this.browserControlsEl);

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
  this.iframeContainerEl.appendChild(this.deviceControlsEl);

  this.containerElement.appendChild(this.iframeContainerEl);
};

IframeBrowser.prototype._handleScreenSizeChange = function () {

  // retrieve the screen size
  var size = this.deviceControlsEl.get('selectedScreenSize');
  
  if (!size) {
    this.presentRealScreenSize();
    return;
  } else {
    // retrieve the orientation
    // possible values are: normal and toggled
    var orientation = this.deviceControlsEl.get('selectedScreenOrientation');
    
    switch (orientation) {
      case 'normal':
        this.emulateScreenSize({
          width: size.width,
          height: size.height,
        });
        break;
      case 'toggled':
        this.emulateScreenSize({
          width: size.height,
          height: size.width,
        });
        break;
      default:
        console.warn('unsupported screen orientation ' + orientation);
        break;
    }
  }
};

/**
 * Updates all elements to present the real screen size
 */
IframeBrowser.prototype.presentRealScreenSize = function () {
  // make the iframe occupy the whole width and height
  this.iframeEl.style['width'] = '100%';
  this.iframeEl.style['height'] = 'calc(100% - 42px)';
  this.iframeEl.style['transform'] = null;
  this.iframeEl.style['transform-origin'] = null;
  
  this.deviceControlsEl.setControlsWidth(this.iframeEl.offsetWidth + 'px');
  
  this.deviceControlsEl.setDisplayData({
    zoom: '100%',
    width: this.iframeEl.offsetWidth,
    height: this.iframeEl.offsetHeight,
  });
};

/**
 * Emulate the given screen size
 */
IframeBrowser.prototype.emulateScreenSize = function (size) {

  // retrieve the container width and height
  var containerWidth = this.habemusStructure.get('x3') - this.habemusStructure.get('x2');
  // 40 is the browserControlsEl height (set on iframe-browser.less)
  // 42 is the deviceControlsEl height
  // (set on elements/device-controls/device-controls.less)
  // TODO: improve styling strategy
  var containerHeight = this.containerElement.offsetHeight - 40 - 42;

  var horizontalScale = containerWidth / size.width;
  var verticalScale   = containerHeight / size.height;

  /**
   * Use the smallest scale to resize the viewport
   */
  var scale = (horizontalScale < verticalScale) ? horizontalScale : verticalScale;
  
  // ensure scale is at most 1
  scale = scale >= 1 ? 1 : scale;
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

  this.iframeEl.style['width'] = size.width + 'px';
  this.iframeEl.style['height'] = size.height + 'px';
  this.iframeEl.style['transform'] = 'scale(' + scale + ') translateX(-50%)';
  this.iframeEl.style['transform-origin'] = '0 0';
  
  // update the device controls width so that it fits the actual iframe's width
  // (after scaling)
  var deviceControlsWidth = size.width * scale;
  this.deviceControlsEl.setControlsWidth(deviceControlsWidth + 'px');
  
  // update the deviceControl's displayData
  this.deviceControlsEl.setDisplayData({
    zoom: parseInt(scale * 100, 10) + '%',
    width: size.width,
    height: size.height,
  });
};


module.exports = IframeBrowser;
