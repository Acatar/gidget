Hilary.scope('gidget').register({
    name: 'BaseRouteEngine',
    dependencies: ['is', 'locale', 'exceptions'],
    factory: function (is, locale, exceptions) {
        'use strict';

        var RouteEngine = function (router) {
            var self,
            regularExpressions,
            routes = [],
            pipelineEvents,
            executePipeline,
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
                before: router.before,
                after: router.after,
                executeBeforePipeline: undefined,
                executeAfterPipeline: undefined,
                parseRoute: undefined,
                resolveRoute: undefined,
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
                before: [],
                after: []
            };

            executePipeline = function (pipelineToExecute, verb, path, params, event) {
                var i;
                for (i = 0; i < pipelineToExecute.length; i += 1) {
                    pipelineToExecute[i](verb, path, params, event);
                }
            };

            addRoute = function (verb, path, callback) {
                var newCallback,
                    route;

                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace('{func}', 'addRoute').replace('{args}', '(verb, path, callback)'));
                }

                route = parseRoute(path);

                newCallback = function (params) {
                    var proceed = true;

                    if (is.function(callback.before)) {
                        proceed = callback.before(params);
                    }

                    if (proceed === false) {
                        return;
                    }

                    self.executeBeforePipeline(verb, path, params);
                    proceed = callback(params);

                    if (proceed === false) {
                        return;
                    }

                    if (is.function(callback.after)) {
                        proceed = callback.after(params);
                    }

                    if (proceed === false) {
                        return;
                    }

                    self.executeAfterPipeline(verb, path, params);
                };

                routes.push({
                    route: route,
                    callback: newCallback
                });
            };

            // thanks Simrou!
            parseRoute = function (pattern, caseSensitive) {
                var flags,
                    name,
                    names,
                    params;

                pattern = String(pattern);
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
                flags = caseSensitive ? '' : 'i';
                // /account\/register\/?$/i
                // /^/\#/bar$/i
                return {
                    expression: new RegExp('^' + pattern + '\/?$', flags),
                    params: params,
                    pattern: pattern
                };
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

                for (i = 0; i < route.params.length; i += 1) {
                    params[route.params[i].replace(/:/g, '')] = params.splat[i];
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

            self.before = self.before || function (callback) {
                if (typeof callback === 'function') {
                    pipelineEvents.before.push(callback);
                }
            };

            self.after = self.after || function (callback) {
                if (typeof callback === 'function') {
                    pipelineEvents.after.push(callback);
                }
            };

            self.executeBeforePipeline = function (verb, path, params, event) {
                executePipeline(pipelineEvents.before, verb, path, params, event);
            };

            self.executeAfterPipeline = function (verb, path, params, event) {
                executePipeline(pipelineEvents.after, verb, path, params, event);
            };

            self.parseRoute = parseRoute;

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

            return self;
        };

        return RouteEngine;
    }
});
