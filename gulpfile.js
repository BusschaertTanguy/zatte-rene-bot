const { src, dest } = require('gulp');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

exports.default = function() {
	return src('index.js')
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(dest('dist/'));
};