'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var electron = require('electron-connect').server.create();

gulp.task('serve', function () {

    // Start browser process
    electron.start(['--serve']);

    // Restart browser process
    watch('dist-serve/**/*.js', electron.restart);

    // Reload renderer process
    // gulp.watch(['index.js', 'index.html'], electron.reload);
});
