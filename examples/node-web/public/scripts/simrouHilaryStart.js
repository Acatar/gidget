/*globals hilary, jQuery, Simrou, gidget, console*/
hilary.run([jQuery, Simrou, gidget], function (ctx, $, Simrou, gidgetComposer) {
    "use strict";
    var simrou,
        gidget,
        homeController = hilary.resolve('controllers::home'),
        breweriesController = hilary.resolve('controllers::breweries');

    simrou = new Simrou();
    gidgetComposer.compose(simrou, {
        useGidgetRouting: false
    }, function (gidgetModules) {
        gidget = gidgetModules;
    });

    gidget.registerModule(homeController.init(gidget.GidgetModule, $));
    gidget.registerModule(breweriesController.init(gidget.GidgetModule, $));

    gidget.pipelines().before(function (verb, path, params) {
        console.log('about to navigate to:', { verb: verb, path: path, params: params });
    });

    gidget.pipelines().after(function (verb, path, params) {
        console.log('finished navigating to:', { verb: verb, path: path, params: params });
    });

    gidget.GidgetRouteEngine.start();
    
    
});