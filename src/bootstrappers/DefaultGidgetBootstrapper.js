Hilary.scope('gidget').register({
    name: 'DefaultGidgetBootstrapper',
    dependencies: ['is'],
    factory: function (is) {
        'use strict';

        var Bootstrapper = function (scope, bootstrapper) {
            var self = {
                compose: undefined,
                start: undefined,
                configureRoutes: undefined,
                configureApplicationContainer: undefined,
                configureApplicationLifecycle: undefined
            };

            bootstrapper = bootstrapper || {};

            /*
            // compose the application and dependency graph
            */
            self.compose = function (onReady) {
                if (is.function(bootstrapper.compose)) {
                    bootstrapper.compose(onReady);
                } else {
                    onReady(null, new Gidget());
                }
            };

            /*
            // starts the application
            */
            self.start = function (err, gidgetApp) {
                self.configureApplicationContainer(gidgetApp);
                self.configureApplicationLifecycle(gidgetApp, gidgetApp.pipelines);
                self.configureRoutes(gidgetApp);

                if (is.function(bootstrapper.start)) {
                    bootstrapper.start(err, gidgetApp);
                }

                gidgetApp.start();
            };

            /*
            // Configure the IoC container - register singleton dependencies and what not
            */
            self.configureApplicationContainer = function (gidgetApp) {
                scope.register({
                    name: 'application',
                    factory: function () {
                        return {
                            compose: self.compose,
                            start: self.start,
                            restart: function () {
                                self.compose(self.start);
                            }
                        };
                    }
                });

                if (is.function(bootstrapper.configureApplicationContainer)) {
                    bootstrapper.configureApplicationContainer(gidgetApp);
                }
            };

            /*
            // Register application lifecycle pipeline events
            */
            self.configureApplicationLifecycle = function (gidgetApp, pipelines) {
                if (is.function(bootstrapper.configureApplicationLifecycle)) {
                    bootstrapper.configureApplicationLifecycle(gidgetApp, pipelines);
                }
            };

            /*
            // Register Modules / Controllers
            */
            self.configureRoutes = function (gidgetApp) {
                if (is.function(bootstrapper.configureRoutes)) {
                    bootstrapper.configureRoutes(gidgetApp);
                }
            };

            //////////////////////////////////////////////////
            // START IMMEDIATELY
            // note: we don't use an iffe for start, so it can be registered and the app can be restarted
            self.compose(self.start);

            return self;
        };

        return Bootstrapper;
    }
});
