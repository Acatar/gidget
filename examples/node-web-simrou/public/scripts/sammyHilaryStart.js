/*globals hilary, jQuery, Sammy, gidget, console*/
hilary.run([jQuery, Sammy, gidget], function (ctx, $, Sammy, gidgetComposer) {
    "use strict";
    var sammy,
        gidget,
        homeController = hilary.resolve('home_controller'),
        breweriesController = hilary.resolve('breweries_controller');

    sammy = new Sammy('#main', function () {});
    gidgetComposer.compose(sammy, {
        // useGidgetRouting: true
    }, function (gidgetApp) {
        gidget = gidgetApp;
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