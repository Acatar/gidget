/*! gidget-builder 2015-08-02 */
var Hilary = require("hilary");

Hilary.scope("gidget").register({
    name: "IGidget",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IGidget",
            GidgetModule: "function",
            GidgetRoute: {
                type: "function",
                args: [ "route" ]
            },
            Bootstrapper: {
                type: "function",
                args: [ "scope", "bootstrapper" ]
            }
        });
    }
});

Hilary.scope("gidget").register({
    name: "IGidgetApp",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IGidgetApp",
            start: "function",
            routeEngine: "object",
            pipeline: "object",
            registerModule: {
                type: "function",
                args: [ "gidgetModule" ]
            },
            registerModules: {
                type: "function",
                args: [ "gidgetModules" ]
            }
        });
    }
});

Hilary.scope("gidget").register({
    name: "IGidgetModule",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IGidgetModule",
            get: "object",
            post: "object",
            put: "object",
            del: "object",
            any: "object"
        });
    }
});

Hilary.scope("gidget").register({
    name: "IGidgetRoute",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IGidgetRoute",
            routeHandler: "function"
        });
    }
});

Hilary.scope("gidget").register({
    name: "IRouteEngine",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IRouteEngine",
            get: {
                type: "function",
                args: [ "path", "callback" ]
            },
            post: {
                type: "function",
                args: [ "path", "callback" ]
            },
            put: {
                type: "function",
                args: [ "path", "callback" ]
            },
            del: {
                type: "function",
                args: [ "path", "callback" ]
            },
            navigate: {
                type: "function",
                args: [ "path", "data", "pushStateToHistory" ]
            },
            start: "function",
            resolveRoute: {
                type: "function",
                args: [ "path" ]
            },
            resolveAndExecuteRoute: {
                type: "function",
                args: [ "path" ]
            },
            dispose: "function",
            pipeline: "object"
        });
    }
});

Hilary.scope("gidget").register({
    name: "locale",
    factory: {
        errors: {
            requiresArguments: "The {func} function requires arguments {args}",
            pipelineRequiresCallback: "A callback function is required to register a pipeline event",
            parseUriRequiresUriString: "A uriString is required to parse a URI",
            status404: "Not Found!",
            interfaces: {
                requiresImplementation: "A valid implementation is required to create a new instance of an interface",
                requiresProperty: "The implementation is missing a required property: ",
                requiresArguments: "The implementation of this function requires the arguments: ",
                notAnIRouteEngine: "The router instance that was passed into the RouteEngine constructor does not implement IRouteEngine",
                notAnIGidgetApp: "The gidgetApp instance that were passed into the GidgetApp constructor does not implement IGidgetApp",
                notAnIGidgetModule: "The module that you are trying to register does not implement IGidgetModule",
                missingOptions: "To create a Gidget instance, you must provide the minimum required options"
            }
        }
    }
});

Hilary.scope("gidget").register({
    name: "argumentValidator",
    dependencies: [ "locale", "exceptions" ],
    factory: function(locale, exceptions) {
        "use strict";
        return {
            validate: function(blueprint, argument) {
                var isValid = blueprint.syncSignatureMatches(argument), i;
                if (isValid.result) {
                    return true;
                } else {
                    for (i = 0; i < isValid.errors.length; i += 1) {
                        exceptions.throwArgumentException(isValid.errors[i]);
                    }
                    return isValid;
                }
            }
        };
    }
});

