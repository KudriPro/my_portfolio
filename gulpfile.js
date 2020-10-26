const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const rename = require("gulp-rename");
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
// const webp = require('gulp-webp');
//Спрайт для svg
const svgstore = require("gulp-svgstore");
const del = require('del');
const sync = require("browser-sync").create();
const ghpages = require("gulp-gh-pages");

// Styles
const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// html
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build/"))
    .pipe(sync.stream());
};
exports.html = html;

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Images
const image = () => {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.mozjpeg({ progressive: true }),
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
}
exports.image = image;

// Webp image
const webp_image = () => {
  return gulp
    .src('source/img/*.{png,jpg}')
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('source/img'))
};
exports.webp_image = webp_image;

// sprites
const sprite = () => {
  return gulp
    .src("source/img/**/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/icons"));
}
exports.sprite = sprite;

// clean
const clean = () => {
  return del("build");
}
exports.clean = clean;

// Deploy
gulp.task('deploy', function () {
  return gulp.src('./build/**/*')
    .pipe(ghpages());
});
// ghpages.publish("build");

// Copy
const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Watcher
const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", gulp.series("html"));
  // gulp.watch("source/js/*.js").on("change", gulp.series("js", "reboot"));
  // gulp.watch("source/img/**/*.{jpg,png}", gulp.series(clean, copy, refresh));
}

//build
exports.build = gulp.series(
  clean, copy, sprite, styles, html, server, watcher
);
//Start
exports.start = gulp.series(
  styles, server, watcher
);
