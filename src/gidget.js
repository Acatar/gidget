(function (exports, scope, Hilary) {
    'use strict';

    var compose, start;

    compose = function () {
        var locale = scope.resolve('locale::en_US'),
            exceptions;

        scope.register({
            name: 'locale',
            factory: function () {
                return locale;
            }
        });

        scope.register({
            name: 'Blueprint',
            factory: function () {
                return Hilary.Blueprint;
            }
        });

        scope.register({
            name: 'is',
            factory: function () {
                return scope.getContext().is;
            }
        });

        scope.register({
            name: 'exceptions',
            dependencies: ['ExceptionHandler'],
            factory: function (ExceptionHandler) {
                if (exceptions) {
                    return exceptions;
                }

                exceptions = new ExceptionHandler(function (exception) {
                    if (exception.data) {
                        console.log(exception.message, exception.data);
                    }

                    throw exception;
                });

                return exceptions;
            }
        });

        scope.register({
            name: 'Gidget',
            dependencies: ['RouteEngine', 'GidgetCtor', 'IOptions', 'exceptions', 'locale'],
            factory: function (RouteEngine, GidgetCtor, IOptions, exceptions, locale) {
                return function (options) {
                    var self = {},
                        optionsAreValid,
                        router;

                    optionsAreValid = IOptions.syncSignatureMatches(options);

                    if (!optionsAreValid.result) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.missingOptions);
                        return;
                    }

                    router = scope.resolve(options.routerName);

                    router.compose(RouteEngine, options, function (routeEngine) {
                        self = new GidgetCtor(routeEngine, options.callback);

                        return self;
                    });

                    return self;
                };
            }
        });

        start();
    };

    start = function () {
        exports.Gidget = scope.resolve('Gidget');
    };

    compose(start);

}((typeof module !== 'undefined' && module.exports) ? module.exports : window, Hilary.scope('GidgetContainer'), Hilary));
