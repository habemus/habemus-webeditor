(function () {

  const DRAGGING = 'dragging';
  const DRAGOVER = 'dragover';
  const DRAGOVER_LEFT = 'dragover-left';
  const DRAGOVER_RIGHT = 'dragover-right';
  const TAB_POSITION = 'sourceTabPosition';

  Polymer({
    is: 'habemus-editor-tabs',

    properties: {
      /**
       * Array of tabData objects
       * to be rendered
       * @type {Array}
       */
      tabs: {
        type: Array,
        notify: true,
        value: [],
      },
    },
    
    /**
     * If there are tabs defined, validate them
     */
    ready: function () {
      if (this.tabs) {
        // validate tab format
        this.tabs.forEach(function (tab, index) {
          if (!tab.path) { throw new Error('tab path is required'); }

          // var pathSplit = tab.path.split('/');

          // this.set('tabs.' + index + '.name', pathSplit[pathSplit.length - 1])

          // tab.name = ;
        }.bind(this));
      }
    },

    /**
     * Handles dragstart events on tabs
     * Sets the tabPosition to the dataTransfer object of the
     * drag and drop event.
     *
     * @private
     *
     * Selects the dragging tab as well
     * @param  {Polymer DOM Event} e
     */
    _handleTabDragstart: function (e) {
      e.target.classList.add(DRAGGING);

      var tabPosition = e.model.index;

      e.dataTransfer.setData(TAB_POSITION, tabPosition);
      e.dataTransfer.effectAllowed = 'move';

      // select on dragstart
      this.select(e.model.item.path);
    },

    /**
     * Handles dragover events on tabs
     * Applies dragover interactions
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     */
    _handleTabDragover: function (e) {
      /**
       * Dragover: cancel the event, so that we can do drop
       * (weird, but that's how it works according to docs)
       * http://www.html5rocks.com/en/tutorials/dnd/basics/
       */
      e.preventDefault(); // Necessary. Allows us to drop.
      
      // compare the dragged tab position
      // to theDRAGOVERed tab position
      var tabPosition        = e.model.index;
      var draggedTabPosition = parseInt(e.dataTransfer.getData(TAB_POSITION), 10);

      if (tabPosition === draggedTabPosition) {
        return;
      } else {

        // check what is the drop position
        var side = this._computeDropSide(e.clientX, e.target);

        if (side === 'left') {
          e.target.classList.remove(DRAGOVER_RIGHT);
          e.target.classList.add(DRAGOVER_LEFT);
        } else {
          e.target.classList.remove(DRAGOVER_LEFT);
          e.target.classList.add(DRAGOVER_RIGHT);
        }

        e.target.classList.add(DRAGOVER);
      }
    },

    /**
     * Handles dragleave events on tabs
     * Clears dragover interactions from the tab
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     */
    _handleTabDragleave: function (e) {
      var tabPosition        = e.model.index;
      var draggedTabPosition = parseInt(e.dataTransfer.getData(TAB_POSITION), 10);

      if (tabPosition === draggedTabPosition) {
        return;
      } else {
        // clear dragovers
        e.target.classList.remove(DRAGOVER, DRAGOVER_LEFT, DRAGOVER_RIGHT);
      }
    },

    /**
     * Handles drop event on a tab
     * Computes the drop position and reorders the tabs
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     */
    _handleTabDrop: function (e) {
      // compare the dragged tab position
      // to theDRAGOVERed tab position
      var tabPosition        = e.model.index;
      var draggedTabPosition = parseInt(e.dataTransfer.getData(TAB_POSITION), 10);

      if (tabPosition === draggedTabPosition) {
        return;
      } else {

        // TODO improve logic of moving tab and separate it into
        // its own method

        // check what is the drop position
        // and verify if the draggedTab was originally before or after
        var dropSide = this._computeDropSide(e.clientX, e.target);
        var draggedTabLastSide = (draggedTabPosition < tabPosition) ? 'left' : 'right';

        // remove the dragged tab model form the array
        var draggedTabModel = this.splice('tabs', draggedTabPosition, 1)[0];

        if (draggedTabLastSide === 'left' && dropSide === 'left') {
          // tab was before
          // and is still before
          this.splice('tabs', tabPosition - 1, 0, draggedTabModel);

        } else if (draggedTabLastSide === 'left' && dropSide === 'right') {
          // tab was before and now is after
          this.splice('tabs', tabPosition, 0, draggedTabModel);

        } else if (draggedTabLastSide === 'right' && dropSide === 'right') {
          // tab was after and is still after
          this.splice('tabs', tabPosition + 1, 0, draggedTabModel)

        } else if (draggedTabLastSide === 'right' && dropSide === 'left') {
          // tab was after and now is before
          this.splice('tabs', tabPosition, 0, draggedTabModel)
        }
      }
    },

    /**
     * Handles dragend event.
     * Clears all drag-related interactions
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     */
    _handleTabsDragend: function (e) {
      Array.prototype.forEach.call(
        this.$.tabs.querySelectorAll('.dragover,.dragging'),
        function (el) {
          el.classList.remove(DRAGGING, DRAGOVER, DRAGOVER_LEFT, DRAGOVER_RIGHT);
        }
      );
    },

    /**
     * Given a mouse posistion and the target drop element,
     * check whether the drop will be on left or right side.
     *
     * @private
     * 
     * @param  {Number} mouseLeft
     * @param  {DOM Element} dropElement
     * @return {String} either 'left' or 'right'
     */
    _computeDropSide: function (mouseLeft, dropElement) {

      // compare mouseLeft to the tab's bounding rect
      // to discover whether the drop will be to the left or to the right
      var boundingRect = dropElement.getBoundingClientRect();

      // variable that indicates the side the dragover event happened
      var leftDistance = Math.abs(mouseLeft - boundingRect.left);
      var rightDistance = Math.abs(mouseLeft - boundingRect.right);
      var side = (leftDistance <= rightDistance) ? 'left' : 'right';

      return side;
    },

    /**
     * Emits 'close-intention' event
     * and provides listeners with a manner of confirming the
     * closing of the tab.
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     *         - detail:
     *           - confirm {Function}
     *           - cancel {Function}
     */
    _handleButtonTap: function (e) {
      // stop propagation to prevent the item from being selected
      e.stopPropagation();

      var item = e.model.item;

      this.fire('close-intention', {
        item: item,
      });
    },

    /**
     * Emits the 'create-intention' event
     */
    _handleTabsDblclick: function (e) {
      this.fire('create-intention');
    },
    
    /**
     * Selects a tab by path.
     * @param  {String} path
     */
    select: function (path) {
      this.$.tabs.select(path);
      return;
    },

    /**
     * Selects a tab by index
     * @param  {Number} index
     */
    selectIndex: function (index) {
      this.$.tabs.selectIndex(index);
      return;
    },

    /**
     * Deselects any tab
     */
    clearSelection: function () {
      this.$.tabs.selectIndex(-1);
      return;
    },

    /**
     * Creates a new tab
     * and makes it selected
     * @param  {Object} tabData
     *         - path
     * @param  {Object} options
     *         - select: Boolean
     */
    createTab: function (tabData, options) {
      // create a new tab immediately after currently selected tab
      // and select it
      if (!tabData || !tabData.path) {
        throw new Error('tabData is required and must have a path');
      }

      // normalize tabData
      var pathSplit = tabData.path.split('/');

      tabData.name = pathSplit[pathSplit.length - 1];

      this.push('tabs', tabData);

      if (options && options.select) {
        this.select(tabData.path);
      }
    },

    /**
     * Closes the tab with the given path.
     * @param  {String} tabPath
     */
    closeTab: function (tabPath) {
      var index = this.tabs.findIndex(function (tab) {
        return tab.path === tabPath;
      });

      if (index === -1) {
        throw new Error('tab ' + tabPath + ' not found');
      }

      if (tabPath === this.$.tabs.selected && this.tabs.length > 1) {
        // if the tab to be closed is the 
        // same that is selected
        // and there are more open tabs
        // try to open another tab:
        // the previous tab if there is one and the next tab else
        var anotherTabIndex = (index > 0) ? index - 1 : index + 1;
        var anotherTab = this.tabs[anotherTabIndex];

        this.select(anotherTab.path);
      }

      // remove the tab
      this.splice('tabs', index, 1);
    },

    /**
     * Retrieves a tab by its path
     * @param  {String} tabPath
     * @return {Object}
     */
    getTab: function (tabPath) {
      return this.tabs.find(function (tab) {
        return tab.path === tabPath;
      });
    },

    /**
     * Returns the tab's position.
     * @param  {String} tabPath
     * @return {Number}
     */
    getTabIndex: function (tabPath) {
      return this.tabs.findIndex(function (tab) {
        return tab.path === tabPath;
      });
    },

    /**
     * Sets data on the tab
     * @param {String} tabPath
     * @param {String} key
     * @param {*} value
     */
    setTabData: function (tabPath, key, value) {
      var index = this.tabs.findIndex(function (tab) {
        return tab.path === tabPath;
      });

      this.set('tabs.' + index + '.' + key, value);
    },
  });

})();