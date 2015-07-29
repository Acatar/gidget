Hilary.scope('gidget').register({
    name: 'SammyRouteEngine',
    dependencies: ['BaseRouteEngine', 'is', 'locale', 'exceptions'],
    factory: function (RouteEngine, is, locale, exceptions) {
        'use strict';

        var SammyRouteEngine = function (sammyInstance) {
            var sammy = sammyInstance,
                routeEngine,
                baseAddRoute,
                addRoute;

            routeEngine = new RouteEngine({
                start: function () {
                    sammy.run();
                }
            });

            baseAddRoute = function (verb, path, callback) {
                var newCallback,
                    route;

                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace('{func}', 'addRoute').replace('{args}', '(verb, path, callback)'));
                }

                route = routeEngine.parseRoute(path);

                newCallback = function (params) {
                    var proceed = true;

                    if (is.function(callback.before)) {
                        proceed = callback.before(params);
                    }

                    if (proceed === false) {
                        return;
                    }

                    routeEngine.executeBeforePipeline(verb, path, params);
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

                    routeEngine.executeAfterPipeline(verb, path, params);
                };

                return {
                    route: route,
                    callback: newCallback
                };
            };

            addRoute = function (verb, path, callback) {
                var baseRoute = routeEngine.addRoute(verb, path, callback);
                sammy.route(verb, baseRoute.route.expression, baseRoute.callback);
            };

            routeEngine.get = function (path, callback) {
                addRoute('get', path, callback);
            };

            routeEngine.post = function (path, callback) {
                addRoute('post', path, callback);
            };

            routeEngine.put = function (path, callback) {
                addRoute('put', path, callback);
            };

            routeEngine.del = function (path, callback) {
                addRoute('del', path, callback);
            };

            routeEngine.navigate = function (hash, updateUrlBar) {
                if (updateUrlBar === undefined) {
                    updateUrlBar = true;
                }

                if (updateUrlBar) {
                    location.hash = hash;
                } else {
                    throw new Error('Navigating without updating the URL bar is not implemented');
                }
            };

            return routeEngine;
        };

        return SammyRouteEngine;
    }
});
