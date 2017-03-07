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
    is: 'habemus-alert-dialog',

    properties: {
      title: {
        type: String,
      },

      message: {
        type: String,
      },

      okMessage: {
        type: String,
        value: 'ok',
      },

      mode: {
        type: String,
        value: 'info',
      }
    },

    behaviors: [
      Polymer.PaperDialogBehavior
    ],

    ready: function () {
      this.addEventListener('iron-overlay-closed', this._handleOverlayClosed.bind(this));
      this.clear = this.clear.bind(this);
    },

    alert: function (message, options) {
      options = options || {};

      this.set('message', message);

      this.set('title', options.title);
      
      if (options.ok) {
        this.set('okMessage', options.ok);
      }

      this._defer = defer();

      this._defer.promise.then(this.clear, this.clear);

      this.open();

      return this._defer.promise;
    },

    clear: function () {
      this.set('title', '');
      this.set('message', '');

      this.set('okMessage', 'ok');

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
    }
  });

})();
