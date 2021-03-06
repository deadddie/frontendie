'use strict';

var gulp = require('gulp'), //основной плагин gulp
    purify = require('gulp-purifycss'), //удаление дублей и неиспользуемых css-свойств
    sass = require('gulp-sass'), //sass
    uglify = require('gulp-uglify'), //минификация js
    jshint = require('gulp-jshint'), //отслеживание ошибкок в js
    jade = require('gulp-jade'), //шаблониатор jade
    rigger = require('gulp-rigger'), //работа с инклюдами в html и js
    htmlmin = require('gulp-htmlmin'), //минификация html
    prettify = require('gulp-jsbeautifier'), //бьютифайер
    imagemin = require('gulp-imagemin'), //минимизация изображений
    //spritesmith = require("gulp.spritesmith"), //объединение картинок в спрайты
    rimraf = require('rimraf'), //очистка
    sourcemaps = require('gulp-sourcemaps'), //sourcemaps
    rename = require('gulp-rename'), //переименование файлов
    plumber = require('gulp-plumber'), //предохранитель для остановки гальпа
    watch = require('gulp-watch'), //расширение возможностей watch
    connect = require('gulp-connect'), //livereload
    postcss = require('gulp-postcss'), //postcss (ядро)
    cssnext = require('postcss-cssnext'), //autoprefixer и пр.
    cssnano = require('gulp-cssnano'); //сжимаем css

// постпроцессоры для css
var processors = [
    cssnext
];

// постпроцессоры для вендорного css
var processorsVendor = [
    cssnext
];

var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        imgIcons: 'build/icons',
        img: 'build/css/images/',
        fonts: 'build/fonts/',
        htaccess: 'build/',
        supply: 'build/',
        contentImg: 'build/img/',
        sprites: 'src/css/images/',
        spritesCss: 'src/css/partial/'
    },
    src: { //Пути откуда брать исходники
        html: 'src/*.html', //Взять все файлы с расширением .html
        jade: 'src/*.jade', //Взять все файлы с расширением .jade
        jsVendor: 'src/js/vendor/*.*',
        js: 'src/js/[^_]*.js',//В стилях и скриптах нам понадобятся только main файлы
        jshint: 'src/js/*.js',
        css: 'src/css/styles.scss',
        cssVendor: 'src/css/vendor/*.*', //Если мы хотим файлы библиотек отдельно хранить то раскоментить строчку
        img: 'src/css/images/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        imgIcons: 'src/icons/*.*',
        fonts: 'src/fonts/**/*.*',
        contentImg: 'src/img/**/*.*',
        sprites: 'src/css/sprites/*.png',
        htaccess: 'src/.htaccess',
        supply: 'src/supply/*.*' //Дополнительные файлы: favicon.ico, robots.txt, sitemap.xml...
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'src/*.html',
        jade: 'src/*.jade',
        js: 'src/js/**/*.js',
        css: 'src/css/**/*.*',
        imgIcons: 'src/icons/*.*',
        img: 'src/css/images/**/*.*',
        contentImg: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*',
        htaccess: 'src/.htaccess',
        sprites: 'src/css/sprites/*.png'
    },
    clean: './build', //директории которые могут очищаться
    outputDir: './build' //исходная корневая директория для запуска минисервера
};

// Локальный сервер для разработки
gulp.task('connect', function(){
    connect.server({ //настриваем конфиги сервера
        root: [path.outputDir], //корневая директория запуска сервера
        port: 9999, //какой порт будем использовать
        livereload: true //инициализируем работу LiveReload
    });
});

// таск для билдинга html
gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(prettify({indent_size: 2})) //Сделаем красивое форматирование
        .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
        .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
    gulp.src(path.src.jade) //Выберем файлы по нужному пути
        .pipe(jade()) //Создадим html из jade
        .pipe(prettify({indent_size: 2})) //Сделаем красивое форматирование
        .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
        .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
});

// таск для билдинга html для продакшена
gulp.task('htmlProd:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(prettify({indent_size: 2})) //Сделаем красивое форматирование
        //.pipe(htmlmin({collapseWhitespace: true})) //Сожмем (закомментируйте, если не нужно сжимать html)
        .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
        .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(jade()) //Создадим html из jade
        .pipe(prettify({indent_size: 2})) //Сделаем красивое форматирование
        //.pipe(htmlmin({collapseWhitespace: true})) //Сожмем (закомментируйте, если не нужно сжимать html)
        .pipe(gulp.dest(path.build.html)) //выгрузим их в папку build
        .pipe(connect.reload()); //И перезагрузим наш сервер для обновлений
});

gulp.task('jshint:build', function() {
  return gulp.src(path.src.jshint)
    .pipe(jshint({expr: true}))
    .pipe(jshint.reporter('jshint-stylish'));
});

// билдинг вендорного css
gulp.task('jsVendor:build', function () {
    gulp.src(path.src.jsVendor) // Берем папку vendor
        .pipe(uglify()) //Сожмем
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.build.js)) //выгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});

// билдинг яваскрипта
gulp.task('js:build', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        //.pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write('.')) //Пропишем карты
        .pipe(rename({suffix: '.min'})) //добавим суффикс .min к выходному файлу
        .pipe(gulp.dest(path.build.js)) //выгрузим готовый файл в build
        .pipe(connect.reload()); //И перезагрузим сервер
});

