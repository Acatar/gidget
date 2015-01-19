/*jslint nomen: true, plusplus: true, regexp: true*/
/*globals exports, jQuery, Gidget, Simrau*/

(function (exports, Gidget) {
    "use strict";
    
    var gidget = new Gidget(),
        simrauRouter;
    
    simrauRouter = function (routeEngine, options) {
        var router,
            addNewRoute,
            getHash,
            regularExpressions,
            parseRoute,
            config = options || {};

        addNewRoute = function (verb, path, callback) {
            var eventedCallback,
                route;
            
            if (typeof path === 'string') {
                if (path.substr(0, 1) === '#') {
                    path = path.substr(1, path.length);
                }
                
                if (path.substr(0, 2) === '/#') {
                    path = path.substr(2, path.length);
                }
            }
            
            if (config.useGidgetRouting) {
                path = router.parseRoute(path).expression;
            }
            
            eventedCallback = function (event, params) {
                if (router.pipelineRegistries.beforeRoute[path]) {
                    router.pipelineRegistries.beforeRoute[path](verb, path, params, event);
                }

                router.executePipeline(router.pipelineRegistries.before, verb, path, params, event);
                callback(params, event);

                if (router.pipelineRegistries.afterRoute[path]) {
                    router.pipelineRegistries.afterRoute[path](verb, path, params, event);
                }

                router.executePipeline(router.pipelineRegistries.after, verb, path, params, event);
            };
            
            route = routeEngine.addRoute(path);
            
            switch (verb) {
            case 'get':
                route.get(eventedCallback);
                break;
            case 'put':
                route.put(eventedCallback);
                break;
            case 'post':
                route.post(eventedCallback);
                break;
            case 'delete':
                route['delete'](eventedCallback);
                break;
            case 'any':
                route.any(eventedCallback);
                break;
            }
        };

        router = new gidget.RouteEngine({
            get: function (path, callback) {
                return addNewRoute('get', path, callback);
            },
            post: function (path, callback) {
                return addNewRoute('post', path, callback);
            },
            put: function (path, callback) {
                return addNewRoute('put', path, callback);
            },
            del: function (path, callback) {
                return addNewRoute('delete', path, callback);
            },
            any: function (path, callback) {
                return addNewRoute('any', path, callback);
            },
            start: function () {
                routeEngine.start();
            },
            navigate: function (hash, updateUrlBar) {
                if (updateUrlBar === undefined) {
                    updateUrlBar = true;
                }
                
                if (updateUrlBar) {
                    routeEngine.navigate(hash);
                } else {
                    routeEngine.resolve(hash);
                }
                
            }
        });

        getHash = function () {
            return String(location.hash).replace(regularExpressions.extractHash, '$1');
        };
        
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
        compose: function (simrauInstance, options, callback) {
            var optArgIsCallback = typeof options === 'function',
                opts = optArgIsCallback ? {} : options,
                cb = optArgIsCallback ? options : callback;
            
            opts.useGidgetRouting = opts.useGidgetRouting === undefined ? true : opts.useGidgetRouting;
            
            return gidget.compose(simrauRouter(simrauInstance, opts), cb);
        }
    };
    
}(typeof exports === 'object' ? exports : window, Gidget));