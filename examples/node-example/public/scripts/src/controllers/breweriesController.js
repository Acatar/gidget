Hilary.scope('node-example').register({
    name: 'breweriesController',
    dependencies: ['newGidgetModule', 'GidgetRoute', 'viewEngine'],
    factory: function (self, GidgetRoute, viewEngine) {
        'use strict';

        var logLifecycle,
            getBrewery;

        logLifecycle = function (message, params) {
            console.log(message, {
                params: params
            });
        };

        getBrewery = new GidgetRoute({
            routeHandler: function (params) {
                viewEngine.setVM({
                    template: 't-brewery',
                    data: {
                        heading: '/breweries/:brewery',
                        param0: params.splat[0],
                        brewery: params.brewery
                    },
                    after: function (vm) {
                        console.log(vm);
                    }
                });
            },
            before: function (params) {
                logLifecycle('before breweries route', params);
            },
            after: function (params) {
                logLifecycle('after breweries route', params);
            }
        });

        self.get['/breweries/:brewery'] = getBrewery;
        self.get['/breweries/:brewery/beers/:beer'] = function (params) {
            viewEngine.setVM({
                template: 't-beer',
                data: {
                    heading: '/breweries/:brewery/beers/:beer',
                    param0: params.splat[0],
                    param1: params.splat[1],
                    brewery: params.brewery,
                    beer: params.beer
                },
                after: function (vm) {
                    console.log(vm);
                }
            });
        };

        return self;
    }
});
