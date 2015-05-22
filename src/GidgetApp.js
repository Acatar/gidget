/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'GidgetApp',
    dependencies: ['implementr', 'IGidgetApp', 'locale', 'exceptions'],
    factory: function (implementr, IGidgetApp, locale, exceptions) {
        "use strict";
        return function (components) {
            var self = {};
            
            if (!implementr.implementsInterface(components, IGidgetApp)) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIGidgetApp);
                return;
            }

            self.GidgetModule = components.GidgetModule;
            self.routeEngine = components.routeEngine;
            self.pipelines = function () {
                return {
                    before: self.routeEngine.before,
                    after: self.routeEngine.after
                };
            };

            /*
            //    register a module (i.e. a controller)
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
            self.registerModule = components.registerModule;

            return self;
        };
    }
});
