/*jshint camelcase: false*/
module.exports = function (grunt) {
    'use strict';

    var gidgetFiles;

    grunt.loadNpmTasks('grunt-contrib-uglify'); // node

    gidgetFiles = [
        '../src/blueprints/IGidget.js',
        '../src/blueprints/IGidgetApp.js',
        '../src/blueprints/IGidgetModule.js',
        '../src/blueprints/IGidgetRoute.js',
        '../src/blueprints/IRouteEngine.js',
        '../src/blueprints/IRouteEngineBootstrapper.js',

        '../src/locale/en_US.js',

        '../src/argumentValidator.js',
        '../src/ExceptionHandler.js',
        '../src/GidgetApp.js',
        '../src/GidgetModule.js',
        '../src/GidgetRoute.js',
        '../src/RouteEngine.js',
        '../src/RouteEngineBoostrapper.js',
        '../src/Gidget.js'
    ];

    // Update the grunt config
    grunt.config.set('uglify', {
        debug: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                beautify: true,
                mangle: false,
                compress: false,
                sourceMap: false,
                drop_console: false,
                preserveComments: 'some'
            },
            files: {
                '../release/gidget.js': gidgetFiles,
                // '../release/gidget.bootstrappers.sammy.js': ['../src/bootstrappers.sammy.js']
                //,'../release/bootstrappers.simrou.js': ['../src/gidget.bootstrappers.simrou.js']
            }
        },
        release: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
//                    mangle: true,
//                    compress: true,
//                    sourceMap: true,
//                    drop_console: true
            },
            files: {
                '../release/gidget.min.js': gidgetFiles,
                // '../release/gidget.bootstrappers.sammy.min.js': ['../src/bootstrappers.sammy.js']
                //,'../release/bootstrappers.simrou.min.js': ['../src/gidget.bootstrappers.simrou.js']
            }
        }
    });
};
