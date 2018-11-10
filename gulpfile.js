var gulp = require('gulp');
var browserify = require("gulp-browserify");

// Static Server + watching scss/html files
gulp.task('serve', function() {

    gulp.watch("htdocs/js/*.js", ['browserify']);
});

// Compile the scripts file using babel.
gulp.task('browserify', function () {
    gulp.src('htdocs/js/scripts.js')
    .pipe(browserify({
        insertGlobals : true,
        debug : !gulp.env.production
    }))
    .pipe(gulp.dest('htdocs/js/min'))
});

gulp.task('default', ['serve']);