Hilary.scope('node-example').register({
    name: 'breweriesController',
    dependencies: ['newGidgetModule', 'GidgetRoute', 'viewEngine'],
    factory: function (self, GidgetRoute, viewEngine) {
        'use strict';

        self.get['/breweries/:brewery'] = new GidgetRoute({
            routeHandler: function (err, res, next) {
                viewEngine.setVM({
                    template: 't-brewery',
                    data: {
                        heading: '/breweries/:brewery',
                        param0: res.params.splat[0],
                        brewery: res.params.brewery
                    }
                });

                next(err, res);
            },
            before: function (err, res, next) {
                console.log('before breweries route', res);
                next(err, res);
            },
            after: function (err, params, next) {
                console.log('after breweries route', params);
                next(err, params);
            }
        });

        self.get['/breweries/:brewery/beers/:beer'] = function (err, res, next) {
            viewEngine.setVM({
                template: 't-beer',
                data: {
                    heading: '/breweries/:brewery/beers/:beer',
                    param0: res.params.splat[0],
                    param1: res.params.splat[1],
                    brewery: res.params.brewery,
                    beer: res.params.beer
                }
            });

            next(err, res);
        };

        return self;
    }
});
