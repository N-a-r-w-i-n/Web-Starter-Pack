// Requirement packages

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    autoPrefixer = require('gulp-autoprefixer'),
    MinifyCss = require('gulp-clean-css'),
    htmlMinify = require('gulp-htmlmin'),
    sourceMap = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    uglifyJS = require('gulp-uglify'),
    imagemin = require('gulp-imagemin');

var config = {
    imgSRC: './src/assets/images/*',
    imgDEST: './dist/assets/images',
    sassSRC: './src/assets/sass/*.sass',
    sassDEST: './dist/assets/sass',
    jsSRC: './src/assets/javascripts/*.js',
    jsDEST: './src/assets/javascripts',
    jsDEST2: './dist/assets/javascripts',
    cssSRC: './src/assets/stylesheets/*.css',
    cssDEST: './src/assets/stylesheets',
    cssDEST2: './dist/assets/stylesheets',
    htmlSRC: './src/*.html',
    htmlDEST: './dist',
}

// Performing taks like compiling sass, auto prefixing, sourcemap writting, minifying css, minifying images, reloading broswer tab...

gulp.task('performActions', function() {
    gulp.src(config.sassSRC)
        .pipe(plumber())
        .pipe(sourceMap.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoPrefixer({
            browsers: ['last 4 versions'],
            cascade: false
        }))
        .pipe(gulp.dest(config.cssDEST))
        .pipe(gulp.dest(config.cssDEST2))
        .pipe(MinifyCss({
            compatibility: 'ie8'
        }))
        .pipe(sourceMap.write())
        .pipe(rename({
            suffix: '.min',
            extname: ".css"
        }))
        .pipe(gulp.dest(config.cssDEST))
        .pipe(gulp.dest(config.cssDEST2))
    gulp.src(config.htmlSRC)
        .pipe(plumber())
        .pipe(htmlMinify({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(config.htmlDEST))
    gulp.src(config.imgSRC)
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.jpegtran({
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(gulp.dest(config.imgDEST))
    gulp.src(config.sassSRC)
        .pipe(plumber())
        .pipe(gulp.dest(config.sassDEST))
        .pipe(browserSync.stream());


});

// Minifying JS 

gulp.task('uglify', function() {
    gulp.src([config.jsSRC, '!src/assets/javascripts/*.min.js'])
        .pipe(plumber())
        .pipe(gulp.dest(config.jsDEST2, {
            overwrite: true
        }))
        .pipe(uglifyJS())
        .pipe(rename(function(path) {
            path.extname = ".min.js";
        }))
        .pipe(gulp.dest(config.jsDEST, {
            overwrite: true
        }))
        .pipe(gulp.dest(config.jsDEST2, {
            overwrite: true
        }));

});

// Browser Initialize.
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist/",
            files: [config.cssSRC, config.jsSRC]
        },
        // Reload the same opened tab.
        open: "local"
    })
});

// Task Watch.

gulp.task('watch', ['browser-sync', 'performActions', 'uglify'], function() {

    gulp.watch([config.sassSRC], ['performActions']);

    gulp.watch(config.jsSRC, ['js-watch']);

    gulp.watch("./src/*.html").on('change', browserSync.reload);

});

// Watch JS files.

gulp.task('js-watch', ['uglify'], function(done) {
    browserSync.reload();
    done();
});

// Default task.

gulp.task('default', ['watch']);