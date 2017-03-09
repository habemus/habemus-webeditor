/**
 * In habemus editor, the translations are not 'live'.
 * That means that once trasnlated strings are in place,
 * the ui will not update afterwards.
 *
 * This decision was made so that it is easier to reason about
 * translation strings and stuff like that. As language changing
 * is not a task performed often, there is no reason for requiring
 * all ui elements to listen for i18n changes.
 *
 * The application will simply reload (full refresh of webpage)
 * and all service and ui setup will be re-run.
 */

// native
const url  = require('url');
const path = require('path');

// third-party
const Bluebird = require('bluebird');
const Polyglot = require('node-polyglot');
const superagent = require('superagent');

const LANGUAGE_CACHE_LS_PREFIX = 'habemus_editor_languages_';

module.exports = function (habemus, options) {

  if (!habemus.services.config.language) {
    throw new Error('habemus.services.config.language is required');
  }

  const LANGUAGES_BASE_URL  = habemus.services.config.language.baseURL;
  const AVAILABLE_LANGUAGES = habemus.services.config.language.languages;
  const FALLBACK_LANGUAGE   = AVAILABLE_LANGUAGES.find(function (lang) {
    return lang.key === habemus.services.config.language.fallback;
  });

  if (!LANGUAGES_BASE_URL) {
    throw new Error('habemus.services.config.language.baseURL is required');
  }

  if (!FALLBACK_LANGUAGE) {
    throw new Error('could not find fallback language in available language list');
  }

  /**
   * Auxiliary function that caches the language
   */
  function _cacheLanguage(languageKey, languageData) {
    // first attempt to load the language from cache
    var cacheKey = LANGUAGE_CACHE_LS_PREFIX + languageKey;

    try {
      window.localStorage.setItem(
        cacheKey,
        JSON.stringify(languageData)
      );
    } catch (e) {
      // discard caching error
    }
  }

  /**
   * Auxiliary function that loads a given language
   * from either localStorage cache or from the server (and caches it afterwards)
   * 
   * @param  {String} languageKey
   * @return {Bluebird -> LanguageData}
   */
  function _ensureLanguageLoaded(languageKey) {

    // always load the language from the server
    // so that translations are always updated
    var serverPromise = new Bluebird(function (resolve, reject) {

      superagent
        .get(path.join(LANGUAGES_BASE_URL, languageKey + '.json'))
        .end(function (err, res) {
          if (err) {
            reject(err);
            return;
          }

          _cacheLanguage(languageKey, res.body);

          resolve(res.body);
        });
    });

    // first attempt to load the language from cache
    var cacheKey = LANGUAGE_CACHE_LS_PREFIX + languageKey;

    return new Bluebird(function (resolve, reject) {
      var langStr = window.localStorage.getItem(cacheKey);

      if (!langStr) {
        reject(new Error('language not in cache'));
        return;
      }

      resolve(JSON.parse(langStr));
    })
    .catch(function (err) {
      // whatever error happens in reading from cache,
      // return the server promise
      return serverPromise;
    });
  }

  function _resetLanguage(languageKey) {

    window.localStorage.setItem(
      habemus.constants.HABEMUS_LANGUAGE_LS_KEY,
      languageKey
    );
    
    return habemus.services.dialogs.confirm(
      habemus.services.language.t('language.reset-confirm')
    )
    .then(function () {

      var parsed = url.parse(window.location.toString(), true);
      // force url.format to use the query object
      delete parsed.search;
      parsed.query.lang = languageKey;

      window.location.assign(url.format(parsed));
    });
  }

  // cache all available languages with a `data` property
  AVAILABLE_LANGUAGES.forEach(function (lang) {
    if (typeof lang.data === 'object') {
      _cacheLanguage(lang.key, lang.data);
    }
  });


  /**
   * Fallback polyglot
   * Always uses the FALLBACK_LANGUAGE.data
   * @type {Polyglot}
   */
  var _fallback = new Polyglot({
    phrases: FALLBACK_LANGUAGE.data,
  });

  /**
   * Attempt to retrieve the user's selected language
   * Use the fallback one in case none has been selected
   * @type {String}
   */
  var selectedLanguageKey = window.localStorage.getItem(
    habemus.constants.HABEMUS_LANGUAGE_LS_KEY
  ) || FALLBACK_LANGUAGE.key;
  window.localStorage.setItem(
    habemus.constants.HABEMUS_LANGUAGE_LS_KEY,
    selectedLanguageKey
  );

  return _ensureLanguageLoaded(selectedLanguageKey)
    .catch(function (err) {
      // server error
      // use fallback language
      // TODO: notify user of failure
      habemus.services.notification.error.show({
        text: _fallback.t('language.failed-to-load-language', {
          language: selectedLanguageKey,
          fallback: FALLBACK_LANGUAGE.key,
        }),
        duration: 3000,
      });

      return new Bluebird(function (resolve) {
        setTimeout(resolve.bind(null, {}), 2000);
      });
    })
    .then(function (languageData) {
      /**
       * Main translation polyglot
       * Starts empty
       * @type {Polyglot}
       */
      var polyglot = new Polyglot({
        phrases: languageData,
      });

      console.log('SELECTED_LANGUAGE', selectedLanguageKey);
      console.log(languageData);

      return {
        t: function translate(key, data) {
          if (polyglot.has(key)) {
            // if the main polyglot instance has the translation,
            // use it.
            return polyglot.t(key, data);
          } else {
            console.warn('translate using fallback for ' + key);
            // otherwise use the fallback polyglot which 
            // is always set to the default language
            return _fallback.t(key, data);
          }
        },
        resetLanguage: _resetLanguage,
        available: AVAILABLE_LANGUAGES,
        selected: selectedLanguageKey,
      };
    });
};
