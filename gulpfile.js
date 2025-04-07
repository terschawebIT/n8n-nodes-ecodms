const { src, dest } = require('gulp');

function copyIcons() {
  return src('nodes/**/*.svg')
    .pipe(dest('dist/nodes'))
    .pipe(src('credentials/*.svg'))
    .pipe(dest('dist/credentials'));
}

exports['build:icons'] = copyIcons; 