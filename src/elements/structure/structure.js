(function () {

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
   * Auxiliary function that returns the correct mode from a given mode list
   * by evaluating mode conditions.
   *
   * Returns the first mode found.
   * 
   * @param  {Array} modeList
   * @param  {Structure} structure
   * @return {Object}
   */
  function _modeFindMode(modeList, structure) {
    var mode = modeList.find(function (mode) {
      return mode.condition(structure);
    });

    if (!mode) {
      throw new Error('could not find mode in modeList', modeList);
    }

    return mode;
  }

  var MODES = {};

  /**
   * LeftCenter mode
   * @type {Object}
   */
  MODES.LC = [
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw >= 600 && vw < 1300;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: false,

      x1: {
        min: 0.1,
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
        min: 0.1,
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

  MODES.LCR = [
    {
      condition: function (structure) {
        var vw = structure.get('vw');

        return vw < 600;
      },
      isOpenL: true,
      isOpenC: true,
      isOpenR: true,

      x1: {
        min: 0.05,
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
        min: 0.1,
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

      isOpenC: {
        type: Boolean,
      },

      isOpenR: {
        type: Boolean,
      },

      modeList: {
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
    
    ready: function () {
      window.addEventListener('resize', function () {
        // TODO: RAF
        this.set('vw', window.innerWidth);
      }.bind(this));

      this.setMode('LCR');
      // this.setMode('LC');
    },

    handleTrackX1: function (e) {
      // make handles larger when dragging happens
      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      var mode = _modeFindMode(this.modeList, this);

      var minX1 = _modeEvalPosition(mode.x1.min, this, this.get('vw'));
      var maxX1 = _modeEvalPosition(mode.x1.max, this, this.get('vw'));

      var x1 = _within(e.detail.x, [minX1, maxX1]);

      if (typeof x1 === 'number') {
        this.set('x1', x1);
      }
    },

    handleTrackX2: function (e) {

      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      var mode = _modeFindMode(this.modeList, this);

      var minX2 = _modeEvalPosition(mode.x2.min, this, this.get('vw'));
      var maxX2 = _modeEvalPosition(mode.x2.max, this, this.get('vw'));

      var x2 = _within(e.detail.x, [minX2, maxX2]);

      if (typeof x2 === 'number') {
        this.set('x2', x2);
      }
    },

    calcCenterWidth: function (x1, x2, x3) {
      // no negative widths
      var w = x2 - x1;

      return (w > 0) ? w : 0;
    },

    calcRightWidth: function (x1, x2, x3) {
      // no negative widths
      var w = x3 - x2;

      return (w > 0) ? w : 0;
    },

    _viewportWidthChanged: function (vw, oldVw) {
      var mode = _modeFindMode(this.modeList, this);

      var x1 = mode.x1.resize(this, this.get('x1'), vw, oldVw);
      var x2 = mode.x2.resize(this, this.get('x2'), vw, oldVw);
      var x3 = mode.x3.resize(this, this.get('x3'), vw, oldVw);

      this.set('x1', x1);
      this.set('x2', x2);
      this.set('x3', x3);
    },

    setMode: function (modeName) {

      var modeList = MODES[modeName];

      if (!modeList) {
        throw new Error('Invalid mode ', modeList);
      }

      // retrieve the correct mode by conditions
      var mode = _modeFindMode(modeList, this);

      if (!mode) {
        throw new Error('could not find correct mode in modeList', modeList);
      }

      var x1 = _modeEvalPosition(mode.x1.initial, this, this.get('vw'));
      var x2 = _modeEvalPosition(mode.x2.initial, this, this.get('vw'));
      var x3 = _modeEvalPosition(mode.x3.initial, this, this.get('vw'));

      this.set('x1', x1);
      this.set('x2', x2);
      this.set('x3', x3);

      // activate/deactivate handles
      this.set('isOpenL', mode.isOpenL);
      this.set('isOpenC', mode.isOpenC);
      this.set('isOpenR', mode.isOpenR);

      /**
       * Save the active modeList
       */
      this.set('modeList', modeList);
    },

    toggleLeft: function (open) {

    },

    toggleCenter: function (open) {

    },

    toggleRight: function (open) {

    },
  });
})();
