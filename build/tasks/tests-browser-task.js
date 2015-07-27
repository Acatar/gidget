/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-mocha'); // browser
    grunt.loadNpmTasks('grunt-karma');

    // Update the grunt config
    grunt.config.set('karma', {
        options: {
            // see http://karma-runner.github.io/0.8/config/configuration-file.html
            basePath: '../',
            frameworks: ['mocha', 'chai'],
            files: [
                'test/browser/bower_components/jquery/dist/jquery.min.js',
                'test/browser/bower_components/hilary/release/hilary.min.js',
                'test/browser/test.setup.js',
                // gidget
                'release/gidget.min.js',
                'release/gidget.bootstrappers.sammy.min.js',
                // specs
                { pattern: 'test/browser/*.fixture.js', included: true, served: true },
                // runner
                'test/browser/test.js'
            ],
            reporters: ['nyan'],
            reportSlowerThan: 2000,
            singleRun: true
        },
        // developer testing mode
        unit_osx: {
            browsers: ['Chrome', 'Firefox', 'Safari']
        },
        debug_osx: {
            browsers: ['Chrome'],
            singleRun: false
        },
        unit_windows: {
            browsers: ['Chrome', 'Firefox', 'IE']
        },
        debug_windows: {
            browsers: ['Chrome'],
            singleRun: false
        },
        //continuous integration mode: run tests once in PhantomJS browser.
        continuous: {
            singleRun: true,
            browsers: ['PhantomJS']
        }
    });
};
