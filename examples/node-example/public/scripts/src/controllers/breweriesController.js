Hilary.scope('node-example').register({
    name: 'breweriesController',
    dependencies: ['newGidgetModule', 'GidgetRoute', 'viewEngine'],
    factory: function (self, GidgetRoute, viewEngine) {
        'use strict';

        self.get['/breweries/:brewery'] = new GidgetRoute({
            routeHandler: function (err, req, next) {
                req.title = req.params.brewery;

                viewEngine.setVM({
                    template: 't-brewery',
                    data: {
                        heading: '/breweries/:brewery',
                        param0: req.params.splat[0],
                        brewery: req.params.brewery
                    }
                });

                next(err, req);
            },
            before: function (err, req, next) {
                console.log('before breweries route', req);
                next(err, req);
            },
            after: function (err, req, next) {
                console.log('after breweries route', req);
                next(err, req);
            }
        });

        self.get['/breweries/:brewery/beers/:beer'] = function (err, req, next) {
            req.title = req.params.brewery.concat(' ', req.params.beer);

            viewEngine.setVM({
                template: 't-beer',
                data: {
                    heading: '/breweries/:brewery/beers/:beer',
                    param0: req.params.splat[0],
                    param1: req.params.splat[1],
                    brewery: req.params.brewery,
                    beer: req.params.beer
                }
            });

            next(err, req);
        };

        return self;
    }
});
