Hilary.scope('gidget').register({
    name: 'GidgetApp',
    dependencies: ['IGidgetModule', 'argumentValidator', 'is'],
    factory: function (IGidgetModule, argumentValidator, is) {
        'use strict';

        var GidgetApp = function (routeEngine) {
            var self = {
                start: undefined,
                pipelines: {},
                registerModule: undefined,
                registerModules: undefined
            };

            self.start = routeEngine.start;
            self.routeEngine = routeEngine;

            self.pipeline = routeEngine.pipeline;

            self.registerModule = function (gidgetModule) {
                if (!argumentValidator.validate(IGidgetModule, gidgetModule)) {
                    return;
                }

                var gets = gidgetModule.get,
                    puts = gidgetModule.put,
                    posts = gidgetModule.post,
                    dels = gidgetModule.del,
                    get,
                    put,
                    post,
                    del;

                for (get in gets) {
                    if (gets.hasOwnProperty(get)) {
                        routeEngine.register.get(get, gets[get]);
                    }
                }

                for (put in puts) {
                    if (puts.hasOwnProperty(put)) {
                        routeEngine.register.put(put, puts[put]);
                    }
                }

                for (post in posts) {
                    if (posts.hasOwnProperty(post)) {
                        routeEngine.register.post(post, posts[post]);
                    }
                }

                for (del in dels) {
                    if (dels.hasOwnProperty(del)) {
                        routeEngine.register.del(del, dels[del]);
                    }
                }
            };

            self.registerModules = function (gidgetModules) {
                if (is.array(gidgetModules)) {
                    var i;

                    for (i = 0; i < gidgetModules.length; i += 1) {
                        self.registerModule(gidgetModules[i]);
                    }
                }
            };

            return self;
        };

        return GidgetApp;
    }
});
