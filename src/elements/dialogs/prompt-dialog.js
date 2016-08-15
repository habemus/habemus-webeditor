(function () {

  function defer() {
    var resolve, reject;
    var promise = new Promise(function() {
      resolve = arguments[0];
      reject = arguments[1];
    });
    return {
      resolve: resolve,
      reject: reject,
      promise: promise
    };
  }

  Polymer({
    is: 'habemus-prompt-dialog',

    properties: {
      title: {
        type: String,
      },
      message: {
        type: String,
      },
      submitMessage: {
        type: String,
        value: 'submit',
      },
      cancelMessage: {
        type: String,
        value: 'cancel',
      },
      value: {
        type: String,
        value: '',
      },
    },

    behaviors: [
      Polymer.PaperDialogBehavior
    ],

    ready: function () {
      this.addEventListener('iron-overlay-closed', this._handleOverlayClosed.bind(this));
      this.clear = this.clear.bind(this);
    },

    prompt: function (message, options) {
      options = options || {};

      this.set('message', message);

      if (options.submit) {
        this.set('submitMessage', options.submit);
      }

      if (options.cancel) {
        this.set('cancelMessage', options.cancel);
      }

      if (options.defaultValue) {
        this.set('value', options.defaultValue);
      }

      this._defer = defer();

      this._defer.promise
        .then(this.clear, this.clear);

      this.open();

      setTimeout(function () {
        // select the whole text of the input
        this.$.input.select();
      }.bind(this), 50);

      return this._defer.promise;
    },

    clear: function () {
      this.set('message', '');
      this.set('submitMessage', 'submit');
      this.set('cancelMessage', 'cancel');
      this.set('value', '');

      if (this._defer) {
        delete this._defer;
      }
    },

    _handleCancelTap: function (e) {
      e.preventDefault();
      e.stopPropagation();

      this.cancel();
    },

    _handleFormSubmit: function (e) {
      e.preventDefault();
      e.stopPropagation();

      this.close();
    },

    _handleOverlayClosed: function (e) {
      if (!this._defer) {
        console.warn('No `_defer` property found upon dialog closing');
        return;
      }

      if (e.detail.canceled) {
        this._defer.reject(e.detail);
      } else {
        this._defer.resolve(this.get('value'));
      }
    },
  });

})();
