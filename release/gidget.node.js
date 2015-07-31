/*! gidget-builder 2015-07-30 */
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
            pipelines: "object",
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
            beforeRouteResolution: {
                type: "function",
                args: [ "callback" ]
            },
            afterRouteResolution: {
                type: "function",
                args: [ "callback" ]
            },
            before: {
                type: "function",
                args: [ "callback" ]
            },
            after: {
                type: "function",
                args: [ "callback" ]
            },
            onError: {
                type: "function",
                args: [ "callback" ]
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
            dispose: "function"
        });
    }
});

Hilary.scope("gidget").register({
    name: "locale",
    factory: {
        errors: {
            requiresArguments: "The {func} function requires arguments {args}",
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
            self.pipelines.beforeRouteResolution = routeEngine.beforeRouteResolution;
            self.pipelines.afterRouteResolution = routeEngine.afterRouteResolution;
            self.pipelines.before = routeEngine.before;
            self.pipelines.after = routeEngine.after;
            self.pipelines.onError = routeEngine.onError;
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
    name: "GidgetContext",
    factory: function() {
        "use strict";
        return function(context) {
            var self = this;
            context = context || {};
            self.verb = context.verb;
            self.route = context.route;
            self.params = context.params;
        };
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
    dependencies: [ "Route", "GidgetContext", "is", "locale", "exceptions" ],
    factory: function(Route, GidgetContext, is, locale, exceptions) {
        "use strict";
        var RouteEngine = function(router) {
            var self, regularExpressions, routes = [], pipelineEvents, makeAsyncCallback, makeRouteExecutionQueue, addRoute, parseRoute, parseParams, makePipelineTasks, validatePipelineEventCallback, executeBeforePipeline, executeAfterPipeline, executeErrorPipeline, executeBeforeRouteResolution, executeAfterRouteResolution;
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
            makeRouteExecutionQueue = function(verb, path, callback) {
                return function(err, route) {
                    var beforeThis, beforeAll, main, afterThis, afterAll;
                    beforeThis = function() {
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
                    beforeAll = function(err, response) {
                        executeBeforePipeline(err, response, main);
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
                        executeAfterPipeline(err, response);
                    };
                    beforeThis();
                };
            };
            addRoute = function(verb, path, callback) {
                if (is.not.defined(path) || is.not.function(callback)) {
                    exceptions.throwArgumentException(locale.errors.requiresArguments.replace("{func}", "addRoute").replace("{args}", "(verb, path, callback)"));
                }
                routes.push({
                    route: parseRoute(path),
                    callback: makeRouteExecutionQueue(verb, path, makeAsyncCallback(callback))
                });
            };
            parseRoute = function(path, caseSensitive) {
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
                    path: path
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
            validatePipelineEventCallback = function(callback) {
                if (is.not.function(callback)) {
                    executeErrorPipeline({
                        status: 500,
                        message: "A callback function is required to regiseter a pipeline event"
                    });
                    return false;
                }
                return true;
            };
            self.beforeRouteResolution = function(callback) {
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
            self.afterRouteResolution = function(callback) {
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
            self.before = function(callback) {
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
            self.after = function(callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.after.push(callback);
                }
            };
            self.onError = function(callback) {
                if (validatePipelineEventCallback(callback)) {
                    pipelineEvents.error.push(callback);
                }
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
            executeBeforePipeline = function(err, response, next) {
                var tasks = makePipelineTasks(pipelineEvents.before, next);
                if (tasks.length) {
                    tasks[0](err, response);
                } else {
                    next(err, response);
                }
            };
            executeAfterPipeline = function(err, response) {
                var tasks = makePipelineTasks(pipelineEvents.after);
                if (tasks.length) {
                    tasks[0](err, response);
                }
            };
            executeErrorPipeline = function(errorObject) {
                var i;
                for (i = 0; i < pipelineEvents.error.length; i += 1) {
                    pipelineEvents.error[i](errorObject);
                }
            };
            executeBeforeRouteResolution = function(path, next) {
                var tasks = makePipelineTasks(pipelineEvents.beforeRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, path);
                } else {
                    next(null, path);
                }
            };
            executeAfterRouteResolution = function(route, next) {
                var tasks = makePipelineTasks(pipelineEvents.afterRouteResolution, next);
                if (tasks.length) {
                    tasks[0](null, route);
                } else {
                    next(null, route);
                }
            };
            self.resolveRoute = function(path) {
                var i, matchingRoute;
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
            self.resolveAndExecuteRoute = function(path) {
                var beforeThis, main, afterThis, route;
                beforeThis = function() {
                    executeBeforeRouteResolution(path, main);
                };
                main = function(err, path) {
                    if (err) {
                        executeErrorPipeline(err);
                        return;
                    }
                    route = self.resolveRoute(path);
                    if (route === false) {
                        err = {
                            status: 404,
                            message: locale.errors.status404,
                            path: path
                        };
                        executeErrorPipeline(err);
                    } else if (is.function(route.callback)) {
                        afterThis(route);
                    }
                };
                afterThis = function(route) {
                    executeAfterRouteResolution(route, route.callback);
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
        dependencies: [ "BaseRouteEngine", "is" ],
        factory: function(RouteEngine, is) {
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
                var state = data || {};
                if (is.not.defined(pushStateToHistory)) {
                    pushStateToHistory = true;
                }
                if (is.string(path.host) && path.host === document.location.host) {
                    state.path = path;
                    state.relativePath = path.pathname + path.search + path.hash;
                    state.title = window.title;
                } else if (is.string(path) && path.replace(window.location.origin, "").indexOf("http") === -1) {
                    state.path = path;
                    state.relativePath = path.replace(window.location.origin, "");
                    state.title = window.title;
                } else {
                    window.location = path;
                    return;
                }
                if (pushStateToHistory) {
                    history.pushState(state.path, state.title, state.relativePath);
                }
                routeEngine.resolveAndExecuteRoute(state.relativePath);
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
            var _scope, _bootstrapper, self = {
                compose: undefined,
                start: undefined,
                configureRoutes: undefined,
                configureApplicationContainer: undefined,
                configureApplicationLifecycle: undefined
            };
            if (is.defined(scope) && scope.register) {
                _scope = scope;
            } else {
                _bootstrapper = scope;
            }
            bootstrapper = _bootstrapper || bootstrapper || {};
            bootstrapper = bootstrapper || {};
            self.compose = function(onReady) {
                if (is.function(bootstrapper.compose)) {
                    bootstrapper.compose(onReady);
                } else {
                    onReady(null, new Gidget());
                }
            };
            self.start = function(err, gidgetApp) {
                self.configureApplicationContainer(gidgetApp);
                self.configureApplicationLifecycle(gidgetApp, gidgetApp.pipelines);
                self.configureRoutes(gidgetApp);
                if (is.function(bootstrapper.start)) {
                    bootstrapper.start(err, gidgetApp);
                }
                gidgetApp.start();
            };
            self.configureApplicationContainer = function(gidgetApp) {
                if (_scope) {
                    _scope.register({
                        name: "gidgetApp",
                        factory: function() {
                            return gidgetApp;
                        }
                    });
                    _scope.register({
                        name: "gidgetRouter",
                        factory: function() {
                            return gidgetApp.routeEngine;
                        }
                    });
                    _scope.register({
                        name: "application",
                        factory: function() {
                            return {
                                compose: self.compose,
                                start: self.start,
                                restart: function() {
                                    self.compose(self.start);
                                }
                            };
                        }
                    });
                }
                if (is.function(bootstrapper.configureApplicationContainer)) {
                    bootstrapper.configureApplicationContainer(gidgetApp);
                }
            };
            self.configureApplicationLifecycle = function(gidgetApp, pipelines) {
                if (is.function(bootstrapper.configureApplicationLifecycle)) {
                    bootstrapper.configureApplicationLifecycle(gidgetApp, pipelines);
                }
            };
            self.configureRoutes = function(gidgetApp) {
                if (is.function(bootstrapper.configureRoutes)) {
                    bootstrapper.configureRoutes(gidgetApp);
                }
            };
            self.compose(self.start);
            return self;
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
            self.params = route.params;
            self.path = String(route.path);
        };
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