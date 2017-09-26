const gulp = require("gulp");
const ejs = require("gulp-ejs");
const htmlbeautify = require('gulp-html-beautify');
const webpackStream = require('webpack-stream');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const argv = require('yargs').argv;
const postcss = require('gulp-postcss');

const postcssPlugins = require('./postcss.config.js');

process.env.webpackWatch = argv.production;

const options = {
    ejs: {
        glob: './app/templates/*.ejs'
    },
    js: {
        entry:   './app/app.js'
    },
    styles: {
        entry: './app/styles/app.css',
        glob: './app/styles/**/*.css',
    },
    images: {
        glob: './app/images/*'
    },
    icons: {
        glob: './app/icons/*.svg'
    },
    dist: {
        ejs: './assets',
        js: './assets/js',
        styles: './assets/css',
        images: './assets/images',
        icons: './assets/icons'
    },
    production: process.env.webpackWatch
};

gulp.task('ejs', function(){
    return gulp.src(options.ejs.glob)
        .pipe(ejs({}, {}, {ext:'.html'}))
        .pipe(htmlbeautify({indentSize: 4}))
        .pipe(gulp.dest(options.dist.ejs))
});

gulp.task('ejs:watch', function () {
    gulp.watch(options.ejs.glob, ['ejs']);
});

gulp.task('images', function () {
    return gulp.src(options.images.glob)
        .pipe(gulp.dest(options.dist.images))
});

gulp.task('images:minify', function () {
    return gulp.src(options.images.glob)
        .pipe(imagemin())
        .pipe(gulp.dest(options.dist.images))
});

gulp.task('icons', function () {
    return gulp.src(options.icons.glob)
        .pipe(svgSprite({
            mode				: {
                symbol			: true		// Activate the «symbol» mode
            }
        }))
        .pipe(gulp.dest(options.dist.icons))
});

gulp.task('webpack', function() {
    process.env.webpackWatch = false;

    return gulp.src(options.js.entry)
        .pipe(webpackStream( require('./webpack.config.js') ))
        .pipe(gulp.dest(options.dist.js));
});

gulp.task('styles', function () {
    return gulp.src(options.styles.entry)
        .pipe(postcss(postcssPlugins))
        .pipe(gulp.dest(options.dist.styles));
});

gulp.task('styles:watch', function () {
    gulp.watch(options.styles.glob, ['styles']);
});

gulp.task('webpack:watch', function() {
    process.env.webpackWatch = true;

    return gulp.src(options.js.entry)
        .pipe(webpackStream( require('./webpack.config.js') ))
        .pipe(gulp.dest(options.dist.js));
});

gulp.task('build:watch', ['ejs:watch', 'webpack:watch']);

gulp.task('build', ['ejs', 'styles', 'webpack', 'images']);

gulp.task('default', ['build']);