Hilary.scope("gidget").register({
    name: "ExceptionHandler",
    dependencies: [],
    factory: function(onError) {
        "use strict";
        var self = {
            makeException: undefined,
            argumentException: undefined,
            throwArgumentException: undefined,
            notImplementedException: undefined,
            throwNotImplementedException: undefined,
            fetchException: undefined,
            throwFetchException: undefined,
            throwException: undefined,
            "throw": undefined
        }, makeException;
        onError = typeof onError === "function" ? onError : function(exception) {
            console.error(exception);
            throw exception;
        };
        makeException = function(name, message, data) {
            var msg, err;
            if (typeof name === "object" && typeof name.message === "string") {
                msg = name.message;
                err = name;
            } else {
                msg = typeof message === "string" ? message : name;
                err = new Error(msg);
            }
            err.message = msg;
            if (name !== msg) {
                err.name = name;
            }
            if (data) {
                err.data = data;
            }
            return err;
        };
        self.makeException = makeException;
        self.argumentException = function(message, argument, data) {
            var msg = typeof argument === "undefined" ? message : message + " (argument: " + argument + ")";
            return makeException("ArgumentException", msg, data);
        };
        self.throwArgumentException = function(message, argument, data) {
            self.throw(self.argumentException(message, argument, data));
        };
        self.notImplementedException = function(message, data) {
            return makeException("NotImplementedException", message, data);
        };
        self.throwNotImplementedException = function(message, data) {
            self.throw(self.notImplementedException(message, data));
        };
        self.fetchException = function(response) {
            response = response || {};
            response.status = response.status || "unknown";
            return makeException("FetchException", "Server Request Failed with status: " + response.status, response);
        };
        self.throwFetchException = function(response) {
            self.throw(self.fetchException(response));
            throw new Error("Server Request Failed with status: " + response.status);
        };
        self.throwException = function(exception) {
            self.throw(exception);
        };
        self.throw = function(exception) {
            if (typeof exception === "string") {
                onError(makeException(exception));
            } else {
                onError(exception);
            }
        };
        return self;
    }
});

Hilary.scope("gidget").register({
    name: "GidgetApp",
    dependencies: [ "IGidgetModule", "argumentValidator", "is" ],
    factory: function(IGidgetModule, argumentValidator, is) {
        "use strict";
        var GidgetApp = function(routeEngine) {
            var self = {
                start: undefined,
                pipelines: {},
                registerModule: undefined,
                registerModules: undefined
            };
            self.start = routeEngine.start;
            self.routeEngine = routeEngine;
            self.pipeline = routeEngine.pipeline;
            self.registerModule = function(gidgetModule) {
                if (!argumentValidator.validate(IGidgetModule, gidgetModule)) {
                    return;
                }
                var gets = gidgetModule.get, puts = gidgetModule.put, posts = gidgetModule.posts, dels = gidgetModule.dels, get, put, post, del;
                for (get in gets) {
                    if (gets.hasOwnProperty(get)) {
                        routeEngine.get(get, gets[get]);
                    }
                }
                for (put in puts) {
                    if (puts.hasOwnProperty(put)) {
                        routeEngine.put(put, puts[put]);
                    }
                }
                for (post in posts) {
                    if (posts.hasOwnProperty(post)) {
                        routeEngine.post(post, posts[post]);
                    }
                }
                for (del in dels) {
                    if (dels.hasOwnProperty(del)) {
                        routeEngine.del(del, dels[del]);
                    }
                }
            };
            self.registerModules = function(gidgetModules) {
                if (is.array(gidgetModules)) {
                    var i;
                    for (i = 0; i < gidgetModules.length; i += 1) {
                        self.registerModule(gidgetModules[i]);
                    }
                }
            };
            return self;
        };
        return GidgetApp;
    }
});

Hilary.scope("gidget").register({
    name: "GidgetModule",
    dependencies: [],
    factory: function() {
        "use strict";
        return function() {
            var self = {};
            self.get = {};
            self.post = {};
            self.put = {};
            self.del = {};
            self.any = {};
            return self;
        };
    }
});

