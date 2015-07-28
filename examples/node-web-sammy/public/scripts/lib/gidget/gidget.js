/*! gidget-builder 2015-07-27 */
Hilary.scope("GidgetContainer").register({
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

Hilary.scope("GidgetContainer").register({
    name: "locale::en_US",
    factory: {
        errors: {
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

Hilary.scope("GidgetContainer").register({
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

Hilary.scope("GidgetContainer").register({
    name: "GidgetModule",
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

Hilary.scope("GidgetContainer").register({
    name: "GidgetRoute",
    factory: function() {
        "use strict";
        return function(route) {
            if (!route) {
                throw new Error("GidgetRoute does not have a parameterless constructor");
            }
            if (typeof route.routeHandler !== "function") {
                throw new Error("A routeHandler function is required when creating a new GidgetRoute");
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

Hilary.scope("GidgetContainer").register({
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
            any: {
                type: "function",
                args: [ "path", "callback" ]
            },
            start: "function",
            navigate: {
                type: "function",
                args: [ "hash", "updateUrlBar" ]
            }
        });
    }
});

Hilary.scope("GidgetContainer").register({
    name: "RouteEngine",
    dependencies: [ "IRouteEngine", "locale", "exceptions" ],
    factory: function(IRouteEngine, locale, exceptions) {
        "use strict";
        return function(router) {
            var self = {}, pipelineRegistries, regularExpressions;
            if (!IRouteEngine.syncSignatureMatches(router).result) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIRouteEngine, IRouteEngine.syncSignatureMatches(router).errors);
                return;
            }
            pipelineRegistries = {
                before: [],
                after: []
            };
            regularExpressions = {
                escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
                namedParam: /:(\w+)/g,
                splatParam: /\*(\w+)/g,
                firstParam: /(:\w+)|(\*\w+)/,
                allParams: /(:|\*)\w+/g,
                extractHash: /^[^#]*(#.*)$/
            };
            self.get = router.get;
            self.post = router.post;
            self.put = router.put;
            self.del = router.del;
            self.any = router.any;
            self.start = router.start;
            self.navigate = router.navigate;
            self.pipelineRegistries = pipelineRegistries;
            self.before = router.before || function(callback) {
                if (typeof callback === "function") {
                    pipelineRegistries.before.push(callback);
                }
            };
            self.after = router.after || function(callback) {
                if (typeof callback === "function") {
                    pipelineRegistries.after.push(callback);
                }
            };
            self.parseRoute = function(pattern, caseSensitive) {
                var flags, name, names, params;
                pattern = String(pattern);
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
                flags = caseSensitive ? "" : "i";
                return {
                    expression: new RegExp("^" + pattern + "/?$", flags),
                    params: params,
                    pattern: pattern
                };
            };
            self.getHash = function() {
                return String(location.hash).replace(regularExpressions.extractHash, "$1");
            };
            self.executePipeline = function(pipelineToExecute, verb, path, params, event) {
                var i;
                for (i = 0; i < pipelineToExecute.length; i += 1) {
                    pipelineToExecute[i](verb, path, params, event);
                }
            };
            return self;
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "IGidgetApp",
    dependencies: [ "Blueprint", "IRouteEngine" ],
    factory: function(Blueprint, IRouteEngine) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IGidgetApp",
            GidgetModule: "function",
            GidgetRoute: {
                type: "function",
                args: [ "route" ]
            },
            routeEngine: {
                validate: function(engine, errorArray) {
                    var validationResult = IRouteEngine.syncSignatureMatches(engine);
                    if (!validationResult.result) {
                        errorArray = errorArray.concat(validationResult.errors);
                    }
                }
            },
            pipelines: "function",
            registerModule: {
                type: "function",
                args: [ "gidgetModule" ]
            }
        });
    }
});

Hilary.scope("GidgetContainer").register({
    name: "GidgetApp",
    dependencies: [ "IGidgetApp", "locale", "exceptions" ],
    factory: function(IGidgetApp, locale, exceptions) {
        "use strict";
        return function(components) {
            components = components || {};
            components.pipelines = function() {
                return {
                    before: components.routeEngine.before,
                    after: components.routeEngine.after
                };
            };
            if (!IGidgetApp.syncSignatureMatches(components).result) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation, IGidgetApp.syncSignatureMatches(components).errors);
            }
            return components;
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "GidgetCtor",
    dependencies: [ "IGidgetModule", "GidgetModule", "GidgetRoute", "GidgetApp", "locale", "exceptions" ],
    factory: function(IGidgetModule, GidgetModule, GidgetRoute, GidgetApp, locale, exceptions) {
        "use strict";
        return function(routeEngine, callback) {
            var registerModule, gidgetApp;
            registerModule = function(gidgetModule) {
                if (!IGidgetModule.syncSignatureMatches(gidgetModule).result) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIGidgetModule, IGidgetModule.syncSignatureMatches(gidgetModule).errors);
                    return;
                }
                var gets = gidgetModule.get, puts = gidgetModule.put, posts = gidgetModule.posts, dels = gidgetModule.dels, anys = gidgetModule.anys, get, put, post, del, any;
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
                for (any in anys) {
                    if (anys.hasOwnProperty(any)) {
                        routeEngine.get(any, anys[any]);
                    }
                }
            };
            gidgetApp = new GidgetApp({
                GidgetModule: GidgetModule,
                GidgetRoute: GidgetRoute,
                routeEngine: routeEngine,
                registerModule: registerModule
            });
            if (typeof callback === "function") {
                callback(gidgetApp);
            }
            return gidgetApp;
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "IOptions",
    dependencies: [ "Blueprint" ],
    factory: function(Blueprint) {
        "use strict";
        return new Blueprint({
            __blueprintId: "IOptions",
            routerName: "string"
        });
    }
});

(function(exports, scope, Hilary) {
    "use strict";
    var compose, start;
    compose = function() {
        var locale = scope.resolve("locale::en_US"), exceptions;
        scope.register({
            name: "locale",
            factory: function() {
                return locale;
            }
        });
        scope.register({
            name: "Blueprint",
            factory: function() {
                return Hilary.Blueprint;
            }
        });
        scope.register({
            name: "exceptions",
            dependencies: [ "ExceptionHandler" ],
            factory: function(ExceptionHandler) {
                if (exceptions) {
                    return exceptions;
                }
                exceptions = new ExceptionHandler(function(exception) {
                    if (exception.data) {
                        console.log(exception.message, exception.data);
                    }
                    throw exception;
                });
                return exceptions;
            }
        });
        scope.register({
            name: "Gidget",
            dependencies: [ "RouteEngine", "GidgetCtor", "IOptions", "exceptions", "locale" ],
            factory: function(RouteEngine, GidgetCtor, IOptions, exceptions, locale) {
                return function(options) {
                    var self = {}, optionsAreValid, router;
                    optionsAreValid = IOptions.syncSignatureMatches(options);
                    if (!optionsAreValid.result) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.missingOptions);
                        return;
                    }
                    router = scope.resolve(options.routerName);
                    router.compose(RouteEngine, options, function(routeEngine) {
                        self = new GidgetCtor(routeEngine, options.callback);
                        return self;
                    });
                    return self;
                };
            }
        });
        start();
    };
    start = function() {
        exports.Gidget = scope.resolve("Gidget");
    };
    compose(start);
})(typeof module !== "undefined" && module.exports ? module.exports : window, Hilary.scope("GidgetContainer"), Hilary);