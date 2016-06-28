(function () {
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

    handleCloseTap: function (e) {
      e.model.item.close();
    },
  })
})();