/*globals hilary, jQuery, Sammy, gidget*/
hilary.run([jQuery, Sammy, gidget], function (ctx, $, Sammy, gidgetComposer) {
    "use strict";
    var sammy,
        gidget,
        homeController = hilary.resolve('home_controller'),
        breweriesController = hilary.resolve('breweries_controller');

    sammy = new Sammy('#main', function () {});
    gidgetComposer.compose(sammy, {
        // useSammyRouting: true
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

    gidget.GidgetRouteEngine.listen();    
    
    
});