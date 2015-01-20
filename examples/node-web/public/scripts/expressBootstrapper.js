/*jslint plusplus: true*/
/*globals exports, require*/

(function (exports) {
    "use strict";
    
    var Gidget = require('gidget'),
        express = require('express'),
        gidget = new Gidget(),
        expressRouter;
    
    expressRouter = function (expressInstance, options) {
        var router,
            addNewRoute,
            app = expressInstance || express(),
            expressRouter = express.Router(),
            config = options || {},
            routes = [],
            befores = [],
            afters = [];

        addNewRoute = function (verb, path, callback) {
            var eventedCallback;
            
            eventedCallback = function (req, res) {
                if (router.pipelineRegistries.beforeRoute[path]) {
                    router.pipelineRegistries.beforeRoute[path](req, res);
                }

                callback(req, res);

                if (router.pipelineRegistries.afterRoute[path]) {
                    router.pipelineRegistries.afterRoute[path](req, res);
                }
            };
            
            switch (verb) {
            case 'get':
                expressRouter.get(path, eventedCallback);
                break;
            case 'put':
                expressRouter.put(path, eventedCallback);
                break;
            case 'post':
                expressRouter.post(path, eventedCallback);
                break;
            case 'delete':
                expressRouter['delete'](path, eventedCallback);
                break;
            case 'any':
                expressRouter.any(path, eventedCallback);
                break;
            }
        };

        router = new gidget.RouteEngine({
            get: function (path, callback) {
                routes.push(function () {
                    return addNewRoute('get', path, callback);
                });
            },
            post: function (path, callback) {
                routes.push(function () {
                    return addNewRoute('post', path, callback);
                });
            },
            put: function (path, callback) {
                routes.push(function () {
                    return addNewRoute('put', path, callback);
                });
            },
            del: function (path, callback) {
                routes.push(function () {
                    return addNewRoute('delete', path, callback);
                });
            },
            any: function (path, callback) {
                routes.push(function () {
                    return addNewRoute('any', path, callback);
                });
            },
            start: function () {
                var i,
                    beforesLength = befores.length,
                    j,
                    routesLength = routes.length,
                    k,
                    aftersLength = afters.length;
                
                for (i = 0; i < beforesLength; i++) {
                    befores[i](app);
                }
                
                for (j = 0; j < routesLength; j++) {
                    routes[j](app);
                }
                
                for (k = 0; k < aftersLength; k++) {
                    afters[k](app);
                }
                
                return app;
            },
            navigate: function (hash, updateUrlBar) {
                throw new Error('not implemented');
            },
            before: function (callback) {
                befores.push(function (app) {
                    app.use(callback);
                });
            },
            after: function (callback) {
                afters.push(function (app) {
                    app.use(callback);
                });
            }
        });
        
        return router;
    };
    
    
    /*
    // The main gidget app accessor
    */
    exports.gidget = {
        /*
        //  Composes a gidget app. The callback gives you access to the bootstrapped 
        //  gidget modules
        */
        compose: function (expressIntance, options, callback) {
            var optArgIsCallback = typeof options === 'function',
                opts = optArgIsCallback ? {} : options,
                cb = optArgIsCallback ? options : callback;
            
            opts.useGidgetRouting = opts.useGidgetRouting === undefined ? true : opts.useGidgetRouting;
            
            return gidget.compose(expressRouter(expressIntance, opts), cb);
        }
    };
    
}(typeof exports === 'object' ? exports : window));