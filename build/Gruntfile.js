/*globals module*/
module.exports = function (grunt) {
    "use strict";
    
    var gidgetFiles = [
        '../src/implementr.js',
        '../src/exceptions.js',
        '../src/locales/en_US.js',
        '../src/IGidgetModule.js',
        '../src/GidgetModule.js',
        '../src/IRouteEngine.js',
        '../src/RouteEngine.js',
        '../src/IGidgetApp.js',
        '../src/GidgetApp.js',
        '../src/GidgetApp.js',
        '../src/GidgetCtor.js',
        '../src/IOptions.js',
        '../src/Gidget.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /**
            Watch the JS and LESS folders for changes. Triggering
            fires off the listed tasks
        **/
        watch: {
            js: {
                files: '../src/**/*.js',
                tasks: ['mocha', 'uglify:debug', 'uglify:release', 'copy:js'],
                options: { nospawn: true, livereload: true, debounceDelay: 250 }
            }
        },
        /**
            Used for production mode, minify and uglyfy the JavaScript Output
        **/
        uglify: {
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
                    '../release/bootstrappers.sammy.js': ['../src/gidget.bootstrappers.sammy.js']
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
                    '../release/bootstrappers.sammy.min.js': ['../src/gidget.bootstrappers.sammy.js']
                    //,'../release/bootstrappers.simrou.min.js': ['../src/gidget.bootstrappers.simrou.js']
                }
            }
        },
        mocha: {
            release: {
                options: {
                    reporter: 'Nyan', //'Spec',
                    run: true
                },
                src: ['../test/browser/tests.html', '../test/browser/tests.bootstrappers.sammy.html']
            }
        },
        copy: {
            js: {
                files: [
                    { src: ['../release/gidget.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.js', filter: 'isFile' },
                    { src: ['../release/gidget.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.min.js', filter: 'isFile' },
                    { src: ['../release/gidget.bootstrappers.sammy.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.sammy.js', filter: 'isFile' },
                    { src: ['../release/gidget.bootstrappers.sammy.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.sammy.min.js', filter: 'isFile' }
                    //,{ src: ['../release/gidget.bootstrappers.simrou.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.simrou.js', filter: 'isFile' },
                    //,{ src: ['../release/gidget.bootstrappers.simrou.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.simrou.min.js', filter: 'isFile' }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // Default task(s).
    grunt.registerTask('default', ['mocha', 'uglify:debug', 'uglify:release', 'copy:js']);
    grunt.registerTask('mon', ['watch']);
    grunt.registerTask('force', ['uglify:debug', 'uglify:release', 'copy:js']);

};

