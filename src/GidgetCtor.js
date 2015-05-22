/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'GidgetCtor',
    dependencies: ['IGidgetModule', 'GidgetModule', 'GidgetApp', 'implementr', 'locale', 'exceptions'],
    factory: function (IGidgetModule, GidgetModule, GidgetApp, implementr, locale, exceptions) {
        "use strict";
        
        return function (routeEngine, callback) {
            var registerModule,
                gidgetApp;

            registerModule = function (gidgetModule) {
                if (!implementr.implementsInterface(gidgetModule, IGidgetModule)) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIGidgetModule);
                    return;
                }

                var gets = gidgetModule.get,
                    puts = gidgetModule.put,
                    posts = gidgetModule.posts,
                    dels = gidgetModule.dels,
                    anys = gidgetModule.anys,
                    get,
                    put,
                    post,
                    del,
                    any;

                for (get in gets) {
                    if (gets.hasOwnProperty(get)) {
                        routeEngine.get(get, gets[get]);
                    }
                }

                for (put in puts) {
                    if (puts.hasOwnProperty(put)) {
                        routeEngine.put(put, puts[put]);
                    }
                }

                for (post in posts) {
                    if (posts.hasOwnProperty(post)) {
                        routeEngine.post(post, posts[post]);
                    }
                }

                for (del in dels) {
                    if (dels.hasOwnProperty(del)) {
                        routeEngine.del(del, dels[del]);
                    }
                }

                for (any in anys) {
                    if (anys.hasOwnProperty(any)) {
                        routeEngine.get(any, anys[any]);
                    }
                }
            };
            
            gidgetApp = new GidgetApp({
                GidgetModule: GidgetModule,
                routeEngine: routeEngine,
                registerModule: registerModule
            });

            if (typeof callback === 'function') {
                callback(gidgetApp);
            }
            
            return gidgetApp;
        };
    }
});
