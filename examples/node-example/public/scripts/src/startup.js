/*globals Hilary, jQuery, Gidget, ko, console*/
(function (scope, $, Gidget, ko) {
    'use strict';

    var mainSelector,
        $main;

    mainSelector = '#main';
    $main = $(mainSelector);

    Gidget.Bootstrapper(scope, {
        hilary: {
            composeLifecycle: function (err, scope, pipeline) {
                pipeline.on.error(function (err) {
                    console.log('error.data', err.data);
                    throw err;
                });
            },
            composeModules: function (err, scope) {
                // singletons are stored in local variables
                var locale,
                    viewEngine,
                    exceptions,
                    is;

                scope.register({ name: 'newGidgetModule',   factory: function () { return new Gidget.GidgetModule(); }});
                scope.register({ name: 'GidgetRoute',   factory: function () { return Gidget.GidgetRoute; }});
                scope.register({ name: 'Blueprint',         factory: function () { return Hilary.Blueprint; }});

                scope.register({
                    name: 'is',
                    factory: function () {
                        if (!is) {
                            is = scope.getContext().is;
                        }
                        return is;
                    }
                });

                scope.register({
                    name: 'locale',
                    factory: function () {
                        if (!locale) {
                            // TODO: Pick the locale based on the user preferences
                            // and load it separately from the web
                            locale = scope.resolve('locale::en_US');
                        }

                        return locale;
                    }
                });

                scope.register({
                    name: 'exceptions',
                    factory: function () {
                        if (!exceptions) {
                            var ExceptionHandler = scope.resolve('ExceptionHandler');
                            exceptions = new ExceptionHandler(function (exception) {
                                throw exception;
                            });
                        }

                        return exceptions;
                    }
                });

                // register a single viewEngine to be used throughout the app
                scope.register({
                    name: 'viewEngine',
                    factory: function () {

                        if (!viewEngine) {
                            var ViewEngine = scope.resolve('ViewEngine');
                            viewEngine = new ViewEngine($main);
                        }

                        return viewEngine;
                    }
                });
            }
        },
        composeLifecycle: function (err, gidgetApp, pipeline) {
            pipeline.before.routeResolution(function (err, uri) {
                console.log('before route resolution', uri);
            });

            pipeline.after.routeResolution(function (err, res) {
                console.log('after route resolution', res);
            });

            pipeline.before.routeExecution(function (err, res) {
                console.log('before route execution', res);
            });

            pipeline.after.routeExecution(function (err, res) {
                console.log('after route execution', res);
            });

            pipeline.on.error(function (err) {
                console.log('error.data', err.data);
                throw err;
            });
        },
        composeRoutes: function (err, gidgetApp) {
            scope.register({ name: 'router',   factory: function () { return gidgetApp.routeEngine; }});
            gidgetApp.registerModule(scope.resolve('homeController'));
            gidgetApp.registerModule(scope.resolve('breweriesController'));
        },
        onComposed: function (err) {
            if (!err) {
                ko.applyBindings(scope.resolve('viewEngine').mainVM, $main[0]);
            }
        }
    });

}(Hilary.scope('node-example'), jQuery, Gidget, ko));
