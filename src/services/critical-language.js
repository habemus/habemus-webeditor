/**
 * Critical language are the messages that must be used before
 * any setup is ready and thus have to be 
 * embedded in the application code.
 * Should be a VERY SMALL fraction of the total messages.
 *
 * As small as possible.
 */

// third-party
const Bluebird = require('bluebird');
const Polyglot = require('node-polyglot');

// languages
const LANGUAGES = {
  'en-US': require('../resources/languages/critical/en-US.json'),
  'pt-BR': require('../resources/languages/critical/pt-BR.json'),
};

const FALLBACK = 'en-US';

module.exports = function (habemus, options) {

  var selectedLanguageKey = window.localStorage.getItem(
    habemus.constants.HABEMUS_LANGUAGE_LS_KEY
  ) || FALLBACK;

  var selectedLanguageData = LANGUAGES[selectedLanguageKey] || LANGUAGES[FALLBACK];

  return Bluebird.resolve(new Polyglot({
    phrases: selectedLanguageData
  }));
};
