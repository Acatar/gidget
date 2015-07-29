Hilary.scope('node-example').register({
    name: 'homeController',
    dependencies: ['newGidgetModule', 'locale', 'viewEngine'],
    factory: function (self, locale, viewEngine) {
        'use strict';

        var getExample1,
            logLifecycle;

        logLifecycle = function (message, verb, path, params) {
            console.log(message, {
                verb: verb,
                path: path,
                params: params
            });
        };

        self.get['/'] = function () {
            viewEngine.setVM({
                template: 't-empty',
                data: {
                    heading: locale.pages.home.empty.heading,
                    body: locale.pages.home.empty.body
                },
                after: function (vm) {
                    console.log(vm);
                }
            });
        };

        // Single route with `before` and `after` pipelines
        getExample1 = function () {
            viewEngine.setVM({
                template: 't-empty',
                data: {
                    heading: locale.pages.home.empty.heading,
                    body: '/example1'
                }
            });
        };
        getExample1.before = function (verb, path, params) {
            logLifecycle('before example 1 route', verb, path, params);
        };
        getExample1.after = function (verb, path, params) {
            logLifecycle('after example 1 route', verb, path, params);
        };
        self.get['/example1'] = getExample1;

        // Single route handler for a route
        self.get['/example2'] = function () {
            viewEngine.setVM({
                template: 't-empty',
                data: {
                    heading: locale.pages.home.empty.heading,
                    body: '/example2'
                }
            });
        };

        return self;
    }
});
