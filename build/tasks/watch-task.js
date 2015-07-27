module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-watch');

    // Update the grunt config
    grunt.config.set('watch', {
        js: {
            files: '../src/**/*.js',
            tasks: ['mocha', 'uglify:debug', 'uglify:release', 'copy:js'],
            options: { nospawn: true, livereload: true, debounceDelay: 250 }
        }
    });
};
