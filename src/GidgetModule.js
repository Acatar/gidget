Hilary.scope('gidget').register({
    name: 'GidgetModule',
    dependencies: [],
    factory: function () {
        'use strict';

        return function () {
            var self = {
                get: {},
                post: {},
                put: {},
                del: {},
                register: {
                    get: undefined,
                    post: undefined,
                    put: undefined,
                    del: undefined
                }
            };

            self.register.get = function (routePath, routeHandler) {
                self.get[routePath] = routeHandler;
            };

            self.register.post = function (routePath, routeHandler) {
                self.post[routePath] = routeHandler;
            };

            self.register.put = function (routePath, routeHandler) {
                self.put[routePath] = routeHandler;
            };

            self.register.del = function (routePath, routeHandler) {
                self.del[routePath] = routeHandler;
            };

            return self;
        };
    }
});
