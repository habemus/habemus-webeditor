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
