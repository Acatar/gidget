Hilary.scope('gidget').register({
    name: 'BaseRouteEngine',
    dependencies: ['Route', 'GidgetContext', 'is', 'locale', 'exceptions'],
    factory: function (Route, GidgetContext, is, locale, exceptions) {
        'use strict';

        var RouteEngine = function (router) {
            var self,
            regularExpressions,
            routes = [],
            pipelineEvents,
            makeAsyncCallback,
            makeRouteExecutionQueue,
            addRoute,
            parseRoute,
            parseParams,
            makePipelineTasks,
            validatePipelineEventCallback,
            executeBeforePipeline,
            executeAfterPipeline,
            executeErrorPipeline,
            executeBeforeRouteResolution,
            executeAfterRouteResolution;

            router = router || {};

            self = {
                get: router.get,
                post: router.post,
                put: router.put,
                del: router.del,
                navigate: router.navigate,
                beforeRouteResolution: undefined,
                afterRouteResolution: undefined,
                before: undefined,
                after: undefined,
                onError: undefined,
                parseRoute: undefined,
                resolveRoute: undefined,
                resolveAndExecuteRoute: undefined,
                start: router.start
            };

            regularExpressions = {
                escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
                namedParam: /:(\w+)/g,
                splatParam: /\*(\w+)/g,
                firstParam: /(:\w+)|(\*\w+)/,
                allParams: /(:|\*)\w+/g,
                extractHash: /^[^#]*(#.*)$/
            };

            pipelineEvents = {
                beforeRouteResolution: [],
                afterRouteResolution: [],
                before: [],
                after: [],
                error: []
            };

            makeAsyncCallback = function (callback) {
                if (is.function(callback) && callback.length < 3) {
                    var asyncCallback = function (err, params, next) {
                        callback(err, params);
                        next(err, params);
                    };

                    asyncCallback.before = makeAsyncCallback(callback.before);
                    asyncCallback.after = makeAsyncCallback(callback.after);

                    return asyncCallback;
                } else {
                    return callback;
                }
            };

            makeRouteExecutionQueue = function (verb, path, callback) {
                return function (err, route) {
                    var beforeThis,
                        beforeAll,
                        main,
                        afterThis,
                        afterAll;

                    beforeThis = function () {
                        var response = new GidgetContext({
                            verb: verb,
                            route: route,
                            params: route.params
                        });

                        if (is.function(callback.before)) {
                            callback.before(null, response, beforeAll);
                        } else {
                            beforeAll(null, response);
                        }
                    };

                    beforeAll = function (err, response) {
                        executeBeforePipeline(err, response, main);
                    };

                    main = function (err, response) {
                        callback(err, response, afterThis);
                    };

                    afterThis = function (err, response) {
                        if (is.function(callback.after)) {
                            callback.after(err, response, afterAll);
                        } else {
                            afterAll(err, response);
                        }
                    };

                    afterAll = function (err, response) {
                        executeAfterPipeline(err, response);
                    };

                    // RUN
                    beforeThis();
                };
            };

            addRoute = function (verb, path, callback) {
                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace('{func}', 'addRoute').replace('{args}', '(verb, path, callback)'));
                }

                routes.push({
                    route: parseRoute(path),
                    callback: makeRouteExecutionQueue(verb, path, makeAsyncCallback(callback))
                });
            };

            // thanks Simrou!
            parseRoute = function (path, caseSensitive) {
                var name,
                    names,
                    params,
                    pattern;


                pattern = String(path);
                names = pattern.match(regularExpressions.allParams);

                if (names !== null) {
                    params = (function () {
                        var i,
                            len,
                            results;

                        results = [];

                        for (i = 0, len = names.length; i < len; i += 1) {
                            name = names[i];
                            results.push(name.substr(1));
                        }

                        return results;
                    }());
                } else {
                    params = [];
                }

                pattern = pattern.replace(regularExpressions.escapeRegExp, '\\$&');
                pattern = pattern.replace(regularExpressions.namedParam, '([^\/]+)');
                pattern = pattern.replace(regularExpressions.splatParam, '(.+?)');
                // /account\/register\/?$/i
                // /^/\#/bar$/i

                return new Route({
                    expressionString: pattern,
                    paramNames: params,
                    path: path
                }, caseSensitive);
            };

            parseParams = function (path, route) {
                var params = {},
                    matches,
                    i;

                matches = path.match(route.expression);

                if (is.not.array(matches) || matches.length === 1) {
                    params.splat = [];
                    return params;
                }

                matches.shift();
                params.splat = matches;

                for (i = 0; i < route.paramNames.length; i += 1) {
                    params[route.paramNames[i].replace(/:/g, '')] = params.splat[i];
                }

                return params;
            };

            self.get = self.get || function (path, callback) {
                return addRoute('get', path, callback);
            };

            self.post = self.post || function (path, callback) {
                return addRoute('post', path, callback);
            };

            self.put = self.put || function (path, callback) {
                return addRoute('put', path, callback);
            };

            self.del = self.del || function (path, callback) {
                return addRoute('del', path, callback);
            };

            validatePipelineEventCallback = function (callback) {
                if (is.not.function(callback)) {
                    executeErrorPipeline({ status: 500, message: 'A callback function is required to regiseter a pipeline event' });
                    return false;
                }

                return true;
            };

            self.beforeRouteResolution = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 2) {
                    pipelineEvents.beforeRouteResolution.push(function (path, next) {
                        callback(path);
                        next(null, path);
                    });
                } else {
                    pipelineEvents.beforeRouteResolution.push(callback);
                }
            };

            self.afterRouteResolution = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    pipelineEvents.afterRouteResolution.push(function (err, route, next) {
                        callback(err, route);
                        next(null, route);
                    });
                } else {
                    pipelineEvents.afterRouteResolution.push(callback);
                }
            };

            self.before = function (callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }

                if (callback.length < 3) {
                    pipelineEvents.before.push(function (err, response, next) {
                        callback(err, response);
                        next(null, response);
                    });
                } else {
                    pipelineEvents.before.push(callback);
                }
            };

            self.after = function (callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.after.push(callback);
                }
            };

            self.onError = function (callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.error.push(callback);
                }
            };

            makePipelineTasks = function (pipeline, last) {
                var i,
                    tasks = [],
                    makeTask = function (i) {
                        return  function (err, response) {
                            if (pipeline.length === i) {
                                if (is.function(last)) {
                                    last(err, response);
                                }
                            } else {
                                pipeline[i](err, response, makeTask((i + 1)));
                            }
                        };
                    };

                for (i = 0; i < pipeline.length; i += 1) {
                    tasks.push(makeTask(i));
                }

                return tasks;
            };

            executeBeforePipeline = function (err, response, next) {
                var tasks = makePipelineTasks(pipelineEvents.before, next);

                if (tasks.length) {
                    tasks[0](err, response);
                } else {
                    next(err, response);
                }
            };

            executeAfterPipeline = function (err, response) {
                var tasks = makePipelineTasks(pipelineEvents.after);

                if (tasks.length) {
                    tasks[0](err, response);
                }
            };

            executeErrorPipeline = function (errorObject) {
                var i;
                for (i = 0; i < pipelineEvents.error.length; i += 1) {
                    pipelineEvents.error[i](errorObject);
                }
            };

            executeBeforeRouteResolution = function (path, next) {
                var tasks = makePipelineTasks(pipelineEvents.beforeRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, path);
                } else {
                    next(null, path);
                }
            };

            executeAfterRouteResolution = function (route, next) {
                var tasks = makePipelineTasks(pipelineEvents.afterRouteResolution, next);

                if (tasks.length) {
                    tasks[0](null, route);
                } else {
                    next(null, route);
                }
            };

            self.resolveRoute = function (path) {
                var i,
                    matchingRoute;

                for (i = 0; i < routes.length; i += 1) {
                    if (routes[i].route.expression.test(path)) {
                        matchingRoute = routes[i];
                        break;
                    }
                }

                if (matchingRoute) {
                    matchingRoute.params = parseParams(path, matchingRoute.route);
                    return matchingRoute;
                } else {
                    return false;
                }
            };

            self.resolveAndExecuteRoute = function (path) {
                var beforeThis,
                    main,
                    afterThis,
                    route;

                beforeThis = function () {
                    executeBeforeRouteResolution(path, main);
                };

                main = function (err, path) {
                    if (err) {
                        executeErrorPipeline(err);
                        return;
                    }

                    route = self.resolveRoute(path);

                    if (route === false) {
                        err = { status: 404, message: locale.errors.status404, path: path };
                        executeErrorPipeline(err);
                    } else if (is.function(route.callback)) {
                        afterThis(route);
                    }
                };

                afterThis = function (route) {
                    executeAfterRouteResolution(route, route.callback);
                };

                // RUN
                beforeThis();
            };

            return self;
        };

        return RouteEngine;
    }
});
