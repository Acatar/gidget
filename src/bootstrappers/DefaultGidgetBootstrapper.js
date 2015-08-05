Hilary.scope('gidget').register({
    name: 'DefaultGidgetBootstrapper',
    dependencies: ['is'],
    factory: function (is) {
        'use strict';

        var Bootstrapper = function (scope, bootstrapper) {
            var start,
                composeLifecycle,
                composeModules,
                composeRoutes,
                onComposed,
                onError;

            scope = scope || new Hilary();
            bootstrapper = bootstrapper || {};
            bootstrapper.options = bootstrapper.options || {};
            bootstrapper.hilary = bootstrapper.hilary || {};

            onError = function (err) {
                console.log(err);
            };

            start = function () {
                // err, scope, gidgetApp
                if (is.function(bootstrapper.start)) {
                    bootstrapper.start(null, composeLifecycle);
                } else {
                    composeLifecycle(null, new Gidget(bootstrapper.options));
                }
            };

            composeLifecycle = function (err, gidgetApp) {
                if (err) {
                    onError(err);
                }

                // err, gidgetApp, pipeline, next
                if (is.function(bootstrapper.composeLifecycle) && bootstrapper.composeLifecycle.length === 4) {
                    bootstrapper.composeLifecycle(err, gidgetApp, gidgetApp.pipeline, composeModules);
                } else if (is.function(bootstrapper.composeLifecycle)) {
                    bootstrapper.composeLifecycle(err, gidgetApp, gidgetApp.pipeline);
                    composeModules(err, gidgetApp);
                } else {
                    composeModules(err, gidgetApp);
                }
            };

            composeModules = function (err, gidgetApp) {
                if (err) {
                    onError(err);
                }

                scope.register({ name: 'gidgetApp', factory: function () { return gidgetApp; }});
                scope.register({ name: 'gidgetRouter', factory: function () { return gidgetApp.routeEngine; }});

                scope.register({
                    name: 'application',
                    factory: function () {
                        return {
                            restart: function () {
                                start();
                            }
                        };
                    }
                });

                // err, gidgetApp, next
                if (is.function(bootstrapper.composeModules) && bootstrapper.composeModules.length === 3) {
                    bootstrapper.composeModules(err, gidgetApp, composeRoutes);
                } else if (is.function(bootstrapper.composeModules)) {
                    bootstrapper.composeModules(err, gidgetApp);
                    composeRoutes(err, gidgetApp);
                } else {
                    composeRoutes(err, gidgetApp);
                }
            };

            composeRoutes = function (err, gidgetApp) {
                if (err) {
                    onError(err);
                }

                // err, gidgetApp, next
                if (is.function(bootstrapper.composeRoutes) && bootstrapper.composeRoutes.length === 3) {
                    bootstrapper.composeRoutes(err, gidgetApp, onComposed);
                } else if (is.function(bootstrapper.composeRoutes)) {
                    bootstrapper.composeRoutes(err, gidgetApp);
                    onComposed(err, gidgetApp);
                } else {
                    onComposed(err, gidgetApp);
                }
            };

            onComposed = function (err, gidgetApp) {
                var startRouteEngine;

                if (err) {
                    onError(scope, err);
                }

                startRouteEngine = function () {
                    gidgetApp.routeEngine.start();
                };

                // err, scope, gidgetApp
                if (is.function(bootstrapper.onComposed)) {
                    bootstrapper.onComposed(err, gidgetApp, startRouteEngine);
                } else {
                    startRouteEngine();
                }
            };

            if (bootstrapper.options.composeHilary !== false) {
                scope.Bootstrapper({
                    composeLifecycle: bootstrapper.hilary.composeLifecycle,
                    composeModules: bootstrapper.hilary.composeModules,
                    onComposed: function (err, scope) {
                        if (is.function(bootstrapper.hilary.onComposed)) {
                            bootstrapper.hilary.onComposed(err, scope);
                        }

                        start();
                    }
                });
            } else {
                start();
            }
        };

        return Bootstrapper;
    }
});
