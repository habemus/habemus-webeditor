(function () {


  const ITEM_OPTIONS = [
    {
      prop: 'size',
      default: false
    },
    {
      prop: 'min',
      default: 0,
    },
    {
      prop: 'max',
      default: false,
    },
    {
      prop: 'target',
      default: false,
    },
  ];

  const DEFAULTS = ITEM_OPTIONS.reduce(function (res, opt) {

    res[opt.prop] = opt.default;

    return res;
  }, {});


  function _max(v1, v2) {
    return v1 >= v2 ? v1 : v2;
  }

  function _min(v1, v2) {
    return v1 <= v2 ? v1 : v2;
  }

  function _sum(items, getFn) {
    return items.reduce(function (res, item) {
      var value = getFn(item);

      return res + value;
    }, 0);
  }

  function resourceSplitAlg(itemTemplates, options) {

    /**
     * Normalize all itemTemplates
     */
    itemTemplates = itemTemplates.map(function (def) {
      return ITEM_OPTIONS.reduce(function (_def, opt) {

        _def[opt.prop] = typeof def[opt.prop] === 'undefined' ? opt.default : def[opt.prop];

        if (typeof _def[opt.prop] !== 'number' &&
            typeof _def[opt.prop] !== 'boolean') {
          throw new TypeError(opt.prop + ' MUST be either a number or a boolean');
        }

        return _def;
      }, {});
    });

    /**
     * Computes the resource distribution given the total
     * available resources.
     *
     * Returns an array of numbers that correspond to the
     * resources distributed to each item.
     * 
     * @param  {Number} total
     * @return {Array[Number]}
     */
    var computeSplit = function(total, items) {

      if (typeof total !== 'number') {
        throw new TypeError('total MUST be a number');
      }

      if (items.length !== itemTemplates.length) {
        throw new Error('items.length and itemTemplates.length do not match');
      }

      /**
       * Merge the items with their corresponding templates
       * @type {Array}
       */
      items = items.map(function (item, index) {
        var i = Object.assign({}, itemTemplates[index], item);

        if (typeof i.size === 'number') {
          i.size = _max(i.size, i.min);
        }

        return i;
      });

      /**
       * Minimum amount of units that are required for the layout.
       * Takes into account the sized units for items that already were sized
       * and the minimum for items that were not sized.
       * @type {Number}
       */
      var totalMinimum = _sum(items, function (item) {
        return item.size || item.min;
      })

      // OPTIMIZATION:
      if (totalMinimum >= total) {
        // the total minimum size exceeds the absolute total
        // available
        return items.map(function (item) {
          return item.size || item.min;
        });
      }

      /**
       * Amount of units that were already used in sizing.
       * @type {Number}
       */
      var totalSized = _sum(items, function (item) {
        return item.size || 0;
      });

      /**
       * Amount of units that are available for sizing
       * @type {Number}
       */
      var totalAvailable = total - totalSized;

      /**
       * Array of items that need to be sized
       * The totalAvailable units will be distributed among these items.
       */
      var sizingItems = items.filter(function (item) {
        return (typeof item.size !== 'number');
      });
      
      /**
       * Amount of units that the items to be sized would occupy
       * if they all occupied their full target size.
       * @type {Number}
       */
      var sizingTotalTarget = _sum(sizingItems, function (item) {
        return item.target || 0;
      });

      // OPTIMIZATION:
      if (totalAvailable === sizingTotalTarget) {
        return items.map(function (item) {
          return typeof item.size === 'number' ? item.size : item.target;
        });
      }

      /**
       * Total amount of units all sizing items will have to shift from their
       * target size
       * @type {Number}
       */
      var sizingTotalDelta = totalAvailable - sizingTotalTarget;

      /**
       * The type of sizing that will be applied:
       * sized items will either 
       * `grow` relative to their target size
       * `shrink` relative to their target size
       * or match their exact target sizes
       */
      var sizingMode;

      if (sizingTotalDelta === 0) {
        sizingMode = 'fit';
      } else if (sizingTotalDelta > 0) {
        sizingMode = 'grow';
      } else {
        sizingMode = 'shrink';
      }

      if (sizingMode === 'fit') {
        // no need for sizing, simply use ideal sizes
        sizingItems.forEach(function (item) {
          item.size = item.target;
        });

      } else {

        /**
         * Total amount of units all sizing items are capable of
         * shifting.
         *
         * When sizing is in 'grow' mode, max deltas are calculated
         * against the item's max size
         *
         * When sizing is in 'shrink' mode, max deltas are calculated
         * against the item's min size.
         *
         * ATTENTION:
         * item's maxDelta is saved to the item itself, as it will be used
         * later for actual delta calculation.
         *
         * @type {Number}
         */
        var sizingTotalMaxDelta;
        if (sizingMode === 'grow') {

          sizingTotalMaxDelta = _sum(sizingItems, function (item) {
            // max is either the item's defined max or the
            // item.target plus the total delta available
            var max = typeof item.max === 'number' ?
              item.max : item.target + sizingTotalDelta;
            var maxDelta = max - item.target;

            item.maxDelta = maxDelta;

            return maxDelta; 
          });

        } else if (sizingMode === 'shrink') {

          // compute the total maxDelta
          sizingTotalMaxDelta = _sum(sizingItems, function (item) {

            var maxDelta = item.min - item.target;
            item.maxDelta = maxDelta

            return maxDelta;
          });
        }

        // apply sizing
        sizingItems.forEach(function (item) {
          var multiplier    = (item.maxDelta / sizingTotalMaxDelta);
          var potentialSize = item.target + (multiplier * sizingTotalDelta);

          item.size = _max(potentialSize, item.min);
        });
      }

      return items.map(function (item) {
        return item.size;
      });
    };

    return computeSplit;
  }

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

      leftIsOpen: {
        type: Boolean,
        notify: true,
        value: true,
      },

      centerIsOpen: {
        type: Boolean,
        notify: true,
        value: true,
      },

      rightIsOpen: {
        type: Boolean,
        notify: true,
        value: false,
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

    splitAlg: resourceSplitAlg([
      {
        min: 190,
        target: 250,
        max: 400
      },
      {
        min: 600,
        target: 700,
        max: 1000,
      },
      {
        min: 0,
        target: 300,
      },
    ]),
    
    ready: function () {
      window.addEventListener('resize', function () {
        // TODO: RAF
        this.set('vw', window.innerWidth);
      }.bind(this));
    },

    /**
     * Auxiliary method that computes the sizes
     * for each section based on their current status.
     * @return {Array}
     */
    _computeCurrentSizes: function () {

      var x1 = this.get('x1');
      var x2 = this.get('x2');
      var x3 = this.get('x3');

      var leftSize   = this.leftIsOpen   ? x1 : 0;
      var centerSize = this.centerIsOpen ? x2 - x1 : 0;
      var rightSize  = this.rightIsOpen  ? x3 - x2 : 0;

      return [leftSize, centerSize, rightSize];
    },

    handleTrackX1: function (e) {
      // make handles larger when dragging happens
      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      if (!this.leftIsOpen) {
        // this handle only works for the left side
        return;
      }

      var ddx = e.detail.ddx || 0;

      var x1 = this.get('x1');
      // var x2 = this.get('x2');

      // var newX1 = x1 + ddx;
      // var newX2 = x2 + ddx;

      var newX1 = e.detail.x;

      if (typeof newX1 === 'number') {
        this.set('x1', newX1);
      }

      // if (typeof newX1 === 'number') {

      //   var sizes = this.splitAlg(
      //     this.get('vw'),
      //     [
      //       { target: newX1 },
      //       { target: newX2 - newX1 },
      //       { size: this.rightIsOpen ? false : 0, }
      //     ]
      //   );

      //   console.log(this.rightIsOpen);
      //   console.log(sizes);

      //   this.applySizes(sizes);
      // } else {
      //   console.warn('x1 not a number');
      // }
    },

    handleTrackX2: function (e) {

      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      if (!this.rightIsOpen) {
        return;
      }

      var ddx = e.detail.ddx || 0;

      var x1 = this.get('x1');
      var x2 = this.get('x2');

      var newX2 = x2 + ddx;

      if (typeof newX2 === 'number') {

        var sizes = this.splitAlg(this.get('vw'), [
          { size: x1 },
          { target: newX2 - x1 },
          { size: false }
        ]);

        this.applySizes(sizes);
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
      var sizes = this.splitAlg(vw, [
        { size: false, },
        { size: false },
        { size: false }
      ]);

      this.applySizes(sizes);
    },

    applySizes: function (sizes) {
      this.set('x1', sizes[0]);
      this.set('x2', sizes[0] + sizes[1]);
      this.set('x3', sizes[0] + sizes[1] + sizes[2]);
    },

    toggleLeft: function (open) {

    },

    toggleCenter: function (open) {

    },

    toggleRight: function (open) {

    },
  });
})();
