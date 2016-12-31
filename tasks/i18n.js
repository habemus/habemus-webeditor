// native
const path = require('path');

// third-party

module.exports = function (gulp, $, config) {
  
  gulp.task('merge-translations', function () {
    
    var translatableFiles = [
      
      // happiness-tree
      'node_modules/happiness-tree/lib/**/*',
      
      // environments
      'environments/**/*',
      
      // src
      'src/ui/**/*',
      'src/services/**/*',
      'src/elements/**/*',
    ];
    
    return gulp.src(translatableFiles)
      .pipe($.prepareTranslations({
        languages: [
          {
            code: 'en-US',
            src: path.join(__dirname, '../src/resources/languages/en-US.json'),
          },
          {
            code: 'pt-BR',
            src: path.join(__dirname, '../src/resources/languages/pt-BR.json'),
          }
        ],
        patterns: [
          /_t\(['"](.+)['"]/g,
          
          // long form used in editor's own code
          /habemus\.services\.language\.t\(['"](.+)['"]/g,
        ],
      }))
      .pipe(gulp.dest('src/resources/languages/tmp'));
  })
};
