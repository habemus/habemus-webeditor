(function () {

  const FILE_BROWSER_WIDTH = {
    min: 0,
    ideal: 160
  };

  const EDITOR_WIDTH = {
    min: 500,
    ideal: 900,
  };

  const PREVIEWER_WIDTH = {
    min: 300,
    ideal: 900
  };

  Polymer({
    is: 'habemus-structure',
    properties: {
      /**
       * Handle positions
       */
      x1: {
        type: Number,
        notify: true,
        value: 160
      },
      x2: {
        type: Number,
        notify: true,
        value: 900
      },
      x3: {
        type: Number,
        notify: true,
        value: window.innerWidth
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

      // previewMode: {
      //   type: String,
      //   notify: true,
      //   value: '',
      //   observer: '_previewModeChanged'
      // }
    },

    handleTrackX1: function (e) {
      // make handles larger when dragging happens
      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      var ddx = e.detail.ddx || 0;

      var currentx1 = this.get("x1");

      var newx1 = currentx1 + ddx;

      if (typeof newx1 == 'number') {
        this.set('x1', newx1);
      } else {
        console.warn('x1 not a number');
      }

      if (newx1 <= 10) {
        this.set('x1', 10);
      }

      if (newx1 >= 1000) {
        this.set('x1', 1000);
      }
    },

    handleTrackX2: function (e) {

      if (e.detail.state === 'start') {
        Polymer.Base.toggleClass('dragging', true, e.target);
      }

      if (e.detail.state === 'end') {
        Polymer.Base.toggleClass('dragging', false, e.target);
      }

      var ddx = e.detail.ddx || 0;

      var currentx2 = this.get("x2");
      var newx2 = currentx2 + ddx;
      var currentx1 = this.get("x1");

      if (typeof newx2 == 'number') {
        this.set('x2', newx2);
      } else {
        console.warn('x2 not a number');
      }

      if ( newx2 <= currentx1 + 10 ) {
        this.set('x2', currentx1 + 10);
      }

      e.stopPropagation();
    },

    calcEditorWidth: function (x1, x2, x3) {
      // no negative widths
      var w = x2 - x1;

      return (w > 0) ? w : 0;
    },

    calcPreviewerWidth: function (x1, x2, x3) {

      // console.log('x1', x1);
      // console.log('x2', x2);
      // console.log('x3', x3);

      // no negative widths
      var w = x3 - x2;

      return (w > 0) ? w : 0;
    },

    _viewportWidthChanged: function (vw, oldVw) {


      this.set('x3', vw);

      Polymer.Base.toggleClass('viewport-resizing', true, this.$['panel-container']);

      setTimeout(function () {
        Polymer.Base.toggleClass('viewport-resizing', false, this.$['panel-container']);
      }.bind(this), 500);

      console.log('vw', vw);

      var dvw = vw - oldVw;

      var x1 = this.get('x1');
      var x2 = this.get('x2');
      var x3 = this.get('x3');

      if (dvw < 0) {
        // smaller
        
        if (vw - PREVIEWER_WIDTH.min < x2) {
          // make sure previewer has its minimum size
          this.set('x2', vw - PREVIEWER_WIDTH.min);
        }

      } else {
        // bigger
        // var editorWidth = this.calcEditorWidth(x1, x2, x3);

        // if (editorWidth >= EDITOR_WIDTH.ideal) {
        //   // do nothing, everybody is happy, let the previewer take the
        //   // space
        // } else {

        //   // editor needs space
        //   this.set('x2', x2 + dvw);
        // }
      }
    },


    // adjust previewer width when previewMode is smaller than the document width
    // _previewModeChanged: function (newPreviewMode, oldPreviewMode) {

    //   var desktopWidth   = 1024;
    //   var tabletWidth    = 768;
    //   var mobileWidth    = 400;
    //   var documentWidth  = document.body.clientWidth;
    //   var x2             = this.x2;

    //   if (newPreviewMode === "desktop" && (x2 + desktopWidth < documentWidth)) {
    //     this.set('x2', documentWidth - desktopWidth);

    //   } else if (newPreviewMode === "tablet" && (x2 + tabletWidth < documentWidth)) {
    //     this.set('x2', documentWidth - tabletWidth);
      
    //   } else if (newPreviewMode === "mobile" && (x2 + mobileWidth < documentWidth)) {
    //     this.set('x2', documentWidth - mobileWidth);
    //   }
    // }
  });
})();