Hilary.scope("gidget").register({
    name: "GidgetPipeline",
    dependencies: [ "is", "locale" ],
    factory: function(is, locale) {
        "use strict";
        var Pipeline = function() {
            var self, pipelineEvents, makePipelineTasks, validatePipelineEventCallback;
            self = {
                before: {
                    routeResolution: undefined,
                    routeExecution: undefined
                },
                after: {
                    routeResolution: undefined,
                    routeExecution: undefined
                },
                on: {
                    error: undefined
                },
                trigger: {
                    before: {
                        routeResolution: undefined,
                        routeExecution: undefined
                    },
                    after: {
                        routeResolution: undefined,
                        routeExecution: undefined
                    },
                    on: {
                        error: undefined
                    }
                }
            };
            pipelineEvents = {
                beforeRouteResolution: [],
                afterRouteResolution: [],
                before: [],
                after: [],
                error: []
            };
            validatePipelineEventCallback = function(callback) {
                if (is.not.function(callback)) {
                    self.trigger.on.error({
                        status: 500,
                        message: locale.errors.pipelineRequiresCallback
                    });
                    return false;
                }
                return true;
            };
            makePipelineTasks = function(pipeline, last) {
                var i, tasks = [], makeTask = function(i) {
                    return function(err, response) {
                        if (pipeline.length === i) {
                            if (is.function(last)) {
                                last(err, response);
                            }
                        } else {
                            pipeline[i](err, response, makeTask(i + 1));
                        }
                    };
                };
                for (i = 0; i < pipeline.length; i += 1) {
                    tasks.push(makeTask(i));
                }
                return tasks;
            };
            self.trigger.before.routeExecution = function(err, response, next) {
                var tasks = makePipelineTasks(pipelineEvents.before, next);
                if (tasks.length) {
                    tasks[0](err, response);
                } else {
                    next(err, response);
                }
            };
            self.trigger.after.routeExecution = function(err, response) {
                var tasks = makePipelineTasks(pipelineEvents.after);
                if (tasks.length) {
                    tasks[0](err, response);
                }
            };
            self.trigger.on.error = function(errorObject) {
                var i;
                for (i = 0; i < pipelineEvents.error.length; i += 1) {
                    pipelineEvents.error[i](errorObject);
                }
            };
            self.trigger.before.routeResolution = function(uri, next) {
                var tasks = makePipelineTasks(pipelineEvents.beforeRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, uri);
                } else {
                    next(null, uri);
                }
            };
            self.trigger.after.routeResolution = function(err, response, next) {
                var tasks = makePipelineTasks(pipelineEvents.afterRouteResolution, next);
                if (tasks.length) {
                    tasks[0](err, response);
                } else {
                    next(err, response);
                }
            };
            self.before.routeResolution = function(callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }
                if (callback.length < 2) {
                    pipelineEvents.beforeRouteResolution.push(function(path, next) {
                        callback(path);
                        next(null, path);
                    });
                } else {
                    pipelineEvents.beforeRouteResolution.push(callback);
                }
            };
            self.after.routeResolution = function(callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }
                if (callback.length < 3) {
                    pipelineEvents.afterRouteResolution.push(function(err, route, next) {
                        callback(err, route);
                        next(null, route);
                    });
                } else {
                    pipelineEvents.afterRouteResolution.push(callback);
                }
            };
            self.before.routeExecution = function(callback) {
                if (!validatePipelineEventCallback(callback)) {
                    return;
                }
                if (callback.length < 3) {
                    pipelineEvents.before.push(function(err, response, next) {
                        callback(err, response);
                        next(null, response);
                    });
                } else {
                    pipelineEvents.before.push(callback);
                }
            };
            self.after.routeExecution = function(callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.after.push(callback);
                }
            };
            self.on.error = function(callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.error.push(callback);
                }
            };
            return self;
        };
        return Pipeline;
    }
});

Hilary.scope("gidget").register({
    name: "GidgetResponse",
    dependencies: [ "is" ],
    factory: function(is) {
        "use strict";
        return function(context) {
            var self = this, ctx;
            if (is.string(context)) {
                ctx = {};
            } else {
                ctx = context || {};
            }
            self.uri = context.uri;
            self.route = context.route;
            self.params = context.params;
            self.callback = context.callback;
        };
    }
});

