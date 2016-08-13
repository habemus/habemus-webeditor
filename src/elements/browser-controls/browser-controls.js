(function () {

  Polymer({
    is: 'habemus-browser-controls',

    properties: {
      location: {
        type: String,
        notify: true,
        value: '',
      },

      history: {
        type: Array,
        notify: true,
        value: [],
      },

      currentHistoryIndex: {
        type: Number,
        value: -1,
      },
    },

    ready: function () {
      console.log('browser-controls ready');
    },

    goTo: function (location) {
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

    close: function () {
      this.fire('close-intent');
    },

    handleLocationInputClick: function (e) {

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
  })
})();