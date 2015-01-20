/*jslint plusplus: true*/
/*globals exports, jQuery, Gidget, Sammy*/

(function (exports, Gidget) {
    "use strict";
    
    var gidget = new Gidget(),
        sammyRouter;
    
    sammyRouter = function (sammy, options) {
        var router,
            addNewRoute,
            config = options || {};

        addNewRoute = function (verb, path, callback) {
            var eventedCallback;
            
            if (config.useGidgetRouting) {
                path = router.parseRoute(path).expression;
            }
            
            eventedCallback = function (context) {
                if (router.pipelineRegistries.beforeRoute[path]) {
                    router.pipelineRegistries.beforeRoute[path](verb, path, context.params);
                }

                router.executePipeline(router.pipelineRegistries.before, verb, path, context.params);
                callback(context.params);

                if (router.pipelineRegistries.afterRoute[path]) {
                    router.pipelineRegistries.afterRoute[path](verb, path, context.params);
                }

                router.executePipeline(router.pipelineRegistries.after, verb, path, context.params);
            };

            sammy.route(verb, path, eventedCallback);
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
                sammy.run();
            },
            navigate: function (hash, updateUrlBar) {
                if (updateUrlBar === undefined) {
                    updateUrlBar = true;
                }
                
                if (updateUrlBar) {
                    location.hash = hash;
                } else {
                    throw new Error('Navigating without updating the URL bar is not implemented');
                }
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
        compose: function (sammyInstance, options, callback) {
            var optArgIsCallback = typeof options === 'function',
                opts = optArgIsCallback ? {} : options,
                cb = optArgIsCallback ? options : callback;
            
            opts.useGidgetRouting = opts.useGidgetRouting === undefined ? true : opts.useGidgetRouting;
            
            return gidget.compose(sammyRouter(sammyInstance, opts), cb);
        }
    };
    
}(typeof exports === 'object' ? exports : window, Gidget));