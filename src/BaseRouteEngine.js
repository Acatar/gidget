Hilary.scope('gidget').register({
    name: 'BaseRouteEngine',
    dependencies: ['Route', 'GidgetRequest', 'GidgetPipeline', 'is', 'uriHelper', 'locale', 'exceptions'],
    factory: function (Route, GidgetRequest, GidgetPipeline, is, uriHelper, locale, exceptions) {
        'use strict';

        var RouteEngine = function (router) {
            var self,
                pipeline = new GidgetPipeline(),
                routes = [],
                regularExpressions,
                makeAsyncCallback,
                makeRouteExecutionQueue,
                addRoute,
                cleanseParamNames,
                parseRoute,
                parseParams;

            router = router || {};

            self = {
                get: router.get,
                post: router.post,
                put: router.put,
                del: router.del,
                navigate: router.navigate,
                register: {
                    get: undefined,
                    post: undefined,
                    put: undefined,
                    del: undefined
                },
                parseRoute: undefined,
                resolveRoute: undefined,
                resolveAndExecuteRoute: undefined,
                start: router.start,
                pipeline: pipeline
            };

            regularExpressions = {
                escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
                namedParam: /:(\w+)/g,
                splatParam: /\*(\w+)/g,
                firstParam: /(:\w+)|(\*\w+)/,
                allParams: /(:|\*)\w+/g,
                extractHash: /^[^#]*(#.*)$/
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

            makeRouteExecutionQueue = function (callback) {
                return function (err, request) {
                    var beforeThis,
                        beforeAll,
                        main,
                        afterThis,
                        afterAll;

                    beforeThis = function () {
                        if (is.function(callback.before)) {
                            callback.before(null, request, beforeAll);
                        } else {
                            beforeAll(null, request);
                        }
                    };

                    beforeAll = function (err, request) {
                        pipeline.trigger.before.routeExecution(err, request, main);
                    };

                    main = function (err, request) {
                        callback(err, request, afterThis);
                    };

                    afterThis = function (err, request) {
                        if (is.function(callback.after)) {
                            callback.after(err, request, afterAll);
                        } else {
                            afterAll(err, request);
                        }
                    };

                    afterAll = function (err, request) {
                        pipeline.trigger.after.routeExecution(err, request);
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
                    route: parseRoute(verb, path),
                    callback: makeRouteExecutionQueue(makeAsyncCallback(callback))
                });
            };

            cleanseParamNames = function (names) {
                if (names !== null) {
                    var paramNames = [], i;

                    for (i = 0; i < names.length; i += 1) {
                        // remove the leading colon
                        paramNames.push(names[i].substr(1));
                    }

                    return paramNames;
                } else {
                    return [];
                }
            };

            // thanks Simrou!
            parseRoute = function (verb, path, caseSensitive) {
                var params,
                    pattern;

                pattern = String(path);
                params = cleanseParamNames(pattern.match(regularExpressions.allParams));
                pattern = pattern.replace(regularExpressions.escapeRegExp, '\\$&');
                pattern = pattern.replace(regularExpressions.namedParam, '([^\/]+)');
                pattern = pattern.replace(regularExpressions.splatParam, '(.+?)');
                // /account\/register\/?$/i
                // /^/\#/bar$/i

                return new Route({
                    expressionString: pattern,
                    paramNames: params,
                    verb: verb,
                    source: path
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
                    params[route.paramNames[i]] = params.splat[i];
                }

                return params;
            };

            self.register.get = self.get || function (path, callback) {
                return addRoute('get', path, callback);
            };

            self.register.post = self.post || function (path, callback) {
                return addRoute('post', path, callback);
            };

            self.register.put = self.put || function (path, callback) {
                return addRoute('put', path, callback);
            };

            self.register.del = self.del || function (path, callback) {
                return addRoute('del', path, callback);
            };

            self.resolveRoute = function (path, verb) {
                var uri = uriHelper.parseUri(path),
                    makeRequest,
                    i;

                makeRequest = function (uri, matchingRoute) {
                    return new GidgetRequest({
                        route: matchingRoute.route,
                        params: parseParams(uri.path, matchingRoute.route),
                        uri: uri,
                        callback: matchingRoute.callback
                    });
                };

                for (i = 0; i < routes.length; i += 1) {
                    if (routes[i].route.expression.test(uri.path)) {
                        if (!verb) {
                            return makeRequest(uri, routes[i]);
                        } else if (routes[i].route.verb === verb) {
                            return makeRequest(uri, routes[i]);
                        }
                    }
                }

                return false;
            };

            self.resolveAndExecuteRoute = function (path, verb, callback) {
                var uri = uriHelper.parseUri(path),
                    beforeThis,
                    main,
                    afterThis,
                    request;

                beforeThis = function () {
                    pipeline.trigger.before.routeResolution(new GidgetRequest({ uri: uri }), main);
                };

                main = function (err, req) {
                    if (err) {
                        pipeline.trigger.on.error(err);
                        return;
                    }

                    request = self.resolveRoute(req.uri, verb);

                    if (request === false) {
                        err = { status: 404, message: locale.errors.status404, uri: uri };
                        pipeline.trigger.on.error(err);
                    } else if (is.function(request.callback)) {
                        afterThis(request);
                    }
                };

                afterThis = function (request) {
                    pipeline.trigger.after.routeResolution(null, request, request.callback);

                    if (is.function (callback)) {
                        callback(request);
                    }
                };

                // RUN
                beforeThis();
            };

            self.get = function (path, callback) {
                return self.resolveAndExecuteRoute(path, 'get', callback);
            };

            self.post = function (path, callback) {
                return self.resolveAndExecuteRoute(path, 'post', callback);
            };

            self.put = function (path, callback) {
                return self.resolveAndExecuteRoute(path, 'put', callback);
            };

            self.del = function (path, callback) {
                return self.resolveAndExecuteRoute(path, 'del', callback);
            };

            return self;
        };

        return RouteEngine;
    }
});
