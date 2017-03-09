(function () {

  function _isChrome() {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  }

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
    is: 'habemus-new-project-dialog',
    properties: {
      modal: {
        value: true,
      },
      withBackdrop: {
        value: true,
      },

      /**
       * Only chrome supports directory input
       * TODO: support directory input
       * @type {Object}
       */
      _supportsDirectoryInput: {
        // value: _isChrome(),
        value: false,
      },

      /**
       * Whether to show starter projects iframe
       * @type {Object}
       */
      _showStarterProjectsIframe: {
        value: false,
      },

      /**
       * The address of the starter proejcts iframe
       * @type {Object}
       */
      _starterProjectsURL: {
        value: '',
      },

      cancellable: {
        value: false,
      },

      /**
       * Translations
       * @type {Object}
       */
      translate: {
        type: Function,
      }
    },
    
    behaviors: [
      Polymer.PaperDialogBehavior,
    ],

    ready: function () {
      this.addEventListener('iron-overlay-closed', this._handleOverlayClosed.bind(this));
      this.clear = this.clear.bind(this);
    },

    /**
     * Opens the dialog prompting for files.
     * @param  {Object} options
     * @return {Bluebird}
     */
    prompt: function (options) {

      // create a deferred so that the promise may be
      // resolved by other methods
      this._defer = defer();

      // always clear
      this._defer.promise.then(this.clear, this.clear);

      // open
      this.open();

      return this._defer.promise;
    },

    /**
     * Clears all inputs.
     */
    clear: function () {
      delete this._defer;
    },

    /**
     * Handles only file input changes (zip);
     */
    _handleFileInputChange: function (e) {
      var file = this.$['file-input'].files[0];

      if (!file) {
        return;
      }

      this.value = {
        type: 'file-input',
        value: this.$['file-input'],
      };
      this.close();
    },

    /**
     * TODO: implement
     * Handles only directory input change
     */
    _handleDirectoryInputChange: function (e) {
      // TODO: this is highly entangled code.
      // should emit event or resolve instead of 

      this.value = {
        type: 'directory-input',
        value: this.$['directory-input'],
      };
      this.close();
    },

    /**
     * TODO: implement file drop
     */
    _handleDrop: function (e) {

      this.value = {
        type: 'drop-event',
        value: e,
      };
      this.close();
    },

    _handleFromStarterProjectsTap: function (e) {
      this.set('_showStarterProjectsIframe', true);
      // TODO: remove hardcoding
      this.set('_starterProjectsURL', 'https://habemus.io/starter-projects/');
    },

    _handleFromStarterProjectsCloseTap: function (e) {
      this.set('_showStarterProjectsIframe', false);
    },

    /**
     * Deals with solving or rejecting defer
     */
    _handleOverlayClosed: function (e) {
      if (!this._defer) {
        console.warn('No `_defer` property found upon dialog closing');
        return;
      }

      if (e.detail.canceled) {
        
        var error = new Error();
        Object.assign(error, e.detail);
        this._defer.reject(error);
      } else {
        this._defer.resolve(this.get('value'));
      }
    },
  });

})();