// билдим спрайты
// gulp.task('sprites:build', function () {
//     var spriteData =
//         gulp.src(path.src.sprites) //выберем откуда брать изображения для объединения в спрайт
//             .pipe(spritesmith({
//                 imgName: 'sprite.png', //имя спрайтового изображения
//                 cssName: 'sprite.scss', //имя стиля где храним позиции изображений в спрайте
//                 imgPath: 'images/sprite.png', //путь где лежит спрайт
//                 cssFormat: 'scss', //формат в котором обрабатываем позиции
//                 cssTemplate: 'scss.template.mustache', //файл маски
//                 cssVarMap: function(sprite) {
//                     sprite.name = 's-' + sprite.name //имя каждого спрайта будет состоять из имени файла и конструкции 's-' в начале имени
//                 }
//             }));
//     spriteData.img.pipe(gulp.dest(path.build.sprites)); // путь, куда сохраняем картинку
//     spriteData.css.pipe(gulp.dest(path.build.spritesCss)); // путь, куда сохраняем стили
// });

// билдим статичные изображения
gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{removeViewBox: false}], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest(path.build.img)) //выгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});

// билдим статичные изображения (иконки)
gulp.task('imageIcons:build', function () {
    gulp.src(path.src.imgIcons) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{removeViewBox: false}], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest(path.build.imgIcons)) //выгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});


// билдим динамичные изображения
gulp.task('imagescontent:build', function() {
    gulp.src(path.src.contentImg)
        .pipe(imagemin({ //Сожмем их
            progressive: true, //сжатие .jpg
            svgoPlugins: [{removeViewBox: false}], //сжатие .svg
            interlaced: true, //сжатие .gif
            optimizationLevel: 3 //степень сжатия от 0 до 7
        }))
        .pipe(gulp.dest(path.build.contentImg)) //выгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});

// билдинг пользовательского css
gulp.task('cssOwn:build', function () {
    gulp.src(path.src.css) //выберем наш основной файл стилей
        .pipe(plumber())
        .pipe(sourcemaps.init()) //инициализируем soucemap
        .pipe(sass({
          'include css': true
        })) //Скомпилируем scss
        .pipe(postcss(processors)) //обработаем postcss
        .pipe(purify(['./'+path.build.html+'/**/*.html', './'+path.build.js+'/**/*.js'])) //оптимизируем css
        .pipe(cssnano()) //сожмем
        .pipe(rename({suffix: '.min', extname: ".css"})) //добавим суффикс .min к имени выходного файла
        .pipe(sourcemaps.write('.')) //пропишем sourcemap
        .pipe(gulp.dest(path.build.css)) //вызгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});

// билдинг вендорного css
gulp.task('cssVendor:build', function () {
    gulp.src(path.src.cssVendor) // берем папку vendor
        .pipe(plumber())
        .pipe(sourcemaps.init()) //инициализируем soucemap
        .pipe(sass({
          'include css': true
        })) //Скомпилируем scss
        .pipe(postcss(processorsVendor)) //обработаем postcss
        .pipe(cssnano()) //сожмем
        .pipe(sourcemaps.write('.')) //пропишем sourcemap
        .pipe(gulp.dest(path.build.css)) //выгрузим в build
        .pipe(connect.reload()); //перезагрузим сервер
});

// билдим css целиком
gulp.task('css:build', [
    'cssOwn:build',
    'cssVendor:build'
]);

// билдим шрифты
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)); //выгружаем в build
});

// билдим htaccess
gulp.task('htaccess:build', function() {
    gulp.src(path.src.htaccess)
        .pipe(gulp.dest(path.build.htaccess)); //выгружаем в build
});

// билдим дополнительные файлы
gulp.task('supply:build', function() {
    gulp.src(path.src.supply)
        .pipe(gulp.dest(path.build.supply)); //выгружаем в build
});

// билдим все
gulp.task('build', [
    'html:build',
    'jshint:build',
    'jsVendor:build',
    'js:build',
    //'sprites:build',
    'css:build',
    'fonts:build',
    'htaccess:build',
    'image:build',
    'imageIcons:build',
    'imagescontent:build'
]);

// билдим все для продакшена
gulp.task('build-prod', [
    'htmlProd:build',
    'jshint:build',
    'jsVendor:build',
    'js:build',
    //'sprites:build',
    'css:build',
    'fonts:build',
    'htaccess:build',
    'supply:build',
    'image:build',
    'imageIcons:build',
    'imagescontent:build'
]);

// чистим папку билда
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// watch
gulp.task('watch', function(){
     //билдим html в случае изменения
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
     //билдим спрайты в случае изменения
    // watch([path.watch.sprites], function(event, cb) {
    //     gulp.start('sprites:build');
    // });
     //билдим контекстные изрображения в случае изменения
    watch([path.watch.imgIcons], function(event, cb) {
        gulp.start('imgIcons:build');
    });
    watch([path.watch.contentImg], function(event, cb) {
        gulp.start('imagescontent:build');
    });
     //билдим css в случае изменения
    watch([path.watch.css], function(event, cb) {
        gulp.start('css:build');
    });
     //проверяем js в случае изменения
    watch([path.watch.js], ['jshint']);
     //билдим js в случае изменения
    watch([path.watch.js], function(event, cb) {
        gulp.start('jsVendor:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
     //билдим статичные изображения в случае изменения
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
     //билдим шрифты в случае изменения
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
     //билдим htaccess в случае изменения
    watch([path.watch.htaccess], function(event, cb) {
        gulp.start('htaccess:build');
    });
});

// действия по умолчанию
gulp.task('default', ['build', 'watch', 'connect']);
