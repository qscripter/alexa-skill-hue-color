var gulp = require('gulp');
//var lambda = require('gulp-awslambda');
var zip    = require('gulp-zip');

var paths = {
  scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
  images: 'client/img/**/*'
};

gulp.task('default', function() {
  return gulp.src([
      'colors.js',
      'fuse.js',
      'lambda.js',
      'properties.js',
      'node_modules/lodash/**/*.*',
      'node_modules/request/**/*.*',
    ], {base: '.'})
        .pipe(zip('archive.zip'))
        //.pipe(lambda(lambda_params, opts))
        .pipe(gulp.dest('.'));
});