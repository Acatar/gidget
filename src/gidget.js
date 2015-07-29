(function (Hilary, scope, exports) {
    'use strict';

    var compose, start;

    /*
    // Orchestrates composition of the application dependency graph
    */
    compose = function (onReady) {
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
            dependencies: ['IRouteEngine', 'GidgetModule', 'GidgetRoute', 'GidgetApp', 'argumentValidator'],
            factory: function (IRouteEngine, GidgetModule, GidgetRoute, GidgetApp, argumentValidator) {
                var Gidget = {};

                Gidget.GidgetModule = GidgetModule;
                Gidget.GidgetRoute = GidgetRoute;
                Gidget.init = function (options) {
                    options = options || {};
                    options.routeEngine = options.routeEngine || scope.resolve('DefaultRouteEngine');

                    if (!argumentValidator.validate(IRouteEngine, options.routeEngine)) {
                        return;
                    }

                    return new GidgetApp(options.routeEngine);
                };

                return Gidget;
            }
        });

        onReady();
    };

    /*
    // Orchestrates startup
    */
    start = function () {
        // perform startup tasks (resolve modules here)
        var Gidget = scope.resolve('Gidget');

        exports.Gidget = Gidget;
    };

    //////////////////////////////////////////////////
    // START IMMEDIATELY
    // note: we don't use an iffe for start, so it can be registered and the app can be restarted
    compose(start);

}(Hilary, Hilary.scope('gidget'), (typeof module !== 'undefined' && module.exports) ? module.exports : window));
