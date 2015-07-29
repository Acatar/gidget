(function (Hilary, scope, exports) {
    'use strict';

    var compose, start;

    /*
    // Orchestrates composition of the application dependency graph
    */
    compose = function () {
        var exceptions;

        // perform composition tasks (register modules here)
        scope.register({ name: 'application', factory: function () { return { compose: compose, start: start }; } });
        scope.register({ name: 'Blueprint', factory: function () { return Hilary.Blueprint; } });
        scope.register({ name: 'is', factory: function () { return scope.getContext().is; } });

        scope.register({
            name: 'exceptions',
            dependencies: ['ExceptionHandler'],
            factory: function (ExceptionHandler) {
                if (!exceptions) {
                    exceptions = new ExceptionHandler(function (exception) {
                        if (exception.data) {
                            console.log(exception.message, exception.data);
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
            dependencies: ['IRouteEngine', 'GidgetModule', 'GidgetRoute', 'GidgetApp', 'argumentValidator'],
            factory: function (IRouteEngine, GidgetModule, GidgetRoute, GidgetApp, argumentValidator) {
                var Gidget = function (options) {
                    options = options || {};

                    if (argumentValidator.validate(IRouteEngine, options.routeEngine)) {
                        return;
                    }

                    return new GidgetApp(options.routeEngine);
                };

                Gidget.GidgetModule = GidgetModule;
                Gidget.GidgetRoute = GidgetRoute;

                return Gidget;
            }
        });
    };

    /*
    // Orchestrates startup
    */
    start = function () {
        compose();

        // perform startup tasks (resolve modules here)
        exports.Gidget = scope.resolve('Gidget');
    };

    //////////////////////////////////////////////////
    // START IMMEDIATELY
    // note: we don't use an iffe for start, so it can be registered and the app can be restarted
    start();

}(Hilary, Hilary.scope('gidget'), (typeof module !== 'undefined' && module.exports) ? module.exports : window));
