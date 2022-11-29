const { src, dest, watch } = require('gulp');
function defaultTask() {
    return src('src/**/*')
        .pipe(dest('dist/'));
}

function start() {
    defaultTask()
    watch('src/*', defaultTask)
}

exports.default = defaultTask

exports.start = start