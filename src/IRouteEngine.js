/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'IRouteEngine',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        "use strict";
        
        return {
            name: 'IRouteEngine',
            validate: function (implementation) {
                var routeHandlerExists;
                
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                
                routeHandlerExists = function (verb) {
                    if (typeof implementation[verb] !== 'function') {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IRouteEngine.' + verb);
                    }

                    if (implementation[verb].length !== 2) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresArguments + 'IRouteEngine.' + verb + '(path, callback)');
                    }
                };
                
                routeHandlerExists('get');
                routeHandlerExists('post');
                routeHandlerExists('put');
                routeHandlerExists('del');
                routeHandlerExists('any');
                
                if (typeof implementation.start !== 'function') {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IRouteEngine.start');
                }
                
                if (typeof implementation.navigate !== 'function') {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IRouteEngine.navigate');
                }

                if (implementation.navigate.length !== 2) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresArguments + 'IRouteEngine.navigate(hash, updateUrlBar)');
                }
                
                return true;
            }
        };
    }
});
