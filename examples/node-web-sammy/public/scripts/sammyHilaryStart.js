/*globals Hilary, jQuery, Sammy, Gidget, console*/
(function (scope, $, Sammy, Gidget) {
    "use strict";
    
    var compose, start, configureRoutes, configureApplicationContainer, configureApplicationLifecycle;
    
    /*
    // compose the application and dependency graph
    */
    compose = function (onReady) {
        var singletons = {
                sammy: undefined,
                gidget: undefined
            },
            gidget;

        singletons.sammy = new Sammy('#main', function () {});
        
        gidget = new Gidget({
            routerName: 'bootstrappers.sammy',
            router: singletons.sammy,
            callback: function (gidgetApp) {
                singletons.gidget = gidgetApp;
                
                configureApplicationContainer(singletons.gidget);
                configureApplicationLifecycle(singletons.gidget.pipelines());

                // Start handler
                onReady(singletons.gidget);
            }
        });
    };
    
    /*
    // Configure the IoC container - register singleton dependencies and what not
    */
    configureApplicationContainer = function (gidget) {
        scope.register({
            name: 'GidgetModule',
            factory: function () {
                return gidget.GidgetModule;
            }
        });
    };
    
    /*
    // Register application lifecycle pipeline events
    */
    configureApplicationLifecycle = function (pipelines) {
        pipelines.before(function (verb, path, params) {
            console.log('about to navigate to:', { verb: verb, path: path, params: params });
        });

        pipelines.after(function (verb, path, params) {
            console.log('finished navigating to:', { verb: verb, path: path, params: params });
        });
    };
    
    /*
    // Register Modules
    */
    configureRoutes = function (gidget) {
        gidget.registerModule(scope.resolve('home_controller'));
        gidget.registerModule(scope.resolve('breweries_controller'));
    };
    
    /*
    // starts the application
    */
    start = function (gidget) {
        configureRoutes(gidget);
        gidget.routeEngine.start();
    };

    // START
    compose(start);
    
}(Hilary.scope('node-web-sammy'), jQuery, Sammy, Gidget));
