Hilary.scope('gidget').register({
    name: 'RouteEngine',
    dependencies: ['IRouteEngineBootstrapper', 'argumentValidator', 'is', 'locale', 'exceptions'],
    factory: function (IRouteEngineBootstrapper, argumentValidator, is, locale, exceptions) {
        'use strict';

        var RouteEngine = function (router) {
            var self,
            regularExpressions,
            routes = [],
            pipelineEvents,
            executePipeline,
            addRoute,
            parseRoute,
            parseParams,
            getHash;

            if (!argumentValidator.valdate(IRouteEngineBootstrapper, router)) {
                return;
            }

            self = {
                get: router.get,
                post: router.post,
                put: router.put,
                del: router.del,
                navigate: undefined,
                before: router.before,
                after: router.after,
                executeBeforePipeline: undefined,
                executeAfterPipeline: undefined,
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
                    route,
                    params;

                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace('{func}', 'addRoute').replace('{args}', '(verb, path, callback)'));
                }

                route = parseRoute(path);

                newCallback = function (context) {
                    var proceed = true,
                        params = parseParams(path, context.params);

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

            parseParams = function (path, params) {
                if (typeof path === 'string') {
                    var paramNames = path.match(/:([^\/]*)/g),
                        i;

                    if (paramNames === null || paramNames.length < 1) {
                        return params;
                    }

                    for (i = 0; i < paramNames.length; i += 1) {
                        params[paramNames[i].replace(/:/g, '')] = params.splat[i];
                    }
                }

                return params;
            };

            getHash = function () {
                return String(location.hash).replace(regularExpressions.extractHash, '$1');
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

            self.navigate = function (path, pushStateToHistory) {
                // router.navigate
            };

            return self;
        };

        return RouteEngine;
    }
});
