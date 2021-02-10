const gulp = require('gulp');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const modernizr = require('gulp-modernizr');
const del = require('del');
const changed = require('gulp-changed');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const sequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');
const reload = browserSync.reload;
const paths = require('./paths');
const fs = require('fs');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');

var onError = function (err) {
	notify.onError({
		title: "Error!",
		message: "<%= error.message %>",
		sound: "Frog"
	})(err);
	this.emit('end');
};

global.production = false;

function showErrors(err) {
	console.log(err.toString())
	this.emit('end')
}

// Cache Smash
// Set the cache smash number used to force css and js file reload on updates
/////////////////////////
function writeCacheSmash() {
	var timestamp = Math.round((new Date()).getTime());
	fs.writeFileSync('src/_partials/cache-smash.php', timestamp);
}

// Browsersync config
/////////////////////////
const config = {
	browserSync: {
		notify: false,
		// Use the "server" option to browserSync an HTML site
		//  server: {
		//    baseDir: 'public/'
		//  }
		// ..or use the "proxy" option to serve up a PHP site
		proxy: 'example.local'
	},
	expressServer: {
		notify: false,
		proxy: 'localhost:3000',
		port: 3000
	}
};

// Styles
/////////////////////////
gulp.task('styles', () => {

	return gulp.src(`${paths.styles.src}/*.scss`)
		.pipe(gulpif(!global.production, sourcemaps.init()))
		.pipe(sass())
		.on('error', showErrors)
		.pipe(autoprefixer(['last 2 versions', '> 5%'], {
			cascade: true
		}))
		.pipe(gulpif(!global.production, sourcemaps.write('maps')))
		.pipe(gulpif(global.production, cleancss()))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream({
			match: '**/*.css'
		}))
		.on('end', writeCacheSmash);
});


// Scripts
/////////////////////////
gulp.task('scripts', () => {
	gulp.src(paths.scripts.files)
		.pipe(plumber({ errorHandler: onError }))
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(gulpif(global.production, uglify({})))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest(paths.scripts.dest))
		.on('end', writeCacheSmash);
});


// vendor
/////////////////////////
gulp.task('vendor', () => {
	return gulp.src(paths.vendor)
		.pipe(concat('vendor.min.js'))
		.pipe(gulpif(global.production, uglify({})))
		.pipe(gulp.dest(paths.scripts.dest));
});


// Clean
/////////////////////////
gulp.task('clean', () => {
	del(`${paths.root.dest}`);
	del(`${paths.styles.dest}/maps`);
	del(`${paths.scripts.dest}/maps`);
});


// Images
/////////////////////////
gulp.task('images', () => {
	return gulp.src(`${paths.images.src}/**/*.{${paths.images.ext}}`)
		.pipe(imagemin({
			progressive: true,
			interlaced: true,
			multipass: true,
			svgovendor: [{
				cleanupListOfValues: {
					floatPrecision: 2
				}
			},
			{
				cleanupNumericValues: {
					floatPrecision: 2
				}
			},
			{
				convertPathData: {
					floatPrecision: 2
				}
			}
			]
		}))
		.pipe(changed(paths.images.dest)) // Ignore unchanged files
		.pipe(gulp.dest(paths.images.dest));
});


// Font files
/////////////////////////
gulp.task('fonts', () => {
	return gulp.src(`${paths.fonts.src}/**/*.{${paths.fonts.ext}}`)
		.pipe(gulp.dest(paths.fonts.dest));
});


// Copy files
/////////////////////////
gulp.task("copy", function () {
	return gulp.src([
		"src/*.{php,png,css}",
		"src/_components/*.php",
		"src/_modules/*.php",
		"src/_partials/*.php",
		"src/_assets/*.{php,svg,png,jpg,mp4}",
		"src/images/*",
		"src/fonts/*",
		"src/js/main.js",
		"src/js/main.min.js",
		"src/js/vendor.min.js",
		"src/css/main.css",
	], {
		base: paths.root.src
	})
		.pipe(gulp.dest(paths.root.dest));
});

// Watch
/////////////////////////
function watchMe() {
	gulp.watch(`${paths.styles.src}/**/*.scss`, ['styles']);
	gulp.watch(`${paths.scripts.src}/**/*.js`, ['scripts']);
	gulp.watch(`${paths.images.src}/**/*.{${paths.images.ext}}`, ['images']);
	gulp.watch([
		`${paths.scripts.dest}/main.js`,
		`${paths.templates.src}/**/*.php`,
		`${paths.templates.src}/*.php`
	]).on('change', reload);
}

gulp.task('default', () => {
	browserSync.init(config.browserSync);
	watchMe();
});


// Express + Nodemon + Browsersync
/////////////////////////
gulp.task('nodemon', (cb) => {
	var started = false;
	return nodemon({
		script: `${paths.root.dest}/index.js`,
		ignore: `**/*`
	}).on('start', function () {
		if (!started) {
			cb();
			started = true;
		}
	});
});

gulp.task('quick-server', ['nodemon'], () => {
	browserSync.init(config.expressServer);
	watchMe();
});


// Build
/////////////////////////
gulp.task('build', () => {
	global.production = true;
	sequence(['clean'], ['styles', 'scripts', 'vendor'], ['images'], ['copy']);
});