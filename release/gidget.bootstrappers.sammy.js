/*! gidget-builder 2015-07-27 */
Hilary.scope("GidgetContainer").register({
    name: "bootstrappers.sammy",
    factory: function() {
        "use strict";
        var sammyRouter, compose, parseParams;
        parseParams = function(path, params) {
            if (typeof path === "string") {
                var paramNames = path.match(/:([^\/]*)/g), i;
                for (i = 0; i < paramNames.length; i += 1) {
                    params[paramNames[i].replace(/:/g, "")] = params.splat[i];
                }
            }
            return params;
        };
        sammyRouter = function(sammy, RouteEngine, options) {
            var router, addNewRoute, config = options || {};
            addNewRoute = function(verb, path, callback) {
                var eventedCallback, newPath;
                newPath = config.useGidgetRouting ? router.parseRoute(path).expression : path;
                eventedCallback = function(context) {
                    var proceed = true, params = parseParams(path, context.params);
                    if (typeof callback.before === "function") {
                        proceed = callback.before(verb, path, params);
                    }
                    if (proceed === false) {
                        return;
                    }
                    router.executePipeline(router.pipelineRegistries.before, verb, path, params);
                    callback(params);
                    if (typeof callback.after === "function") {
                        callback.after(verb, path, params);
                    }
                    router.executePipeline(router.pipelineRegistries.after, verb, path, params);
                };
                sammy.route(verb, newPath, eventedCallback);
            };
            router = new RouteEngine({
                get: function(path, callback) {
                    return addNewRoute("get", path, callback);
                },
                post: function(path, callback) {
                    return addNewRoute("post", path, callback);
                },
                put: function(path, callback) {
                    return addNewRoute("put", path, callback);
                },
                del: function(path, callback) {
                    return addNewRoute("delete", path, callback);
                },
                any: function(path, callback) {
                    return addNewRoute("any", path, callback);
                },
                start: function() {
                    sammy.run();
                },
                navigate: function(hash, updateUrlBar) {
                    if (updateUrlBar === undefined) {
                        updateUrlBar = true;
                    }
                    if (updateUrlBar) {
                        location.hash = hash;
                    } else {
                        throw new Error("Navigating without updating the URL bar is not implemented");
                    }
                }
            });
            return router;
        };
        compose = function(RouteEngine, options, callback) {
            options.useGidgetRouting = options.useGidgetRouting === undefined ? true : options.useGidgetRouting;
            return callback(sammyRouter(options.router, RouteEngine, options));
        };
        return {
            compose: compose
        };
    }
});