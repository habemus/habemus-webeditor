(function () {
  
  Polymer({
    is: 'habemus-device-controls',
    
    properties: {
      controlsWidth: {
        type: String,
      },
      
      screenSizes: {
        type: Array,
        notify: true,
        value: [
          {
            label: 'Laptop',
            width: 1280,
            height: 800,
            orientations: [
              'normal'
            ],
          },
          {
            label: 'Galaxy S5',
            width: 360,
            height: 640,
            orientations: [
              'normal',
              'toggled',
            ],
          },
          {
            label: 'Nexus 5X',
            width: 412,
            height: 732,
            orientations: [
              'normal',
              'toggled',
            ],
          },
          {
            label: 'iPhone 5',
            width: 320,
            height: 568,
            orientations: [
              'normal',
              'toggled',
            ],
          },
          {
            label: 'iPhone 6',
            width: 375,
            height: 667,
            orientations: [
              'normal',
              'toggled',
            ],
          },
          {
            label: 'iPhone 6 Plus',
            width: 414,
            height: 736,
            orientations: [
              'normal',
              'toggled',
            ],
          },
          {
            label: 'iPad',
            width: 768,
            height: 1024,
            orientations: [
              'normal',
              'toggled',
            ],
          }
        ],
      },

      selectedScreenSize: {
        type: Object,
        notify: true,
        value: null,
        // value: {
        //   label: 'iPhone 5',
        //   width: 320,
        //   height: 568,
        //   orientations: [
        //     'normal',
        //     'toggled',
        //   ],
        // },
        observer: '_selectedScreenSizeChanged',
      },
      
      selectedScreenOrientation: {
        type: String,
        notify: true,
      },
      
      /**
       * Informative
       * TODO: move the iframe into the device-controls element
       * so that the zoom may be managed in one single place
       */
      displayData: {
        type: Object,
        value: {
          zoom: '',
          width: '',
          height: '',
        }
      },
    },
    
    _hasMultipleScreenOrientations: function (screenSize) {
      return this.selectedScreenSize && screenSize && screenSize.orientations.length > 1;
    },

    _isScreenSizeSelected: function (screenSize) {
      return this.selectedScreenSize && this.selectedScreenSize.label === screenSize.label;
    },
    
    /**
     * Update orientation and display data
     */
    _selectedScreenSizeChanged: function () {
      
      if (!this.selectedScreenSize) {
        this.set('selectedScreenOrientation', null);
        return;
      }
      
      var orientations = this.selectedScreenSize.orientations;
      
      this.set(
        'selectedScreenOrientation',
        orientations[0]
      );
    },

    /**
     * Handles `change` event on the select element for the screen sizes
     */
    _handleScreenSizeSelectChange: function (e) {
      var screenSizeLabel = e.target.value;

      this.selectScreenSize(screenSizeLabel);
    },
    
    /**
     * API
     */
    
    /**
     * Updates the control element's width
     */
    setControlsWidth: function (width) {
      width = typeof width === 'number' ?
        parseInt(width, 10) + 'px' : width;
      
      this.set('controlsWidth', width);
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
      } else if (label === 'none') {
        
        this.set('selectedScreenSize', null);
        
      } else {
        console.warn('screenSize ' + label + ' does not exist');
        this.set('selectedScreenSize', null);
      }
    },
    
    /**
     * Switches the current screen orientation
     */
    switchScreenOrientation: function () {
      
      var orientations = this.get('selectedScreenSize.orientations');
      var current = this.get('selectedScreenOrientation') || orientations[0];
      
      var currentIndex = orientations.indexOf(current);
      var next = orientations[currentIndex + 1];
      next = next || orientations[0];
      
      this.set('selectedScreenOrientation', next)
    },
    
    /**
     * Selects the required screen orientation if possible
     */
    setScreenOrientation: function (orientation) {
      var orientations = this.get('selectedScreenSize.orientations');
      
      if (orientations.indexOf(orientation) !== -1) {
        this.set('selectedScreenOrientation', orientation)
      }
    },
    
    /**
     * Updates the display data
     */
    setDisplayData: function (data) {
      this.set('displayData', data);
    },
  });
  
})();
