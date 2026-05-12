import pkg from 'gulp';
const { src, dest, watch, parallel, series } = pkg;

// import dartSass from 'sass';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const scss = gulpSass(dartSass);

import concat from 'gulp-concat';
import uglifyES from 'gulp-uglify-es';
const uglify = uglifyES.default;

import browserSync from 'browser-sync';
const bs = browserSync.create();

import autoprefixer from 'gulp-autoprefixer';
// import clean from 'gulp-clean';
// import fonter from 'gulp-fonter';
// import ttf2woff2 from 'gulp-ttf2woff2';
import notify from 'gulp-notify';

import del from 'del';

export async function styles() {
  return src('app/scss/**/*.scss')
    .pipe(scss({ style: 'compressed' }).on("error", notify.onError()))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 15 versions'] }))
    .pipe(dest('app/css'))
    .pipe(bs.stream());
}


export function scripts() {
  return src(['node_modules/swiper/swiper-bundle.js','app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(bs.stream());
}

// export function fonts() {
//   return src('app/fonts/src/*.*')
//     .pipe(fonter({
//       formats: ['woff', 'ttf']
//     }))
//     .pipe(dest('app/fonts')) // промежуточная папка
//     .pipe(src('app/fonts/*.ttf'))
//     .pipe(ttf2woff2())
//     .pipe(dest('app/fonts'));
// }

// export function fonts() {
//   return src('app/fonts/src/**/*')
//     // .pipe(fonter({
//     //   formats: ['woff', 'ttf']
//     // }))
//     // .pipe(dest('app/fonts')) // промежуточная папка
//     // .pipe(src('app/fonts/*.ttf'))
//     .pipe(ttf2woff2())
//     .pipe(dest('app/fonts'));
// }

export function watching() {
  bs.init({
    server: {
      baseDir: "app/"
    
    }
  });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/main.js'], scripts);
  // watch(['app/fonts/src'], fonts);
  watch(['app/*.html']).on('change', bs.reload);
}

// export function cleanDist() {
//   return src(['dist/**/*',       // Выбираем всё содержимое dist
//               '!dist/.git',      // Исключаем саму папку .git
//               '!dist/.git/**'], { read: false, allowEmpty: true })
//     .pipe(clean());
// }

export function delDist() {
  return del(['dist/**/*',       // Выбираем всё содержимое dist
              '!dist/.git',      // Исключаем саму папку .git
              '!dist/.git/**']);
    // .pipe(clean());
}

export function building() {
  return src([
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/fonts/**/*',
    'app/**/*.html',
    'app/img/**/*'
  ], { base: 'app',
       encoding: false // Критично для корректного переноса картинок и шрифтов
  })
    .pipe(dest('dist'));
}

// Экспорт задач
export const build = series(delDist, parallel(styles, scripts), building);
export default parallel(styles, scripts, watching);
