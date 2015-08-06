/*jshint unused: false*/
Hilary.scope('gidget-tests').register({
    name: 'pipeline.fixture',
    dependencies: ['describe', 'it', 'expect', 'xdescribe', 'xit'],
    factory: function (describe, it, expect, xdescribe, xit) {
        'use strict';

        describe('Gidget DefaultRouteEngine pipelines', function () {

            describe('when before.routeResolution has a registered handler', function () {

                it('should pass the path into the handler', function (done) {
                    // given
                    var sutPath = '/pipeline/before/routeResolution/path';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(function (err, uri) {
                                if (uri.path === sutPath) {
                                    // then
                                    expect(uri.path).to.equal(sutPath);
                                    gidgetApp.routeEngine.dispose();
                                    done();
                                }
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {

                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });

                it('should be able to affect the path', function (done) {
                    // given
                    var sutPath = '/pipeline/before/routeResolution/path/affect',
                        affectedPath = '/pipeline/before/routeResolution/path/affected';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(function (err, uri, next) {
                                if (uri.path === sutPath) {
                                    uri.path = affectedPath;
                                }
                                next(err, uri);
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[affectedPath] = function (err, res) {
                                gidgetApp.routeEngine.dispose();
                                done();
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });

            }); // /before.routeResolution

            describe('when after.routeResolution has a registered handler', function () {
                it('should pass the response into the handler', function (done) {
                    // given
                    var sutPath = '/pipeline/after/routeResolution/path';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.after.routeResolution(function (err, res) {
                                if (res.uri.path === sutPath) {
                                    // then
                                    expect(res.route.source).to.equal(sutPath);
                                    gidgetApp.routeEngine.dispose();
                                    done();
                                }
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {

                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });
            }); // /after.routeResolution

            describe('when before.routeExecution has a registered handler', function () {
                it('should be able to modify the params', function (done) {
                    // given
                    var sutPath = '/pipeline/before/routeExecution/params';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeExecution(function (err, res, next) {
                                if (res.uri.path === sutPath) {
                                    res.params = { foo: 'bar' };
                                }

                                next(err, res);
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {
                                expect(res.params.foo).to.equal('bar');
                                gidgetApp.routeEngine.dispose();
                                done();
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });
            }); // /before.routeExecution

            describe('when after.routeExecution has a registered handler', function () {
                it('should receive the response as passed by the route handler', function (done) {
                    // given
                    var sutPath = '/pipeline/after/routeExecution';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.after.routeExecution(function (err, res) {
                                if (res.uri.path === sutPath) {
                                    expect(res.foo).to.equal('bar');
                                    gidgetApp.routeEngine.dispose();
                                    done();
                                }
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res, next) {
                                res.foo = 'bar';
                                next(null, res);
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });

                it('should receive an error if one is passed earlier in the pipeline', function (done) {
                    // given
                    var sutPath = '/pipeline/after/routeExecution/err';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.after.routeExecution(function (err, res) {
                                if (res.uri.path === sutPath) {
                                    expect(err.status).to.equal(500);
                                    gidgetApp.routeEngine.dispose();
                                    done();
                                }
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res, next) {
                                next({ status: 500 }, res);
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });
            }); // /after.routeExecution

            describe('when on.error has a registered handler', function () {
                it('should get called, when an error event is triggered', function (done) {
                    // given
                    var sutPath = '/pipeline/on/errror';

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(function (err, uri, next) {
                                next({ status: 500, path: sutPath });
                            });

                            pipeline.on.error(function (err) {
                                if (err.data.path === sutPath) {
                                    expect(err.data.status).to.equal(500);
                                    gidgetApp.routeEngine.dispose();
                                    done();
                                }
                            });
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res, next) {
                                next(null, res);
                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                        }
                    });
                });
            }); // /on.error

            describe('when the once property is true on an event', function () {
                it('should remove the event from the pipeline', function (done) {
                    // given
                    var sutPath = '/pipeline/once',
                        count = 0;

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(new gidgetApp.PipelineEvent({
                                eventHandler: function (err, uri) {
                                    if (uri.path === sutPath) {
                                        count += 1;
                                    }
                                },
                                once: true
                            }));
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {

                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);

                            // then
                            expect(count).to.equal(1);
                            done();
                        }
                    });
                });
            });

            describe('when the remove condition is declared on an event', function () {
                it('should remove the event from the pipeline when remove returns true', function (done) {
                    // given
                    var sutPath = '/pipeline/once',
                        count = 0;

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(new gidgetApp.PipelineEvent({
                                eventHandler: function (err, uri) {
                                    if (uri.path === sutPath) {
                                        count += 1;
                                    }
                                },
                                // remove: when
                                remove: function (err, uri) {
                                    if (uri.path === sutPath) {
                                        return true;
                                    }
                                }
                            }));
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {

                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);

                            // then
                            expect(count).to.equal(1);
                            done();
                        }
                    });
                });

                it('should NOT remove the event from the pipeline when remove does not return true', function (done) {
                    // given
                    var sutPath = '/pipeline/once',
                        count = 0;

                    Gidget.Bootstrapper(null, {
                        composeLifecycle: function (err, gidgetApp, pipeline) {
                            pipeline.before.routeResolution(new gidgetApp.PipelineEvent({
                                eventHandler: function (err, uri) {
                                    if (uri.path === sutPath) {
                                        count += 1;
                                    }
                                },
                                // remove: when
                                remove: function (err, uri) {
                                    if (uri.path === sutPath && count === 2) {
                                        return true;
                                    }
                                }
                            }));
                        },
                        composeRoutes: function (err, gidgetApp) {
                            var controller = new Gidget.GidgetModule();
                            controller.get[sutPath] = function (err, res) {

                            };
                            gidgetApp.registerModule(controller);
                        },
                        onComposed: function (err, gidgetApp) {
                            // when
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);
                            gidgetApp.routeEngine.navigate(sutPath, null, false);

                            // then
                            expect(count).to.equal(2);
                            done();
                        }
                    });
                });
            });

        }); // pipelines
    }
});
