/*globals Hilary, jQuery, Gidget, ko, console*/
(function (scope, $, Gidget, ko) {
    'use strict';

    var mainSelector,
        $main;

    mainSelector = '#main';
    $main = $(mainSelector);

    new Gidget.Bootstrapper(scope, {
        configureApplicationContainer: function () {
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
        },
        configureApplicationLifecycle: function (gidgetApp, pipelines) {
            pipelines.before(function (verb, path, params) {
                console.log('about to navigate to:', { verb: verb, path: path, params: params });
            });

            pipelines.after(function (verb, path, params) {
                console.log('finished navigating to:', { verb: verb, path: path, params: params });
            });
        },
        configureRoutes: function (gidget) {
            gidget.registerModule(scope.resolve('homeController'));
            gidget.registerModule(scope.resolve('breweriesController'));
        },
        start: function () {
            ko.applyBindings(scope.resolve('viewEngine').mainVM, $main[0]);
        }
    });

}(Hilary.scope('node-example'), jQuery, Gidget, ko));
