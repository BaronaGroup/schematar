import gulp from 'gulp'
// @ts-ignore
import gulpClean from 'gulp-clean'
import gulpTS from 'gulp-typescript'

const tsProject = gulpTS.createProject('tsconfig.json')

function clean() {
  return gulp.src('dist/*', {read: false})
    .pipe(gulpClean())
}

function ts() {
  return gulp.src('src/*')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
}

export default gulp.series(clean, ts)
