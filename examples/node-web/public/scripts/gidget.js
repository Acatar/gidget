/*jslint plusplus: true, regexp: true*/
/*globals exports*/
(function (exports) {
    "use strict";
    
    var GidgetConstructor,
        GidgetModule,
        GidgetRouteEngine,
        GidgetApp,
        GidgetContainer,
        GidgetBootstrapper;
    
    GidgetConstructor = function () {
        this.RouteEngine = GidgetRouteEngine;
        this.DependencyResolver = GidgetContainer;
        
        this.compose = function (routeEngine, callback) {
            if (!routeEngine instanceof GidgetRouteEngine) {
                throw new Error('The routeEngine argument must be of type, GidgetRouteEngine');
            }
            
            var bootstrapper = new GidgetBootstrapper(routeEngine, callback);
            
            return bootstrapper;
        };
    };
    
    GidgetModule = function () {
        this.get = {};
        this.post = {};
        this.put = {};
        this.del = {};
        this.any = {};
    };
    
    GidgetRouteEngine = function (router) {
        var pipelineRegistries,
            regularExpressions;
        
        pipelineRegistries = {
            before: [],
            after: [],
            beforeRoute: {},
            afterRoute: {}
        };
        
        regularExpressions = {
            escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g,
            namedParam: /:(\w+)/g,
            splatParam: /\*(\w+)/g,
            firstParam: /(:\w+)|(\*\w+)/,
            allParams: /(:|\*)\w+/g,
            extractHash: /^[^#]*(#.*)$/
        };
        
        this.get = router.get;
        this.post = router.post;
        this.put = router.put;
        this.del = router.del;
        this.any = router.any;
        this.start = router.start;
        this.navigate = router.navigate;
        this.pipelineRegistries = pipelineRegistries;
        
        this.before = router.before || function (callback) {
            if (typeof callback === 'function') {
                pipelineRegistries.before.push(callback);
            }
        };
        
        this.after = router.after || function (callback) {
            if (typeof callback === 'function') {
                pipelineRegistries.after.push(callback);
            }
        };
        
        this.beforeRoute = router.beforeRoute || function (route, callback) {
            if (typeof callback === 'function') {
                pipelineRegistries.beforeRoute[route] = callback;
            }
        };
        
        this.afterRoute = router.afterRoute || function (route, callback) {
            if (typeof callback === 'function') {
                pipelineRegistries.afterRoute[route] = callback;
            }
        };
        
        // thanks Simrou!
        this.parseRoute = function (pattern, caseSensitive) {
            var flags,
                name,
                names,
                params;

            pattern = String(pattern);
            names = pattern.match(regularExpressions.allParams);
            if (names != null) {
                params = (function () {
                    var i,
                        len,
                        results;
                    
                    results = [];

                    for (i = 0, len = names.length; i < len; i++) {
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
        
        this.getHash = function () {
            return String(location.hash).replace(regularExpressions.extractHash, '$1');
        };
        
        this.executePipeline = function (pipelineToExecute, verb, path, params, event) {
            var i;
            for (i = 0; i < pipelineToExecute.length; i++) {
                pipelineToExecute[i](verb, path, params, event);
            }
        };
    };
    
    GidgetApp = function (components) {
        this.GidgetRouteEngine = components.GidgetRouteEngine;
        this.GidgetModule = components.GidgetModule;
        
        this.pipelines = function () {
            return {
                before: this.GidgetRouteEngine.before,
                after: this.GidgetRouteEngine.after,
                beforeRoute: this.GidgetRouteEngine.beforeRoute,
                afterRoute: this.GidgetRouteEngine.afterRoute
            };
        };
        
        /*
        //    register a module (i.e. a controller)
        //    @param gidgetModule: an instance of GidgetModule
        //
        //    i.e. 
        //      var myModule = new gidget.GidgetModule();
        //
        //      myModule.get['/beers/:id'] = function (params, event) {
        //          // show beer
        //      }
        //
        //      gidget.registerModule(myModule);
        */
        this.registerModule = components.registerModule;
    };
    
    /*
    //
    */
    GidgetBootstrapper = function (GidgetRouteEngine, callback) {
        
        var registerModule;
        
        registerModule = function (gidgetModule) {
            if (!gidgetModule instanceof GidgetModule) {
                throw new Error('registerModule arguments must be of type GidgetModule');
            }
            
            var gets = gidgetModule.get,
                puts = gidgetModule.put,
                posts = gidgetModule.posts,
                dels = gidgetModule.dels,
                anys = gidgetModule.anys,
                get,
                put,
                post,
                del,
                any;
            
            for (get in gets) {
                if (gets.hasOwnProperty(get)) {
                    GidgetRouteEngine.get(get, gets[get]);
                }
            }
            
            for (put in puts) {
                if (puts.hasOwnProperty(put)) {
                    GidgetRouteEngine.put(put, puts[put]);
                }
            }
            
            for (post in posts) {
                if (posts.hasOwnProperty(post)) {
                    GidgetRouteEngine.post(post, posts[post]);
                }
            }
            
            for (del in dels) {
                if (dels.hasOwnProperty(del)) {
                    GidgetRouteEngine.del(del, dels[del]);
                }
            }
            
            for (any in anys) {
                if (anys.hasOwnProperty(any)) {
                    GidgetRouteEngine.get(any, anys[any]);
                }
            }
        };
        
        if (typeof callback === 'function') {
            callback(new GidgetApp({
                GidgetRouteEngine: GidgetRouteEngine,
                GidgetModule: GidgetModule,
                registerModule: registerModule
            }));
        }
    };
    
    exports.Gidget = GidgetConstructor;
    
}(typeof exports === 'object' ? exports : window));