Hilary.scope("gidget").register({
    name: "GidgetRoute",
    dependencies: [ "IGidgetRoute", "argumentValidator" ],
    factory: function(IGidgetRoute, argumentValidator) {
        "use strict";
        return function(route) {
            if (!argumentValidator.validate(IGidgetRoute, route)) {
                return;
            }
            var self = route.routeHandler;
            if (typeof route.before === "function") {
                self.before = route.before;
            }
            if (typeof route.after === "function") {
                self.after = route.after;
            }
            return self;
        };
    }
});

Hilary.scope("gidget").register({
    name: "BaseRouteEngine",
    dependencies: [ "Route", "GidgetResponse", "GidgetPipeline", "is", "uriHelper", "locale", "exceptions" ],
    factory: function(Route, GidgetResponse, GidgetPipeline, is, uriHelper, locale, exceptions) {
        "use strict";
        var RouteEngine = function(router) {
            var self, pipeline = new GidgetPipeline(), routes = [], regularExpressions, makeAsyncCallback, makeRouteExecutionQueue, addRoute, parseRoute, parseParams;
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
            makeAsyncCallback = function(callback) {
                if (is.function(callback) && callback.length < 3) {
                    var asyncCallback = function(err, params, next) {
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
            makeRouteExecutionQueue = function(callback) {
                return function(err, response) {
                    var beforeThis, beforeAll, main, afterThis, afterAll;
                    beforeThis = function() {
                        if (is.function(callback.before)) {
                            callback.before(null, response, beforeAll);
                        } else {
                            beforeAll(null, response);
                        }
                    };
                    beforeAll = function(err, response) {
                        pipeline.trigger.before.routeExecution(err, response, main);
                    };
                    main = function(err, response) {
                        callback(err, response, afterThis);
                    };
                    afterThis = function(err, response) {
                        if (is.function(callback.after)) {
                            callback.after(err, response, afterAll);
                        } else {
                            afterAll(err, response);
                        }
                    };
                    afterAll = function(err, response) {
                        pipeline.trigger.after.routeExecution(err, response);
                    };
                    beforeThis();
                };
            };
            addRoute = function(verb, path, callback) {
                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace("{func}", "addRoute").replace("{args}", "(verb, path, callback)"));
                }
                routes.push({
                    route: parseRoute(verb, path),
                    callback: makeRouteExecutionQueue(makeAsyncCallback(callback))
                });
            };
            parseRoute = function(verb, path, caseSensitive) {
                var name, names, params, pattern;
                pattern = String(path);
                names = pattern.match(regularExpressions.allParams);
                if (names !== null) {
                    params = function() {
                        var i, len, results;
                        results = [];
                        for (i = 0, len = names.length; i < len; i += 1) {
                            name = names[i];
                            results.push(name.substr(1));
                        }
                        return results;
                    }();
                } else {
                    params = [];
                }
                pattern = pattern.replace(regularExpressions.escapeRegExp, "\\$&");
                pattern = pattern.replace(regularExpressions.namedParam, "([^/]+)");
                pattern = pattern.replace(regularExpressions.splatParam, "(.+?)");
                return new Route({
                    expressionString: pattern,
                    paramNames: params,
                    verb: verb,
                    source: path
                }, caseSensitive);
            };
            parseParams = function(path, route) {
                var params = {}, matches, i;
                matches = path.match(route.expression);
                if (is.not.array(matches) || matches.length === 1) {
                    params.splat = [];
                    return params;
                }
                matches.shift();
                params.splat = matches;
                for (i = 0; i < route.paramNames.length; i += 1) {
                    params[route.paramNames[i].replace(/:/g, "")] = params.splat[i];
                }
                return params;
            };
            self.get = self.get || function(path, callback) {
                return addRoute("get", path, callback);
            };
            self.post = self.post || function(path, callback) {
                return addRoute("post", path, callback);
            };
            self.put = self.put || function(path, callback) {
                return addRoute("put", path, callback);
            };
            self.del = self.del || function(path, callback) {
                return addRoute("del", path, callback);
            };
            self.resolveRoute = function(path) {
                var uri = uriHelper.parseUri(path), i, matchingRoute, params;
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
            self.resolveAndExecuteRoute = function(path) {
                var uri = uriHelper.parseUri(path), beforeThis, main, afterThis, response;
                beforeThis = function() {
                    pipeline.trigger.before.routeResolution(uri, main);
                };
                main = function(err, uri) {
                    if (err) {
                        pipeline.trigger.on.error(err);
                        return;
                    }
                    response = self.resolveRoute(uri);
                    if (response === false) {
                        err = {
                            status: 404,
                            message: locale.errors.status404,
                            uri: uri
                        };
                        pipeline.trigger.on.error(err);
                    } else if (is.function(response.callback)) {
                        afterThis(response);
                    }
                };
                afterThis = function(response) {
                    pipeline.trigger.after.routeResolution(null, response, response.callback);
                };
                beforeThis();
            };
            return self;
        };
        return RouteEngine;
    }
});

(function(Hilary, history) {
    "use strict";
    Hilary.scope("gidget").register({
        name: "DefaultRouteEngine",
        dependencies: [ "BaseRouteEngine", "is", "uriHelper" ],
        factory: function(RouteEngine, is, uriHelper) {
            var start, onLoad, addEventListeners, clickHandler, popstateHandler, routeEngine;
            start = function() {
                addEventListeners();
                onLoad();
            };
            onLoad = function() {
                routeEngine.navigate(location.href);
            };
            clickHandler = function(event) {
                if (is.string(event.target.localName) && event.target.localName === "a") {
                    event.preventDefault();
                    routeEngine.navigate(event.target.href);
                }
            };
            popstateHandler = function(event) {
                if (is.string(event.state)) {
                    event.preventDefault();
                    routeEngine.navigate(event.state, null, false);
                } else if (is.object(event.state) && is.defined(event.state.path)) {
                    event.preventDefault();
                    routeEngine.navigate(event.state.path);
                }
            };
            addEventListeners = function() {
                document.addEventListener("click", clickHandler, false);
                window.addEventListener("popstate", popstateHandler, false);
            };
            routeEngine = new RouteEngine({
                start: start
            });
            routeEngine.navigate = function(path, data, pushStateToHistory) {
                var state = data || {}, uri = uriHelper.parseUri(path);
                if (is.not.defined(pushStateToHistory)) {
                    pushStateToHistory = true;
                }
                if (!uri.host || uri.host === document.location.host) {
                    state.uri = uri;
                    state.title = window.title;
                } else {
                    window.location = path;
                    return;
                }
                if (pushStateToHistory) {
                    history.pushState(state.uri, state.title, state.relativePath);
                }
                routeEngine.resolveAndExecuteRoute(state.uri);
            };
            routeEngine.dispose = function() {
                document.removeEventListener("click", clickHandler, false);
                window.removeEventListener("popstate", popstateHandler, false);
            };
            return routeEngine;
        }
    });
})(Hilary, window.history);

Hilary.scope("gidget").register({
    name: "DefaultGidgetBootstrapper",
    dependencies: [ "is" ],
    factory: function(is) {
        "use strict";
        var Bootstrapper = function(scope, bootstrapper) {
            var start, composeLifecycle, composeModules, composeRoutes, onComposed, onError;
            scope = scope || new Hilary();
            bootstrapper = bootstrapper || {};
            bootstrapper.options = bootstrapper.options || {};
            bootstrapper.hilary = bootstrapper.hilary || {};
            onError = function(err) {
                console.log(err);
            };
            start = function() {
                if (is.function(bootstrapper.start)) {
                    bootstrapper.start(null, composeLifecycle);
                } else {
                    composeLifecycle(null, new Gidget(bootstrapper.options));
                }
            };
            composeLifecycle = function(err, gidgetApp) {
                if (err) {
                    onError(err);
                }
                if (is.function(bootstrapper.composeLifecycle) && bootstrapper.composeLifecycle.length === 4) {
                    bootstrapper.composeLifecycle(err, gidgetApp, gidgetApp.pipeline, composeModules);
                } else if (is.function(bootstrapper.composeLifecycle)) {
                    bootstrapper.composeLifecycle(err, gidgetApp, gidgetApp.pipeline);
                    composeModules(err, gidgetApp);
                } else {
                    composeModules(err, gidgetApp);
                }
            };
            composeModules = function(err, gidgetApp) {
                if (err) {
                    onError(err);
                }
                scope.register({
                    name: "gidgetApp",
                    factory: function() {
                        return gidgetApp;
                    }
                });
                scope.register({
                    name: "gidgetRouter",
                    factory: function() {
                        return gidgetApp.routeEngine;
                    }
                });
                scope.register({
                    name: "application",
                    factory: function() {
                        return {
                            restart: function() {
                                start();
                            }
                        };
                    }
                });
                if (is.function(bootstrapper.composeModules) && bootstrapper.composeModules.length === 3) {
                    bootstrapper.composeModules(err, gidgetApp, composeRoutes);
                } else if (is.function(bootstrapper.composeModules)) {
                    bootstrapper.composeModules(err, gidgetApp);
                    composeRoutes(err, gidgetApp);
                } else {
                    composeRoutes(err, gidgetApp);
                }
            };
            composeRoutes = function(err, gidgetApp) {
                if (err) {
                    onError(err);
                }
                if (is.function(bootstrapper.composeRoutes) && bootstrapper.composeRoutes.length === 3) {
                    bootstrapper.composeRoutes(err, gidgetApp, onComposed);
                } else if (is.function(bootstrapper.composeRoutes)) {
                    bootstrapper.composeRoutes(err, gidgetApp);
                    onComposed(err, gidgetApp);
                } else {
                    onComposed(err, gidgetApp);
                }
            };
            onComposed = function(err, gidgetApp) {
                if (err) {
                    onError(scope, err);
                }
                if (is.function(bootstrapper.onComposed)) {
                    bootstrapper.onComposed(err, gidgetApp);
                }
            };
            if (bootstrapper.options.composeHilary !== false) {
                scope.Bootstrapper({
                    composeLifecycle: bootstrapper.hilary.composeLifecycle,
                    composeModules: bootstrapper.hilary.composeModules,
                    onComposed: function(err, scope) {
                        if (is.function(bootstrapper.hilary.onComposed)) {
                            bootstrapper.hilary.onComposed(err, scope);
                        }
                        start();
                    }
                });
            } else {
                start();
            }
        };
        return Bootstrapper;
    }
});

Hilary.scope("gidget").register({
    name: "Route",
    factory: function() {
        "use strict";
        return function(route, caseSensitive) {
            var self = this, flags = caseSensitive ? "" : "i";
            route = route || {};
            self.expression = new RegExp("^" + route.expressionString + "/?$", flags);
            self.expressionString = route.expressionString;
            self.paramNames = route.paramNames;
            self.source = String(route.source);
            self.verb = route.verb;
        };
    }
});

Hilary.scope("gidget").register({
    name: "uriHelper",
    singleton: true,
    dependencies: [ "is", "locale", "exceptions" ],
    factory: function(is, locale, exceptions) {
        "use strict";
        var self = {
            parseUri: undefined
        }, expressions = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, parts = [ "source", "protocol", "authority", "userAndPassword", "user", "password", "hostName", "port", "relativePath", "path", "directory", "file", "queryString", "hash" ], queryPart = {
            name: "query",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        };
        self.parseUri = function(uriString) {
            if (is.not.defined(uriString)) {
                exceptions.throwArgumentException(locale.errors.parseUriRequiresUriString, "uriString");
            } else if (is.not.string(uriString) && uriString.path) {
                return uriString;
            } else if (is.not.string(uriString)) {
                exceptions.throwArgumentException(locale.errors.parseUriRequiresUriString, "uriString");
            }
            var src = uriString, bracketStartIdx = uriString.indexOf("["), bracketEndIdx = uriString.indexOf("]"), matches, uri = {}, i = 14;
            if (bracketStartIdx !== -1 && bracketEndIdx !== -1) {
                uriString = uriString.substring(0, bracketStartIdx) + uriString.substring(bracketStartIdx, bracketEndIdx).replace(/:/g, ";") + uriString.substring(bracketEndIdx, uriString.length);
            }
            matches = expressions.exec(uriString || "");
            while (i--) {
                uri[parts[i]] = matches[i] || undefined;
            }
            if (bracketStartIdx !== -1 && bracketEndIdx !== -1) {
                uri.source = src;
                uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
                uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
                uri.ipv6uri = true;
            }
            uri.port = uri.port && parseInt(uri.port);
            if (is.string(uri.queryString)) {
                uri[queryPart.name] = {};
                uri.queryString.replace(queryPart.parser, function($0, $1, $2) {
                    if ($1) {
                        uri[queryPart.name][$1] = $2;
                    }
                });
            }
            uri.host = uri.hostName && uri.port ? uri.hostName.concat(":", uri.port) : uri.hostName;
            uri.origin = uri.authority && uri.protocol.concat("://", uri.authority.replace(uri.userAndPassword, "").replace("@", ""));
            return uri;
        };
        return self;
    }
});

(function(Hilary, scope, exports) {
    "use strict";
    var compose, start;
    compose = function(onReady) {
        var exceptions;
        scope.register({
            name: "application",
            factory: function() {
                return {
                    compose: compose,
                    start: start
                };
            }
        });
        scope.register({
            name: "Blueprint",
            factory: function() {
                return Hilary.Blueprint;
            }
        });
        scope.register({
            name: "is",
            factory: function() {
                return scope.getContext().is;
            }
        });
        scope.register({
            name: "exceptions",
            dependencies: [ "ExceptionHandler" ],
            factory: function(ExceptionHandler) {
                if (!exceptions) {
                    exceptions = new ExceptionHandler(function(exception) {
                        if (exception.data) {
                            console.log(exception.message, exception.data);
                        } else {
                            console.log(exception.message);
                        }
                        throw exception;
                    });
                }
                return exceptions;
            }
        });
        scope.register({
            name: "Gidget",
            blueprint: "IGidget",
            dependencies: [ "IRouteEngine", "GidgetModule", "GidgetRoute", "DefaultGidgetBootstrapper", "GidgetApp", "argumentValidator" ],
            factory: function(IRouteEngine, GidgetModule, GidgetRoute, DefaultGidgetBootstrapper, GidgetApp, argumentValidator) {
                var Gidget = function(options) {
                    options = options || {};
                    options.routeEngine = options.routeEngine || scope.resolve("DefaultRouteEngine");
                    if (!argumentValidator.validate(IRouteEngine, options.routeEngine)) {
                        return;
                    }
                    return new GidgetApp(options.routeEngine);
                };
                Gidget.GidgetModule = GidgetModule;
                Gidget.GidgetRoute = GidgetRoute;
                Gidget.Bootstrapper = DefaultGidgetBootstrapper;
                return Gidget;
            }
        });
        onReady();
    };
    start = function() {
        var Gidget = scope.resolve("Gidget");
        exports.Gidget = Gidget;
    };
    compose(start);
})(Hilary, Hilary.scope("gidget"), typeof module !== "undefined" && module.exports ? module.exports : window);