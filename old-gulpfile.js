const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass')),
      concat = require('gulp-concat'),
      uglify = require('gulp-uglify-es').default,
      browserSync = require('browser-sync').create(),
      autoprefixer = require('gulp-autoprefixer'),
      clean = require('gulp-clean'),
      fonter = require('gulp-fonter'),
      ttf2woff2 = require('gulp-ttf2woff2'),
      notify = require('gulp-notify');

async function styles() {
  return src('app/scss/**/*.scss')
  .pipe(scss({outputStyle: 'compressed'}).on("error", notify.onError()))
	.pipe(concat('style.min.css'))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(dest('app/css'))
	.pipe(browserSync.stream());
  
};

function scripts() {
  return src(['app/js/main.js']) // Always at the end
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/src/*.*')
  .pipe(fonter({
    formats: ['woff', 'ttf']
  }))
  .pipe(src('app/fonts/*.ttf'))
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}

function watching() {
  browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/main.js'], scripts);
  watch(['app/fonts/src'], fonts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
  return src('dist')
    .pipe(clean())
}

function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/fonts/*',
    'app/**/*.html',
    'app/fonts/**/*',
    'app/img/**/*'
    ], {base : 'app'})
    .pipe(dest('dist'))
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.fonts = fonts;
exports.notify = notify;
exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, fonts, watching);