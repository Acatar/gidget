/*global define, require, window, console*/

define('jquery', function () {
    "use strict";
    return window.jQuery;
});

define('sammy', ['jquery'], function ($) {
    "use strict";
    return $.sammy;
});

define('gidget', function () {
    "use strict";
    return window.gidget;
});

require(['jquery', 'sammy', 'gidget', 'sammy_require_controllers/home', 'sammy_require_controllers/breweries'],
    function ($, Sammy, gidgetComposer, homeController, breweriesController) {
        "use strict";

        var sammy,
            gidget;

        sammy = new Sammy('#main', function () {});
        gidgetComposer.compose(sammy, {
            // useGidgetRouting: true
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