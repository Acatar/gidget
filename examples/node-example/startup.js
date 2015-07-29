'use strict';

// All app variables are defined in start and compose.
// By isolating the app's requirements into the start and compose functions,
// The entire app can be restarted from within, to react to failure, and to
// get into a clean running state when associated services recover from failure.
var scope, compose, composeExpress, configureRoutes, configureApplicationLifecycle, start;

/*
// Orchestrates composition of the application dependency graph
*/
compose = function () {
    // perform composition tasks (register modules here)
    var exceptions;

    // example
    scope.register({ name: 'application', factory: function () { return { compose: compose, start: start }; } });
    scope.register(require('./environment.js'));
    scope.register(require('./ExceptionHandler.js'));

    scope.register({
        name: 'exceptions',
        factory: function () {
            if (!exceptions) {
                var ExceptionHandler = scope.resolve('ExceptionHandler');
                exceptions = new ExceptionHandler(function (exception) {
                    console.error(exception);
                });
            }

            return exceptions;
        }
    });

    composeExpress();
};

/*
// Configures the express app and adds common middleware
*/
composeExpress = function () {
    var express = require('express'),
        expressSingleton = express(),
        router = express.Router(),
        favicon = require('serve-favicon'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        less = require('less-middleware'),
        debug = require('debug')('expressdefault:server'),
        serveStatic = require('serve-static');
        //isWin = /^win/.test(process.platform);

    /*
    // we'll use Hilary to wire up the node dependencies, for simplicity.
    // Note that we're creating parameterless factories that return the result of
    // node's require function, instead of just registering the modules themselves.
    // This approach reduces memory overhead in Hilary, and allows node to behave as it
    // normally would when using the service-location anti-pattern (i.e. node will to do it's
    // own caching and GC, as normal)
    */

    scope.register({ name: 'express',               factory: function () { return express; }});          // lib
    scope.register({ name: 'expressSingleton',      factory: function () { return expressSingleton; }}); // single instance used for app
    scope.register({ name: 'router',                factory: function () { return router; }});           // route engine
    scope.register({ name: 'favicon',               factory: function () { return favicon; }});
    scope.register({ name: 'logger',                factory: function () { return logger; }});
    scope.register({ name: 'cookieParser',          factory: function () { return cookieParser; }});
    scope.register({ name: 'bodyParser',            factory: function () { return bodyParser; }});
    scope.register({ name: 'less',                  factory: function () { return less; }});
    scope.register({ name: 'debug',                 factory: function () { return debug; }});
    scope.register({ name: 'serve-static',          factory: function () { return serveStatic; }});

    /*
    // Alternatively, you can let Hilary gracefully degrade to node's require function.
    // If you don't define a dependency, and the name is resolvable via node's require function,
    // the result of that require function will be returned.
    //
    // The commented out definitions below serve as an example in this project
    */
    //scope.define('http', function () { return require('http'); });
    //scope.define('path', function () { return require('path'); });

    scope.register(require('./expressStartup.js'));         // configures middleware and controllers
    scope.register(require('./www.js'));                    // the HTTP server
};

/*
// Where the routes (controllers) are registered
// This will auto-resolve any controllers that are included in controller/index.js
*/
configureRoutes = function (expressApp) {
    scope.autoResolve(require('./controllers'));    // execute the controller modules to register routes
    expressApp.use(scope.resolve('router'));        // use the router, after the controllers are all registered
};

/*
// Last chance to add before and after handlers.
// Executes configureRoutes - so all controllers get registered.
*/
configureApplicationLifecycle = function (expressApp) {
    // BEFORE
    (function () {

    }());

    configureRoutes(expressApp);

    // AFTER
    (function () {

    }());
};

/*
// Orchestrates startup
*/
start = function () {
    var Hilary = require('hilary');
    scope = Hilary.scope('node-example');

    console.log('startup::@' + new Date().toISOString());
    console.log('startup::composing application');

    // compose the application dependency graph
    compose();

    scope.resolve('expressStartup').init(configureApplicationLifecycle, function (app) {
        var server;

        scope.register({
            name: 'expressApp',
            factory: function () {
                return app;
            }
        });

        scope.register({
            name: 'server',
            factory: function () {
                return server;
            }
        });

        // start the HTTP services
        server = scope.resolve('www');
    });

    console.log('startup::starting application');

    // perform startup tasks (resolve modules here)

    console.log('startup::application running');
};

//////////////////////////////////////////////////
// START IMMEDIATELY
// note: we don't use an iffe for start, so it can be registered and the app can be restarted
start();
