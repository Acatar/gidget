(function (Hilary, scope, exports) {
    'use strict';

    scope.Bootstrapper({
        composeLifecycle: function (err, scope, pipeline) {
            pipeline.on.error(function (err) {
                try {
                    // try, in case this is triggered before exceptions are registered
                    scope.resolve('exceptions').throw(err);
                } catch (e) {
                    console.log(e);
                    console.log(err);
                }
            });
        },
        composeModules: function (err, scope) {
            var exceptions;

            scope.register({ name: 'Blueprint', singleton: true, factory: function () { return Hilary.Blueprint; } });
            scope.register({ name: 'is', singleton: true, factory: function () { return scope.getContext().is; } });

            scope.register({
                name: 'exceptions',
                singleton: true,
                dependencies: ['ExceptionHandler'],
                factory: function (ExceptionHandler) {
                    if (!exceptions) {
                        exceptions = new ExceptionHandler(function (exception) {
                            if (exception.data) {
                                console.log(exception.message, exception.data);
                            } else {
                                console.log(exception.message);
                            }

                            throw exception;
                        });
                    }

                    return exceptions;
                }
            });

            scope.register({
                name: 'Gidget',
                blueprint: 'IGidget',
                dependencies: ['IRouteEngine', 'GidgetModule', 'GidgetRoute', 'DefaultGidgetBootstrapper', 'GidgetApp', 'argumentValidator'],
                factory: function (IRouteEngine, GidgetModule, GidgetRoute, DefaultGidgetBootstrapper, GidgetApp, argumentValidator) {
                    var Gidget = function (options) {
                        options = options || {};
                        options.routeEngine = options.routeEngine || scope.resolve('DefaultRouteEngine');

                        if (!argumentValidator.validate(IRouteEngine, options.routeEngine)) {
                            return;
                        }

                        return new GidgetApp(options.routeEngine);
                    };

                    Gidget.GidgetModule = GidgetModule;
                    Gidget.GidgetRoute = GidgetRoute;
                    Gidget.Bootstrapper = DefaultGidgetBootstrapper;

                    return Gidget;
                }
            });
        },
        onComposed: function (err, scope) {
            var Gidget = scope.resolve('Gidget');

            exports.Gidget = Gidget;
        }
    });

}(Hilary, Hilary.scope('gidget'), (typeof module !== 'undefined' && module.exports) ? module.exports : window));
