/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'IGidgetModule',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        "use strict";
        
        return {
            name: 'IGidgetModule',
            validate: function (implementation) {
                var validateVerb;
                
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                
                validateVerb = function (verb) {
                    if (typeof implementation[verb] !== 'object') {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + 'IRouteEngine.' + verb);
                    }
                };
                
                validateVerb('get');
                validateVerb('post');
                validateVerb('put');
                validateVerb('del');
                validateVerb('any');
                
                return true;
            }
        };
    }
});
