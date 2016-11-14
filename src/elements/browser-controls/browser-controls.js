(function () {

  Polymer({
    is: 'habemus-browser-controls',

    properties: {
      /**
       * String that identifies the current location
       * of the navigator.
       *
       * It is designed to be an opaque string with no
       * real meaning.
       * 
       * It cannot be relied upon to be a full URL.
       * The URL must always be provided by the external
       * user through the `computeLocationURL` function.
       * 
       * @type {String}
       */
      location: {
        type: String,
        notify: true,
        // set a value for it to make sure
        // all bindings are correctly initialized
        value: '',
      },

      /**
       * Function used to compute the URL of the current location
       * @type {Function}
       */
      computeLocationURL: {
        type: Function,
        value: function (location) {
          return false;
        },
      },

      /**
       * Array that holds the navigation history.
       * @type {Array}
       */
      history: {
        type: Array,
        notify: true,
        value: [],
      },

      /**
       * Position of the navigation in the history.
       * @type {Number}
       */
      currentHistoryIndex: {
        type: Number,
        value: -1,
      },

      screenSizes: {
        type: Array,
        notify: true,
        value: [
          {
            label: 'Laptop',
            width: 1280,
            height: 800,
          },
          {
            label: 'Galaxy S5',
            width: 360,
            height: 640,
          },
          {
            label: 'Nexus 5X',
            width: 412,
            height: 732,
          },
          {
            label: 'iPhone 5',
            width: 320,
            height: 568,
          },
          {
            label: 'iPhone 6',
            width: 375,
            height: 667
          },
          {
            label: 'iPhone 6 Plus',
            width: 414,
            height: 736,
          },
          {
            label: 'iPad',
            width: 768,
            height: 1024,
          }
        ],
      },

      selectedScreenSize: {
        type: Object,
        notify: true,
        value: {
          label: 'iPhone 5',
          width: 320,
          height: 568,
        },
      }
    },

    /**
     * Emits a `refresh` event
     */
    refresh: function () {
      this.fire('refresh');
    },

    /**
     * Selects a screen size by the screenSize.label
     * Silently fails in case the screensize is not found
     * @param  {String} label
     */
    selectScreenSize: function (label) {
      
      var screenSize = this.screenSizes.find(function (screenSize) {
        return screenSize.label === label;
      });

      if (screenSize) {
        this.set('selectedScreenSize', screenSize);
      } else {
        console.warn('screenSize ' + label + ' does not exist');
      }
    },

    /**
     * Navigates to a given location.
     *
     * Pushes the location to the navigation history.
     *
     * If location is equal to the currently active location,
     * ignore navigation request if no `force` option is passed.
     * 
     * @param  {String} location
     * @param  {Object} options
     */
    goTo: function (location, options) {

      options = options || {};

      // check if we are already in the requested location
      if (this.get('location') === location && !options.force) {
        return;
      }

      // check if we are in the middle of the history
      var currentHistoryIndex = this.get('currentHistoryIndex');
      var history = this.get('history');

      var lastHistoryIndex = history.length - 1;

      if (currentHistoryIndex !== lastHistoryIndex) {
        // discard history after the currentHistoryIndex
        history = history.slice(0, currentHistoryIndex + 1);
        this.set('history', history);
      }
      
      // set location
      this.set('location', location);

      // update history
      this.push('history', location);
      this.set('currentHistoryIndex', this.get('history').length - 1);
    },

    /**
     * Goes back in the history stack
     */
    goBack: function () {

      var history = this.get('history');
      var currentHistoryIndex = this.get('currentHistoryIndex');

      if (history.length === 0) {
        console.warn('history is empty');
        return;
      }

      if (currentHistoryIndex === -1) {
        console.warn('at start');
        return;
      }

      var targetHistoryIndex = currentHistoryIndex - 1;

      var location = this.history[targetHistoryIndex];

      location = location || '';

      this.set('location', location);
      this.set('currentHistoryIndex', targetHistoryIndex);
    },

    /**
     * Goes forward in the history stack
     */
    goForward: function () {

      var history = this.get('history');
      var currentHistoryIndex = this.get('currentHistoryIndex');

      if (history.length - 1 === currentHistoryIndex) {
        console.warn('at last step');
        return;
      }

      var targetHistoryIndex = currentHistoryIndex + 1;

      var location = this.history[targetHistoryIndex];

      this.set('location', location);
      this.set('currentHistoryIndex', targetHistoryIndex);
    },

    /**
     * Emits a 'close-intent' event
     */
    close: function () {
      this.fire('close-intent');
    },

    _handleLocationInputClick: function (e) {

      this.$['location-input'].edit(function (location) {
        this.goTo(location);
      }.bind(this));

    },

    _canGoBack: function () {
      if (this.get('currentHistoryIndex') === -1) {
        return false;
      } else {
        return true;
      }
    },

    _canGoForward: function () {
      var lastHistoryIndex = this.get('history').length - 1;

      if (this.get('currentHistoryIndex') === lastHistoryIndex) {
        // at the last position of history
        return false;
      } else {
        return true;
      }
    },

    _hasLocation: function (location) {
      return location ? true : false;
    },

    _isScreenSizeSelected: function (screenSize) {
      return this.selectedScreenSize.label === screenSize.label;
    },

    /**
     * Handles `change` event on the select element for the screen sizes
     */
    _handleScreenSizeSelectChange: function (e) {
      var screenSizeLabel = e.target.value;

      this.selectScreenSize(screenSizeLabel);
    },
  })
})();