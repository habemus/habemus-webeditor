(function () {

  Polymer({
    is: 'habemus-sw-installation-dialog',
    properties: {
      mode: {
        value: 'installing',
      },
      _installationReady: {
        value: false,
      },
      modal: {
        value: true,
      },
      withBackdrop: {
        value: true,
      },

      // translation fn
      translate: {
        type: Function,
      }
    },

    behaviors: [
      Polymer.PaperDialogBehavior
    ],

    observers: [
      '_handleModeChange(mode)',
    ],

    ready: function () {},

    _handleModeChange: function (mode) {
      this.set('_installationReady', mode === 'installed');
    },

    _handleStartTap: function (e) {
      window.location.reload();
    },
  });

})();