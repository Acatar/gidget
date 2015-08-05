module.exports = function (grunt) {
    'use strict';

    var os;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
    });

    grunt.loadTasks('tasks');

    // arguments
    os = grunt.option('os') || 'osx';

    // Default task(s).
    grunt.registerTask('default', ['uglify:debug', 'uglify:release', 'karma:unit_' + os, 'copy:js']);
    grunt.registerTask('mon', ['watch']);
    grunt.registerTask('build', ['uglify:debug', 'uglify:release', 'copy:js']);

    grunt.registerTask('test', ['uglify:debug', 'uglify:release', 'karma:unit_' + os]);
    grunt.registerTask('debug', ['debug-browser']);
    grunt.registerTask('debug-browser', ['uglify:debug', 'uglify:release', 'karma:debug_' + os]);

};
