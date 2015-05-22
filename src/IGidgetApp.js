/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'IGidgetApp',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        "use strict";
        
        return {
            name: 'IGidgetApp',
            validate: function (implementation) {
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                
//        self.routeEngine = components.routeEngine;
//        self.GidgetModule = components.GidgetModule;
//        self.registerModule = components.registerModule;
                
//                if (typeof implementation.navigate !== 'function') {
//                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IRouteEngine.navigate');
//                }
//
//                if (implementation.navigate.length !== 2) {
//                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresArguments + 'IRouteEngine.navigate(hash, updateUrlBar)');
//                }
                
                return true;
            }
        };
    }
});
