
/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'IOptions',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        "use strict";
        
        return {
            name: 'IOptions',
            validate: function (implementation) {
                var routeHandlerExists;
                
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                
                if (typeof implementation.routerName !== 'string') {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IOptions.routerName');
                }
                
                if (typeof implementation.router === 'undefined') {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IOptions.router');
                }
                
                return true;
            }
        };
    }
});
