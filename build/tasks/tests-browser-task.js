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
                'tests/browser/bower_components/jquery/dist/jquery.min.js',
                'tests/browser/bower_components/hilary/release/hilary.js',
                // gidget
                'release/gidget.min.js',
                // 'release/gidget.bootstrappers.sammy.min.js',
                // specs
                { pattern: 'tests/browser/*.fixture.js', included: true, served: true },
                // runner
                'tests/browser/test.js'
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
        unit_headless: {
            singleRun: true,
            browsers: ['PhantomJS']
        }
    });
};
