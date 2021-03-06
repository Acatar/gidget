Hilary.scope('gidget').register({
    name: 'GidgetApp',
    dependencies: ['IGidgetModule', 'GidgetPipelineEvent', 'argumentValidator', 'is'],
    factory: function (IGidgetModule, GidgetPipelineEvent, argumentValidator, is) {
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
            self.PipelineEvent = new GidgetPipelineEvent(self.pipeline);

            self.registerModule = function (gidgetModule) {
                if (!argumentValidator.validate(IGidgetModule, gidgetModule)) {
                    return;
                }

                var gets = gidgetModule.get,
                    puts = gidgetModule.put,
                    patches = gidgetModule.patch,
                    posts = gidgetModule.post,
                    dels = gidgetModule.del,
                    get,
                    put,
                    patch,
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

                for (patch in patches) {
                    if (patches.hasOwnProperty(patch)) {
                        routeEngine.register.patch(patch, patches[patch]);
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
