(function () {
  
  const PANEL_STATUSES = {
    INITIAL: 'initial',
    COLLAPSED: 'collapsed',
    COLLAPSING: 'collapsing',
    OPEN: 'open',
    EXPANDING: 'expanding',
    CLOSED: 'closed',
  };

  function _max(v1, v2) {
    return v1 >= v2 ? v1 : v2;
  }

  function _min(v1, v2) {
    return v1 <= v2 ? v1 : v2;
  }

  function _within(v, range) {
    v = _max(v, range[0]);
    v = _min(v, range[1]);

    return v;
  }

  /**
   * Auxiliary function that evaluates a position.
   * Takes the position option that may be either
   * a function or a floating number.
   *
   * In case it is a Function, passes the evaluation arguments on
   * to the function and returns the invocation result.
   *
   * In case it is a Number, multiplies the number with the vw and
   * returns the result
   * 
   * @param  {Function|Number} posOpt
   * @param  {Structure} structure
   * @param  {Number} current
   * @param  {Number} vw
   * @param  {Number} oldVw
   * @return {Number}
   */
  function _modeEvalPosition(posOpt, structure, vw) {
    if (typeof posOpt === 'function') {
      return posOpt.apply(null, [structure, vw]);
    } else if (typeof posOpt === 'number') {
      return posOpt * vw;
    } else {
      throw new TypeError('posOpt MUST be either a Function or a Number');
    }
  }

  /**
   * Auxiliary function that returns the correct ruleSet from a given mode
   * by evaluating ruleSet conditions.
   *
   * Returns the first ruleSet found.
   * 
   * @param  {Array} mode
   * @param  {Structure} structure
   * @return {Object}
   */
  function _modeFindRuleSet(mode, structure) {
    var ruleSet = mode.ruleSets.find(function (ruleSet) {
      return ruleSet.condition(structure);
    });

    if (!ruleSet) {
      console.warn('could not find applicable ruleSet in mode', mode);
      console.warn('falling back to using default');

      return mode.ruleSets[0];
    } else {
      return ruleSet;
    }
  }

  /**
   * Hash containing all valid modes.
   * Each mode defines which panels are open.
   * Each mode has a list of ruleSets (think of them as media queries)
   * that apply given some conditions.
   *
   * Only one mode and a ruleSet are applied at a time.
   * 
   * @type {Object}
   */
  const MODES = {};

  /**
   * LeftCenter mode
   * @type {Object}
   */
  MODES.LC = {};
  MODES.LC.name = 'LC';
  MODES.LC.ruleSets = [
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw >= 600 && vw < 1300;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: false,

      x1: {
        min: 0,
        max: 0.9,
        initial: 0.2,
        resize: function (structure, current, vw, oldVw) {
          // x1 should not move on grow
          return current;
        },
      },
      x2: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return current + (vw - oldVw);
        },
      },
      x3: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      }
    },
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw >= 1300;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: false,

      x1: {
        min: 0,
        max: 0.9,
        initial: 0.2,
        resize: function (structure, current, vw, oldVw) {
          // x1 should not move on grow
          return current;
        },
      },
      x2: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return current + (vw - oldVw);
        },
      },
      x3: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      }
    }
  ];

  MODES.LCR = {
    name: 'LCR'
  };
  MODES.LCR.ruleSets = [
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw < 600;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: true,

      x1: {
        min: 0,
        max: 0.3,
        initial: 0.05,
        resize: function (structure, current, vw, oldVw) {
          // x1 should not move on grow
          return 0.05 * vw;
        },
      },
      x2: {
        min: 0.35,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      },
      x3: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      },
    },
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw >= 600 && vw < 1300;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: true,

      x1: {
        min: 0,
        max: 0.3,
        initial: 0.15,
        resize: function (structure, current, vw, oldVw) {
          // x1 should not move on resize
          // unless the current size is smaller than the minimum
          return _max(current, 0.1 * vw);
        },
      },
      x2: {
        min: 0.35,
        max: 0.9,
        initial: 0.75,
        resize: function (structure, current, vw, oldVw) {
          return _min(current + (vw - oldVw), 0.9 * vw);
        },
      },
      x3: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      },
    },
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw >= 1300;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: true,

      x1: {
        min: 0.02,
        max: 0.3,
        initial: 0.15,
        resize: function (structure, current, vw, oldVw) {
          // x1 should not move on grow
          return current;
        },
      },
      x2: {
        min: 0.4,
        max: 0.8,
        initial: 0.7,
        resize: function (structure, current, vw, oldVw) {
          return current + (vw - oldVw);
        },
      },
      x3: {
        min: 1,
        max: 1,
        initial: 1,
        resize: function (structure, current, vw, oldVw) {
          return vw;
        },
      },
    }
  ];

  Polymer({
    is: 'habemus-structure',
    properties: {
      /**
       * Whether to display the header of the structure
       * @type {Boolean}
       */
      header: {
        type: Boolean,
        value: false,
      },

      /**
       * Whether to display the panels of the structure
       * @type {Boolean}
       */
      panels: {
        type: Boolean,
        value: false,
      },

      /**
       * Whether to display the footer of the structure
       * @type {Boolean}
       */
      footer: {
        type: Boolean,
        value: false,
      },

      /**
       * Handle positions
       */
      x1: {
        type: Number,
        notify: true,
      },
      x2: {
        type: Number,
        notify: true,
      },
      x3: {
        type: Number,
        notify: true,
      },

      isOpenL: {
        type: Boolean,
      },
      statusL: {
        type: String,
        value: PANEL_STATUSES.INITIAL,
      },

      isOpenC: {
        type: Boolean,
      },
      statusC: {
        type: String,
        value: PANEL_STATUSES.INITIAL,
      },

      isOpenR: {
        type: Boolean,
      },
      statusR: {
        type: String,
        value: PANEL_STATUSES.INITIAL,
      },

      mode: {
        type: Object,
        value: MODES.LC,
      },

      /**
       * Viewport Width
       */
      vw: {
        type: Number,
        notify: true,
        value: window.innerWidth,
        observer: '_viewportWidthChanged',
      },
    },
    
    observers: [
      '_handleStatusChange(statusL, statusC, statusR)',
    ],
    
    /**
     * Sets up listener to 'resize' event on the window
     * to change the vw (viewport width) of the structure.
     *
     * Initializes the default active mode.
     * 
     */
    ready: function () {
      window.addEventListener('resize', function () {
        // TODO: RAF
        this.set('vw', window.innerWidth);
      }.bind(this));

      this._initActiveMode();
    },

    /**
     * Handles track event on the x1 handle
     * @param  {Event} e
     */
    _handleTrackX1: function (e) {
      var trackState = e.detail.state;
      var dx         = e.detail.dx;
      var isOpenL    = this.get('isOpenL');
      var isOpenC    = this.get('isOpenC');
      
      // make handles larger when dragging happens
      if (trackState === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (trackState === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }
      
      // ruleSet defines the min and max behaviours
      var ruleSet = _modeFindRuleSet(this.get('mode'), this);

      var minX1 = _modeEvalPosition(ruleSet.x1.min, this, this.get('vw'));
      var maxX1 = _modeEvalPosition(ruleSet.x1.max, this, this.get('vw'));

      var x1 = _within(e.detail.x, [minX1, maxX1]);

      if (typeof x1 === 'number') {
        this.set('x1', x1);
      }
      
      // update L and C panel statuses
      var statusL;
      var statusC;
          
      switch (e.detail.state) {
        case 'start':
          break;
        case 'track':
          // while dragging statuses

          if (isOpenL) {
            statusL = (this.get('x1') > 95) ?
              PANEL_STATUSES.EXPANDING : PANEL_STATUSES.COLLAPSING;
            
            this.set('statusL', statusL);
          }
          
          if (isOpenC) {
            statusC = dx > 0 ?
              PANEL_STATUSES.COLLAPSING : PANEL_STATUSES.EXPANDING;
              
            this.set('statusC', statusC);
          }
          
          break;
        case 'end':
          // on drag finish, check for the collapse thresholds

          if (isOpenL) {
            statusL = (this.get('x1') > 95) ?
              PANEL_STATUSES.OPEN : PANEL_STATUSES.COLLAPSED;
            
            this.set('statusL', statusL);
          }
          
          if (isOpenC) {
            statusC = (this.get('x2') - this.get('x1') > 300) ?
              PANEL_STATUSES.OPEN : PANEL_STATUSES.COLLAPSED;
            
            this.set('statusC', statusC);
          }
          
          break;
      }
    },

    /**
     * Handles track event on the x2 handle
     * @param  {Event} e
     */
    _handleTrackX2: function (e) {

      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      var ruleSet = _modeFindRuleSet(this.get('mode'), this);

      var minX2 = _modeEvalPosition(ruleSet.x2.min, this, this.get('vw'));
      var maxX2 = _modeEvalPosition(ruleSet.x2.max, this, this.get('vw'));

      var x2 = _within(e.detail.x, [minX2, maxX2]);

      if (typeof x2 === 'number') {
        this.set('x2', x2);
      }
    },

    /**
     * Helper function used to compute the width of the center part.
     * It is used as a computed binding in the template.
     * 
     * @param  {Number} x1
     * @param  {Number} x2
     * @param  {Number} x3
     * @return {Number}
     */
    _calcCenterWidth: function (x1, x2, x3) {
      // no negative widths
      var w = x2 - x1;

      return (w > 0) ? w : 0;
    },

    /**
     * Helper function used to compute the width of the right part.
     * It is used as a computed binding in the template.
     * 
     * @param  {Number} x1
     * @param  {Number} x2
     * @param  {Number} x3
     * @return {Number}
     */
    _calcRightWidth: function (x1, x2, x3) {
      // no negative widths
      var w = x3 - x2;

      return (w > 0) ? w : 0;
    },

    /**
     * Handles resizing of the viewport.
     * Invokes the rules for resizing for x1, x2 and x3
     * and applies them to the layout.
     * 
     * @param  {Number} vw
     * @param  {Number} oldVw
     */
    _viewportWidthChanged: function (vw, oldVw) {
      var ruleSet = _modeFindRuleSet(this.get('mode'), this);

      var x1 = ruleSet.x1.resize(this, this.get('x1'), vw, oldVw);
      var x2 = ruleSet.x2.resize(this, this.get('x2'), vw, oldVw);
      var x3 = ruleSet.x3.resize(this, this.get('x3'), vw, oldVw);

      this.set('x1', x1);
      this.set('x2', x2);
      this.set('x3', x3);
    },

    /**
     * Initializes the currently active mode
     */
    _initActiveMode: function () {
      // retrieve the correct ruleSet by conditions
      var ruleSet = _modeFindRuleSet(this.get('mode'), this);

      var x1 = _modeEvalPosition(ruleSet.x1.initial, this, this.get('vw'));
      var x2 = _modeEvalPosition(ruleSet.x2.initial, this, this.get('vw'));
      var x3 = _modeEvalPosition(ruleSet.x3.initial, this, this.get('vw'));

      this.set('x1', x1);
      this.set('x2', x2);
      this.set('x3', x3);

      // activate/deactivate handles
      this.set('isOpenL', ruleSet.isOpenL);
      this.set('isOpenC', ruleSet.isOpenC);
      this.set('isOpenR', ruleSet.isOpenR);
      
      // set statuses
      var statusL = ruleSet.isOpenL ?
        PANEL_STATUSES.OPEN : PANEL_STATUSES.CLOSED;
      var statusC = ruleSet.isOpenC ?
        PANEL_STATUSES.OPEN : PANEL_STATUSES.CLOSED;
      var statusR = ruleSet.isOpenR ?
        PANEL_STATUSES.OPEN : PANEL_STATUSES.CLOSED;
      
      this.set('statusL', statusL);
      this.set('statusC', statusC);
      this.set('statusR', statusR);
    },
    
    /**
     * Whenever of each of the sections change,
     * add classes to contents.
     */
    _handleStatusChange: function (statusL, statusC, statusR) {
      console.log(statusL, statusC, statusR);
      
      if (statusL === PANEL_STATUSES.COLLAPSED) {
        // make the transition animated
        this._temporarilyAnimatePanels(300);
        // move x1 to 40 if the left panel is collapsed
        this.set('x1', 40);
      }
      
      var leftEls = Polymer.dom(this.$['left-content']).getDistributedNodes();
      var centerEls = Polymer.dom(this.$['center-content']).getDistributedNodes();
      var rightEls = Polymer.dom(this.$['right-content']).getDistributedNodes();
      
      leftEls.forEach(function (el) {
        el.setAttribute('data-panel-status', statusL);
      });
      centerEls.forEach(function (el) {
        el.setAttribute('data-panel-status', statusC);
      });
      rightEls.forEach(function (el) {
        el.setAttribute('data-panel-status', statusR);
      });
    },
    
    /**
     * Temporarily adds the animated class to the panel container
     * so that a transition is applied to panels widths and left positions
     */
    _temporarilyAnimatePanels: function (ms) {
      this.$['panel-container'].classList.add('animated');
      
      setTimeout(function () {
        this.$['panel-container'].classList.remove('animated');
      }.bind(this), ms);
    },
    
    /**
     * API
     */

    /**
     * Modifies the active mode and if any changes occur,
     * reapplies the rules of the given mode
     * @param {String} modeName
     * @param {Object} options
     *                  - force: Boolean
     */
    setMode: function (modeName, options) {

      options = options || {};

      var currentMode = this.get('mode');

      if (currentMode && currentMode.name === modeName && !options.force) {
        // requested modeName is currently the active one
        return;
      }

      var targetMode = MODES[modeName];

      if (!targetMode) {
        throw new Error('Invalid mode ', targetMode);
      }

      /**
       * Save the active mode
       */
      this.set('mode', targetMode);

      /**
       * Initialize the mode
       */
      this._initActiveMode();
    },
    
    collapse: function (panel) {
      switch (panel) {
        case 'left':
          
          if (this.get('isOpenL')) {
            // make the transition animated
            this._temporarilyAnimatePanels(300);
            
            this.set('x1', 40);
            this.set('statusL', PANEL_STATUSES.COLLAPSED);
            
            // TODO: MUST UPDATE THE CENTER PANEL STATUS AS WELL
          } else {
            console.warn('left panel is CLOSED');
          }
          
          break;
        case 'center':
          console.warn('collapse center not implemented');
          break;
        case 'right':
          console.warn('collapse right not implemented');
          break;
        default:
          console.warn('unsupported panel ' + panel);
          break;
      }
    },
    
    uncollapse: function (panel) {
      switch (panel) {
        case 'left':
          
          if (this.get('isOpenL')) {
            // make the transition animated
            this._temporarilyAnimatePanels(300);
            
            this.set('x1', 200);
            this.set('statusL', PANEL_STATUSES.OPEN);
            
            // TODO: MUST UPDATE THE CENTER PANEL STATUS AS WELL
          } else {
            console.warn('left panel is CLOSED');
          }
          
          break;
        case 'center':
          console.warn('uncollapse center not implemented');
          break;
        case 'right':
          console.warn('uncollapse right not implemented');
          break;
        default:
          console.warn('unsupported panel ' + panel);
          break;
      }
    }
  });
})();
