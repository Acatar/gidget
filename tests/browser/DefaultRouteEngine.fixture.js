Hilary.scope('gidget-tests').register({
    name: 'DefaultRouteEngine.fixture',
    dependencies: ['describe', 'it', 'expect', 'xdescribe', 'xit'],
    factory: function (describe, it, expect, xdescribe, xit) {
        'use strict';

        describe('Gidget\'s DefaultRouteEngine', function () {

            xdescribe('when a route resolved', function () {
                it('should return a GidgetResponse', function (done) {

                });
            });

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
            }); // /route register()

            xdescribe('when a route is registered with a function that accepts 2 arguments', function () {
                it('should pass in a response object', function (done) {

                });

                it('should pass in an error, if an error is thrown earlier in the pipeline', function (done) {

                });
            }); // /route register(err, res)

            xdescribe('when a route is registered with a function that accepts 3 arguments', function () {
                it('should pass in a response object', function (done) {

                });

                it('should pass in an error, if an error is thrown earlier in the pipeline', function (done) {

                });

                it('should allow the route to pass in an error to the next phase of the pipeline', function (done) {
                    // Gidget.GidgetRoute({ after
                });

                it('should allow the route to affect the response object', function (done) {
                    // Gidget.GidgetRoute({ after
                });
            }); // /route register(err, res, next)

            xdescribe('when a route that has parameters is registered', function () {
                it('should pass in the parameters by name on the response object', function (done) {

                });

                it('should pass in the parameters as a splat array on the response object', function (done) {

                });
            }); // /route /{params}

        }); // /DefaultRouteEngine
    }
});
