(function () {

  Polymer({
    is: 'habemus-publish-project-dialog',
    properties: {
      /**
       * Translations
       * @type {Object}
       */
      translate: {
        type: Function,
      }
    },
    behaviors: [
      Polymer.PaperDialogBehavior,
    ],
    ready: function () {},
    _handleDownloadTap: function (e) {
      this.fire('download-requested');
    },
  });

})();
