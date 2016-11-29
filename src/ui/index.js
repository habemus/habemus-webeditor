// third-party dependencies
const Bluebird = require('bluebird');

// own
const aux = require('../aux');

module.exports = function (habemus, options) {
  
  /**
   * Define the ui singleton onto the main habemus object
   * @type {Object}
   */
  habemus.ui = {};

  return Bluebird.all([
    // ATTENTION
    // structure comes first of all!
    require('./structure')(habemus, options),
  ])
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      structure: components[0],
    });

    return Bluebird.all([
      require('./iframe-browser')(habemus, options),
      require('./tabbed-editor')(habemus, options),
    ]);
  })
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      iframeBrowser: components[0],
      tabbedEditor: components[1],
    });

    return Bluebird.all([
      require('./file-tree')(habemus, options),
      require('./menu')(habemus, options),
    ]);
  })
  .then(function (components) {

    aux.defineFrozenProperties(habemus.ui, {
      fileTree: components[0],
      menu: components[1],
    });

    return require('habemus-editor-ui')(habemus, options);
  })
  .then(function () {
    // freeze ui components
    Object.freeze(habemus.ui);

    /**
     * Set structure to show header and footer
     * according to the components defined
     */
    if (habemus.ui.header) {
      habemus.ui.structure.set('header', true);
    }

    if (habemus.ui.footer) {
      habemus.ui.structure.set('footer', true);
    }
  });
};
