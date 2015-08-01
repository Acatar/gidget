Hilary.scope('gidget-tests').register({
    name: 'DefaultRouteEngine.fixture',
    dependencies: ['describe', 'it', 'expect'],
    factory: function (describe, it, expect) {
        'use strict';

        // var makeSut = function (scope, ops) {
        //     Gidget.Bootstrapper(scope, {
        //         composeRoutes: function (err, gidgetApp) {
        //             if (ops.configureRoutes) {
        //                 ops.configureRoutes(gidgetApp);
        //             }
        //         }
        //     });
        // };


        describe('Gidget\'s DefaultRouteEngine', function () {

            describe('when a route is registered with a parameterless function', function () {
                it('should be navigable', function (done) {
                    // given
                    Gidget.Bootstrapper(null, {
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get['/register/parameterless/callback'] = function () {
                                // then
                                gidgetApp.routeEngine.dispose();
                                done();
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate('/register/parameterless/callback', null, false);
                        }
                    });
                });
            }); // route registered ()

        });

        // describe('Gidget DefaultRouteEngine', function () {
        //
        //     describe('when a route is registered with a parameterless function', function () {
        //
        //         it('should be navigable', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router;
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = function () {
        //                         // then
        //                         gidgetApp.routeEngine.dispose();
        //                         done();
        //                     };
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //     });
        //
        //     describe('when a route is registered with a function that accepts 2 arguments', function () {
        //
        //         it('should pass in a response object', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router;
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = function (err, res) {
        //                         // then
        //                         expect(res.verb).to.equal('get');
        //                         expect(res.route).to.not.equal(undefined);
        //                         gidgetApp.routeEngine.dispose();
        //                         done();
        //                     };
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //         it('should pass in an error, if an error is thrown earlier in the pipeline', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router,
        //                 expected = 'error!';
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = new Gidget.GidgetRoute({
        //                         routeHandler: function (err, res) {
        //                             // then
        //                             expect(err).to.equal(expected);
        //                             expect(res).to.equal(undefined);
        //                             gidgetApp.routeEngine.dispose();
        //                             done();
        //                         },
        //                         before: function (err, res, next) {
        //                             next(expected);
        //                         }
        //                     });
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //     }); // / 2 arguments
        //
        //     describe('when a route is registered with a function that accepts 3 arguments', function () {
        //
        //         it('should pass in a response object', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router;
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = function (err, res, next) {
        //                         // then
        //                         expect(res.verb).to.equal('get');
        //                         expect(res.route).to.not.equal(undefined);
        //                         next(null, res);
        //                         gidgetApp.routeEngine.dispose();
        //                         done();
        //                     };
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //         it('should pass in an error, if an error is thrown earlier in the pipeline', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router,
        //                 expected = 'error!';
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = new Gidget.GidgetRoute({
        //                         routeHandler: function (err, res, next) {
        //                             // then
        //                             expect(err).to.equal(expected);
        //                             expect(res).to.equal(undefined);
        //                             next(err, res);
        //                             gidgetApp.routeEngine.dispose();
        //                             done();
        //                         },
        //                         before: function (err, res, next) {
        //                             next(expected);
        //                         }
        //                     });
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //         it('should allow the route to pass in an error to the next phase of the pipeline', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router,
        //                 expected = 'error!';
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = new Gidget.GidgetRoute({
        //                         routeHandler: function (err, res, next) {
        //                             next(expected);
        //                         },
        //                         after: function (err, res) {
        //                             // then
        //                             expect(err).to.equal(expected);
        //                             expect(res).to.equal(undefined);
        //                             gidgetApp.routeEngine.dispose();
        //                             done();
        //                         }
        //                     });
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //         it('should allow the route to affect the response object', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router,
        //                 expected = 'hello world!';
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/'] = new Gidget.GidgetRoute({
        //                         routeHandler: function (err, res, next) {
        //                             res.foo = expected;
        //                             next(null, res);
        //                         },
        //                         after: function (err, res) {
        //                             // then
        //                             expect(err).to.equal(null);
        //                             expect(res.foo).to.equal(expected);
        //                             gidgetApp.routeEngine.dispose();
        //                             done();
        //                         }
        //                     });
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/', null, false);
        //         });
        //
        //     }); // / 3 arguments
        //
        //     describe('when a route that has parameters is registered', function () {
        //
        //         it('should pass in the parameters by name on the response object', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router;
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/breweries/:brewery/beers/:beer'] = function (err, res) {
        //                         // then
        //                         expect(res.params.brewery).to.equal('Straub');
        //                         expect(res.params.beer).to.equal('Lager');
        //                         gidgetApp.routeEngine.dispose();
        //                         done();
        //                     };
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/breweries/Straub/beers/Lager', null, false);
        //         });
        //
        //         it('should pass in the parameters as a splat array on the response object', function (done) {
        //             // given
        //             var sutScope = new Hilary(),
        //                 router;
        //
        //             makeSut(sutScope, {
        //                 configureRoutes: function (gidgetApp) {
        //                     var controller = new Gidget.GidgetModule();
        //
        //                     controller.get['/breweries/:brewery/beers/:beer'] = function (err, res) {
        //                         // then
        //                         expect(res.params.splat[0]).to.equal('Straub');
        //                         expect(res.params.splat[1]).to.equal('Lager');
        //                         gidgetApp.routeEngine.dispose();
        //                         done();
        //                     };
        //
        //                     gidgetApp.registerModule(controller);
        //                 }
        //             });
        //
        //             router = sutScope.resolve('gidgetRouter');
        //
        //             // when
        //             router.navigate('/breweries/Straub/beers/Lager', null, false);
        //         });
        //
        //     });
        //
        // }); // /routes
    }
});
