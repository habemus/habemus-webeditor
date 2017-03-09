// third-party
const Bluebird = require('bluebird');

module.exports = function (habemus, options) {

  var bannerElement = document.querySelector('#notification-banner');
  var bannerMessageElement = bannerElement.querySelector('.message-container');
  var bannerCloseElement   = bannerElement.querySelector('[banner-dismiss]');

  var bannerCtrl = {
    show: function (message, options) {

      if (typeof message === 'string') {
        bannerMessageElement.innerHTML = message;
      } else {
        bannerMessageElement.appendChild(message);
      }

      habemus.ui.structure.set('header', true);
    },
    hide: function () {
      bannerMessageElement.innerHTML = '';
      habemus.ui.structure.set('header', false);
    },
  };

  // dismiss click
  bannerCloseElement.addEventListener('click', function (e) {
    bannerCtrl.hide();
  });

  return bannerCtrl;
};
