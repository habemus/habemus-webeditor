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
    error: errorToast,
  };

};
