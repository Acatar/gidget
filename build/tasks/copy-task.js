module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-copy');

    // Update the grunt config
    grunt.config.set('copy', {
        js: {
            files: [
                { src: ['../release/gidget.js'], dest: '../examples/node-example/public/scripts/lib/gidget/gidget.js', filter: 'isFile' },
                { src: ['../release/gidget.min.js'], dest: '../examples/node-example/public/scripts/lib/gidget/gidget.min.js', filter: 'isFile' }
                // { src: ['../dist/gidget.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.js', filter: 'isFile' },
                // { src: ['../dist/gidget.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.min.js', filter: 'isFile' },
                // { src: ['../dist/gidget.bootstrappers.sammy.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.sammy.js', filter: 'isFile' },
                // { src: ['../dist/gidget.bootstrappers.sammy.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.sammy.min.js', filter: 'isFile' }
                //,{ src: ['../release/gidget.bootstrappers.simrou.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.simrou.js', filter: 'isFile' },
                //,{ src: ['../release/gidget.bootstrappers.simrou.min.js'], dest: '../examples/node-web-sammy/public/scripts/lib/gidget/gidget.bootstrappers.simrou.min.js', filter: 'isFile' }
            ]
        }
    });
};
