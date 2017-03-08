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
    is: 'habemus-confirm-dialog',

    properties: {
      title: {
        type: String,
      },
      message: {
        type: String,
      },
      confirmMessage: {
        type: String,
        value: 'confirm',
      },
      cancelMessage: {
        type: String,
        value: 'cancel',
      },
    },

    behaviors: [
      Polymer.PaperDialogBehavior
    ],

    /**
     * From PaperDialogBehavior
     * prevent cancelling on clicking outside the dialgo
     * @type {Boolean}
     */
    noCancelOnOutsideClick: false,

    ready: function () {
      this.addEventListener('iron-overlay-closed', this._handleOverlayClosed.bind(this));
      this.clear = this.clear.bind(this);
    },

    confirm: function (message, options) {
      options = options || {}

      this.set('message', message);

      this.set('title', options.title);

      if (options.confirm) {
        this.set('confirmMessage', options.confirm);
      }

      if (options.cancel) {
        this.set('cancelMessage', options.cancel);
      }

      this._defer = defer();

      this._defer.promise.then(this.clear, this.clear);

      this.open();

      setTimeout(function () {
        this.$.confirm.focus();
      }.bind(this), 50)

      return this._defer.promise;
    },

    clear: function () {
      this.set('message', '');

      this.set('title', '');
      this.set('confirmMessage', 'confirm');
      this.set('cancelMessage', 'cancel');

      if (this._defer) {
        delete this._defer;
      }
    },

    _handleOverlayClosed: function (e) {
      if (!this._defer) {
        console.warn('No `_defer` property found upon dialog closing');
        return;
      }

      if (e.detail.canceled) {
        this._defer.reject(e.detail);
      } else {
        this._defer.resolve(e.detail);
      }
    },

  });

})();
