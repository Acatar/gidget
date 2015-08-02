Hilary.scope('gidget').register({
    name: 'BaseRouteEngine',
    dependencies: ['Route', 'GidgetResponse', 'GidgetPipeline', 'is', 'uriHelper', 'locale', 'exceptions'],
    factory: function (Route, GidgetResponse, GidgetPipeline, is, uriHelper, locale, exceptions) {
        'use strict';

        var RouteEngine = function (router) {
            var self,
                pipeline = new GidgetPipeline(),
                routes = [],
                regularExpressions,
                makeAsyncCallback,
                makeRouteExecutionQueue,
                addRoute,
                parseRoute,
                parseParams;

            router = router || {};

            self = {
                get: router.get,
                post: router.post,
                put: router.put,
                del: router.del,
                navigate: router.navigate,
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
                return function (err, response) {
                    var beforeThis,
                        beforeAll,
                        main,
                        afterThis,
                        afterAll;

                    beforeThis = function () {
                        if (is.function(callback.before)) {
                            callback.before(null, response, beforeAll);
                        } else {
                            beforeAll(null, response);
                        }
                    };

                    beforeAll = function (err, response) {
                        pipeline.trigger.before.routeExecution(err, response, main);
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
                        pipeline.trigger.after.routeExecution(err, response);
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

            // thanks Simrou!
            parseRoute = function (verb, path, caseSensitive) {
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

            self.resolveRoute = function (path) {
                var uri = uriHelper.parseUri(path),
                    i,
                    matchingRoute,
                    params;

                for (i = 0; i < routes.length; i += 1) {
                    if (routes[i].route.expression.test(uri.path)) {
                        matchingRoute = routes[i];
                        break;
                    }
                }

                if (matchingRoute) {
                    params = parseParams(uri.path, matchingRoute.route);
                    return new GidgetResponse({
                        route: matchingRoute.route,
                        params: params,
                        uri: uri,
                        callback: matchingRoute.callback
                    });
                } else {
                    return false;
                }
            };

            self.resolveAndExecuteRoute = function (path) {
                var uri = uriHelper.parseUri(path),
                    beforeThis,
                    main,
                    afterThis,
                    response;

                beforeThis = function () {
                    pipeline.trigger.before.routeResolution(uri, main);
                };

                main = function (err, uri) {
                    if (err) {
                        pipeline.trigger.on.error(err);
                        return;
                    }

                    response = self.resolveRoute(uri);

                    if (response === false) {
                        err = { status: 404, message: locale.errors.status404, uri: uri };
                        pipeline.trigger.on.error(err);
                    } else if (is.function(response.callback)) {
                        afterThis(response);
                    }
                };

                afterThis = function (response) {
                    pipeline.trigger.after.routeResolution(null, response, response.callback);
                };

                // RUN
                beforeThis();
            };

            return self;
        };

        return RouteEngine;
    }
});
