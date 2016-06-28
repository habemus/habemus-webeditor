(function () {

  const DRAGGING = 'dragging';
  const DRAGOVER = 'dragover';
  const DRAGOVER_LEFT = 'dragover-left';
  const DRAGOVER_RIGHT = 'dragover-right';
  const TAB_POSITION = 'sourceTabPosition';

  Polymer({
    is: 'habemus-editor-tabs',

    properties: {
      files: {
        type: Array,
        notify: true,
      },

      selected: {
        type: String,
        notify: true,
      }
    },

    _handleTabDragstart: function (e) {
      e.target.classList.add(DRAGGING);

      var tabPosition = e.model.index;

      e.dataTransfer.setData(TAB_POSITION, tabPosition);

      // select on dragstart
      this.select(e.model.item.id);
    },

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
        var draggedTabModel = this.splice('files', draggedTabPosition, 1)[0];

        if (draggedTabLastSide === 'left' && dropSide === 'left') {
          // tab was before
          // and is still before
          this.splice('files', tabPosition - 1, 0, draggedTabModel);

        } else if (draggedTabLastSide === 'left' && dropSide === 'right') {
          // tab was before and now is after
          this.splice('files', tabPosition, 0, draggedTabModel);

        } else if (draggedTabLastSide === 'right' && dropSide === 'right') {
          // tab was after and is still after
          this.splice('files', tabPosition + 1, 0, draggedTabModel)

        } else if (draggedTabLastSide === 'right' && dropSide === 'left') {
          // tab was after and now is before
          this.splice('files', tabPosition, 0, draggedTabModel)
        }
      }
    },

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

    select: function (id) {
      return this.$.tabs.select(id);
    },

    clearSelection: function () {
      return this.$.tabs.selectIndex(-1);
    }
  })
})();