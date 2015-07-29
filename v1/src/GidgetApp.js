Hilary.scope('GidgetContainer').register({
    name: 'GidgetApp',
    dependencies: ['IGidgetApp', 'locale', 'exceptions'],
    factory: function (IGidgetApp, locale, exceptions) {
        'use strict';

        return function (components) {
            components = components || {};

            components.pipelines = function () {
                return {
                    before: components.routeEngine.before,
                    after: components.routeEngine.after
                };
            };

            if (!IGidgetApp.syncSignatureMatches(components).result) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation, IGidgetApp.syncSignatureMatches(components).errors);
            }

            /*
            //    components.registerModule: register a module (i.e. a controller)
            //    @param gidgetModule: an instance of GidgetModule
            //
            //    i.e.
            //      var myModule = new gidget.GidgetModule();
            //
            //      myModule.get['/beers/:id'] = function (params, event) {
            //          // show beer
            //      }
            //
            //      gidget.registerModule(myModule);
            */

            return components;
        };
    }
});
