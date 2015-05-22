/*globals Hilary, module */
(function (exports, scope) {
    "use strict";
    
    var compose, start;
    
    compose = function (onReady) {
        var locale = scope.resolve('locale::en_US');
        
        scope.register({
            name: 'locale',
            factory: function () {
                return locale;
            }
        });
        
        scope.register({
            name: 'Gidget',
            dependencies: ['IRouteEngine', 'RouteEngine', 'GidgetCtor', 'IOptions', 'implementr', 'exceptions', 'locale'],
            factory: function (IRouteEngine, RouteEngine, GidgetCtor, IOptions, implementr, exceptions, locale) {
                return function (options) {
                    var self = {},
                        router;
                    
                    if (!implementr.implementsInterface(options, IOptions)) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.missingOptions);
                        return;
                    }
                    
                    router = scope.resolve(options.routerName);
                    
                    router.compose(RouteEngine, options, function (routeEngine) {
                        if (!implementr.implementsInterface(routeEngine, IRouteEngine)) {
                            exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIRouteEngine);
                            return;
                        }

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
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window, Hilary.scope('GidgetContainer')));
