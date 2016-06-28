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
          if (!tab.id) { throw new Error('tab is is required'); }

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

      // select on dragstart
      this.select(e.model.item.id);
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
        confirm: function () {

          this.closeTab(item.id);

        }.bind(this),
        cancel: function () {

          // do nothing

        }.bind(this)
      });
    },

    /**
     * Emits the 'create-intention' event
     * and provides listeners a manner of confirming new tab creation
     *
     * @private
     * 
     * @param  {Polymer DOM Event} e
     *         - detail:
     *           - confirm {Function}
     *           - cancel {Function}
     */
    _handleTabsDblclick: function (e) {

      this.fire('create-intention', {
        confirm: function (item) {

          if (typeof item !== 'object' || typeof item.id !== 'string') {
            throw new Error('item must not be empty and must have an id');
          }

          this.push('tabs', item);

        }.bind(this),
        cancel: function () {

        }.bind(this)
      })
    },

    /**
     * Selects a tab by id.
     * @param  {String} id
     */
    select: function (id) {
      this.$.tabs.select(id);
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
     *         - id
     * @param  {Object} options
     *         - select: Boolean
     */
    createTab: function (tabData, options) {
      // create a new tab immediately after currently selected tab
      // and select it
      if (!tabData || !tabData.id || !tabData.path) {
        throw new Error('tabData is required and must have an id and a path');
      }

      // normalize tabData
      var pathSplit = tabData.path.split('/');

      tabData.name = pathSplit[pathSplit.length - 1];

      this.push('tabs', tabData);

      if (options && options.select) {
        this.select(tabData.id);
      }
    },

    /**
     * Closes the tab with the given id.
     * @param  {String} tabId
     */
    closeTab: function (tabId) {
      var index = this.tabs.findIndex(function (tab) {
        return tab.id === tabId;
      });

      if (index === -1) {
        throw new Error('tab ' + tabId + ' not found');
      }

      if (this.tabs.length > 1) {
        // if there are more open tabs
        // try to open another tab:
        // the previous tab if there is one and the next tab else
        var anotherTabIndex = (index > 0) ? index - 1 : index + 1;
        var anotherTab = this.tabs[anotherTabIndex];

        this.select(anotherTab.id);
      }

      // remove the tab
      this.splice('tabs', index, 1);
    },

    /**
     * Retrieves a tab by its id
     * @param  {String} tabId
     * @return {Object}
     */
    getTab: function (tabId) {
      return this.tabs.find(function (tab) {
        return tab.id === tabId;
      });
    }
  });

})();