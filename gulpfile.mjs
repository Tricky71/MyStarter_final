import pkg from 'gulp';
const { src, dest, watch, parallel, series } = pkg;

import changed from 'gulp-changed';

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
import fonter from 'gulp-fonter';
import ttf2woff2 from 'gulp-ttf2woff2';
import notify from 'gulp-notify';

// import del from 'del';

import { deleteAsync } from 'del'

import webp from 'gulp-webp';

import imagemin, { mozjpeg, optipng } from 'gulp-imagemin';

// Пути к файлам
const paths = {
    src: 'app/img/src/**/*.{jpg,jpeg,png}', // Исходные картинки
    dest: 'app/img/'                   // Папка назначения
};

//Обработка изображений
// 1. Таск для сжатия оригиналов (сверяет JPG/PNG с папкой назначения)
export const compressPngJpg = () => {
    return src(paths.src, { base: 'app/img/src', encoding: false })
        .pipe(changed(paths.dest)) // Пропускает уже сжатые JPG/PNG
        .pipe(imagemin([
            mozjpeg({ quality: 80, progressive: true }),
            optipng({ optimizationLevel: 5 })
        ]))
        .pipe(dest(paths.dest))
        .pipe(bs.stream());
};

// 2. Таск для создания WebP (сверяет исходники с расширением .webp в папке назначения)
export const convertToWebp = () => {
    return src(paths.src, { base: 'app/img/src', encoding: false })
        .pipe(changed(paths.dest, { extension: '.webp' })) // Пропускает уже созданные .webp
        .pipe(webp({ quality: 75 }))
        .pipe(dest(paths.dest))
        .pipe(bs.stream());
};

// 3. Объединяем их в один общий таск для удобства
export const processImages = parallel(compressPngJpg, convertToWebp);

// export const processImages = () => {
//     return src(paths.src, { base: 'app/img/src', encoding: false })
//         .pipe(changed(paths.dest)) // Пропускает уже сжатые JPG/PNG
//         // 1. Сжимаем исходные JPG/PNG перед конвертацией
//         .pipe(imagemin([
//             mozjpeg({ quality: 80, progressive: true }),
//             optipng({ optimizationLevel: 5 })
//         ]))
//         // 2. Сохраняем сжатые оригиналы (JPG/PNG) в папку назначения
//         .pipe(dest(paths.dest))
//         .pipe(bs.stream())
//         // 3. Конвертируем в WebP со сжатием качества
//         .pipe(webp({
//             quality: 75 // Коэффициент качества WebP (0-100)
//         }))
//         // 4. Сохраняем готовые файлы
//         .pipe(dest(paths.dest));
// };

export async function styles() {
  return src('app/scss/**/*.scss')
    .pipe(scss({ style: 'compressed', sourceMap: false  }).on("error", notify.onError()))
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

export function fonts() {
  return src('app/fonts/src/**/*.ttf') // Берем исходные TTF
    .pipe(ttf2woff2())                 // Переводим в самый современный WOFF2
    .pipe(dest('app/fonts'));          // Складываем готовый результат
}

export function watching() {
  bs.init({
    server: {
      baseDir: "app/"
    
    }
  });
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/main.js'], scripts);
  watch(['app/fonts/src'], fonts);
  watch(['app/img/src/**/*.{jpg,jpeg,png}'], processImages);
  watch(['app/*.html']).on('change', bs.reload);
}

// export function cleanDist() {
//   return src(['dist/**/*',       // Выбираем всё содержимое dist
//               '!dist/.git',      // Исключаем саму папку .git
//               '!dist/.git/**'], { read: false, allowEmpty: true })
//     .pipe(clean());
// }

export function delDist() {
  return deleteAsync(['dist/**/*',       // Выбираем всё содержимое dist
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
// export default gulp.series(processImages);
export const build = series(delDist, parallel(styles, scripts), building);
export default parallel(styles, scripts, watching);
