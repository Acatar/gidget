/*! gidget-builder 2015-05-22 */
Hilary.scope("GidgetContainer").register({
    name: "implementr",
    factory: function() {
        "use strict";
        var implementsInterface = function(obj, intrface) {
            if (!obj) {
                throw new Error("A first argument of an object that should implement an interface is required");
            }
            if (!intrface || typeof intrface.validate !== "function" || intrface.validate.length !== 1) {
                throw new Error("A second argument with a validate function that accepts one argument is required");
            }
            if (typeof intrface.name !== "string") {
                throw new Error("A second argument with a name string is required");
            }
            if (intrface.validate(obj)) {
                obj.$_interfaces = obj.$_interfaces || {};
                obj.$_interfaces[intrface.name] = true;
                return true;
            } else {
                return false;
            }
        };
        return {
            implementsInterface: implementsInterface
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "exceptions",
    factory: function() {
        "use strict";
        var self = {
            makeException: undefined,
            argumentException: undefined,
            throwArgumentException: undefined,
            notImplementedException: undefined,
            throwNotImplementedException: undefined,
            throwException: undefined
        }, makeException;
        makeException = function(name, message, data) {
            var msg = typeof message === "string" ? message : name, err = new Error(msg);
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
            self.throwException(self.argumentException(message, argument, data));
        };
        self.notImplementedException = function(message, data) {
            return makeException("NotImplementedException", message, data);
        };
        self.throwNotImplementedException = function(message, data) {
            self.throwException(self.notImplementedException(message, data));
        };
        self.throwException = function(exception) {
            throw exception;
        };
        return self;
    }
});

Hilary.scope("GidgetContainer").register({
    name: "locale::en_US",
    factory: {
        errors: {
            interfaces: {
                requiresImplementation: "An implementation is required to create a new instance of an interface",
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
    dependencies: [ "locale", "exceptions" ],
    factory: function(locale, exceptions) {
        "use strict";
        return {
            name: "IGidgetModule",
            validate: function(implementation) {
                var validateVerb;
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                validateVerb = function(verb) {
                    if (typeof implementation[verb] !== "object") {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IRouteEngine." + verb);
                    }
                };
                validateVerb("get");
                validateVerb("post");
                validateVerb("put");
                validateVerb("del");
                validateVerb("any");
                return true;
            }
        };
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
    name: "IRouteEngine",
    dependencies: [ "locale", "exceptions" ],
    factory: function(locale, exceptions) {
        "use strict";
        return {
            name: "IRouteEngine",
            validate: function(implementation) {
                var routeHandlerExists;
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                routeHandlerExists = function(verb) {
                    if (typeof implementation[verb] !== "function") {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IRouteEngine." + verb);
                    }
                    if (implementation[verb].length !== 2) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.requiresArguments + "IRouteEngine." + verb + "(path, callback)");
                    }
                };
                routeHandlerExists("get");
                routeHandlerExists("post");
                routeHandlerExists("put");
                routeHandlerExists("del");
                routeHandlerExists("any");
                if (typeof implementation.start !== "function") {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IRouteEngine.start");
                }
                if (typeof implementation.navigate !== "function") {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IRouteEngine.navigate");
                }
                if (implementation.navigate.length !== 2) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresArguments + "IRouteEngine.navigate(hash, updateUrlBar)");
                }
                return true;
            }
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "RouteEngine",
    dependencies: [ "implementr", "IRouteEngine", "locale", "exceptions" ],
    factory: function(implementr, IRouteEngine, locale, exceptions) {
        "use strict";
        return function(router) {
            var self = {}, pipelineRegistries, regularExpressions;
            if (!implementr.implementsInterface(router, IRouteEngine)) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIRouteEngine);
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
                if (names != null) {
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
    dependencies: [ "locale", "exceptions" ],
    factory: function(locale, exceptions) {
        "use strict";
        return {
            name: "IGidgetApp",
            validate: function(implementation) {
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                return true;
            }
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "GidgetApp",
    dependencies: [ "implementr", "IGidgetApp", "locale", "exceptions" ],
    factory: function(implementr, IGidgetApp, locale, exceptions) {
        "use strict";
        return function(components) {
            var self = {};
            if (!implementr.implementsInterface(components, IGidgetApp)) {
                exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIGidgetApp);
                return;
            }
            self.GidgetModule = components.GidgetModule;
            self.routeEngine = components.routeEngine;
            self.pipelines = function() {
                return {
                    before: self.routeEngine.before,
                    after: self.routeEngine.after
                };
            };
            self.registerModule = components.registerModule;
            return self;
        };
    }
});

Hilary.scope("GidgetContainer").register({
    name: "GidgetCtor",
    dependencies: [ "IGidgetModule", "GidgetModule", "GidgetApp", "implementr", "locale", "exceptions" ],
    factory: function(IGidgetModule, GidgetModule, GidgetApp, implementr, locale, exceptions) {
        "use strict";
        return function(routeEngine, callback) {
            var registerModule, gidgetApp;
            registerModule = function(gidgetModule) {
                if (!implementr.implementsInterface(gidgetModule, IGidgetModule)) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIGidgetModule);
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
    dependencies: [ "locale", "exceptions" ],
    factory: function(locale, exceptions) {
        "use strict";
        return {
            name: "IOptions",
            validate: function(implementation) {
                var routeHandlerExists;
                if (!implementation) {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresImplementation);
                }
                if (typeof implementation.routerName !== "string") {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IOptions.routerName");
                }
                if (typeof implementation.router === "undefined") {
                    exceptions.throwNotImplementedException(locale.errors.interfaces.requiresProperty + "IOptions.router");
                }
                return true;
            }
        };
    }
});

(function(exports, scope) {
    "use strict";
    var compose, start;
    compose = function(onReady) {
        var locale = scope.resolve("locale::en_US");
        scope.register({
            name: "locale",
            factory: function() {
                return locale;
            }
        });
        scope.register({
            name: "Gidget",
            dependencies: [ "IRouteEngine", "RouteEngine", "GidgetCtor", "IOptions", "implementr", "exceptions", "locale" ],
            factory: function(IRouteEngine, RouteEngine, GidgetCtor, IOptions, implementr, exceptions, locale) {
                return function(options) {
                    var self = {}, router;
                    if (!implementr.implementsInterface(options, IOptions)) {
                        exceptions.throwNotImplementedException(locale.errors.interfaces.missingOptions);
                        return;
                    }
                    router = scope.resolve(options.routerName);
                    router.compose(RouteEngine, options, function(routeEngine) {
                        if (!implementr.implementsInterface(routeEngine, IRouteEngine)) {
                            exceptions.throwNotImplementedException(locale.errors.interfaces.notAnIRouteEngine);
                            return;
                        }
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
})(typeof module !== "undefined" && module.exports ? module.exports : window, Hilary.scope("GidgetContainer"));