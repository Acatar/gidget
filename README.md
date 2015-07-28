# Gidget
A Domain Service Language (DSL) for JavaScript SPAs and Node.js servers inspired by NancyFx and Sinatra

## Router Dependencies
Gidget is not itself a route engine. It requires that you bootstrap it with one. At the moment, only sammy is supported, but bootrappers are simple to write, so it can be used with others, like simrou, or express.

## Getting Started with Gidget and Sammy
First, install jQuery, sammy, hilary and gidget.

You can download the resources, or just install them with bower:

```
bower install --save jquery
bower install --save sammy
bower install --save hilary
bower install --save gidget
```

In your markup, add the following:
```HTML
<div id="main"></div>

<script type="text/javascript" src=".../jquery.min.js"></script>
<script type="text/javascript" src=".../sammy.min.js"></script>
<script type="text/javascript" src=".../hilary.min.js"></script>
<script type="text/javascript" src=".../gidget.min.js"></script>
<script type="text/javascript" src=".../gidget.bootstrappers.sammy.min.js"></script>
```

We're going to follow the composition root pattern in standing up our route engine. If you're not familiar with that, check out http://blog.ploeh.dk/2011/07/28/CompositionRoot/.

First let's create a route module/controller:
```JavaScript
Hilary.scope('myWebApp').register({
    name: 'homeController',
    dependencies: ['GidgetModule', 'jQuery'],
    factory: function (GidgetModule, $) {
        "use strict";

        var self = new GidgetModule();

        self.get['/sammy_hilary'] = function (params) {
            var html = '<h1>Gidget with the Sammy Bootstrapper and hilary</h1>'
                    + '<p>This example uses the Gidget DSL with Sammy.js for routing and hilary as the IoC Container</p>';

            $('#main').html(html);
        };

        self.get['/sammy_hilary/#/example1'] = function (params) {
            $('#main').html('<h1>/sammy_hilary/#/example1</h1>');
        };

        self.get['/sammy_hilary/#/example2'] = function (params) {
            $('#main').html('<h1>/sammy_hilary/#/example2</h1>');
        };

        return self;
    }
});
```

And how about another route module/controller - this time one that supports parameters and has a lifecycle:
```JavaScript
Hilary.scope('myWebApp').register({
    name: 'breweriesController',
    dependencies: ['GidgetModule', 'jQuery'],
    factory: function (GidgetModule, $) {
        "use strict";

        var self = new GidgetModule(),
            paramsToHtml,
            logLifecycle,
            breweriesHandler,
            beersHandler;

        paramsToHtml = function (params) {
            var html = '',
                i,
                prop;

            for (prop in params) {
                if (params.hasOwnProperty(prop) && prop !== 'splat') {
                    html += '<p>params.' + prop + ' = ' + params[prop] + '</p>';
                }
            }

            if (params.splat) {
                for (i = 0; i < params.splat.length; i += 1) {
                    html += '<p>params.splat[' + i.toString() + '] = ' + params.splat[i] + '</p>';
                }
            }

            return html;
        };

        logLifecycle = function (message, verb, path, params) {
            console.log(message, {
                verb: verb,
                path: path,
                params: params
            });
        };

        breweriesHandler = function (params) {
            $('#main').html('<h1>/sammy_hilary/#/breweries/:brewery</h1>' + paramsToHtml(params));
        };

        breweriesHandler.before = function (verb, path, params) {
            logLifecycle('before breweries route', verb, path, params);
        };

        breweriesHandler.after = function (verb, path, params) {
            logLifecycle('after breweries route', verb, path, params);
        };

        beersHandler = function (params) {
            $('#main').html('<h1>/sammy_hilary/#/breweries/:brewery/beers/:beer</h1>' + paramsToHtml(params));
        };

        self.get['/sammy_hilary/#/breweries/:brewery'] = breweriesHandler;
        self.get['/sammy_hilary/#/breweries/:brewery/beers/:beer'] = beersHandler;

        return self;
    }
});
```

OK, now that we have some controllers, let's start the app:
```JavaScript
(function (scope, $, Sammy, Gidget) {
    "use strict";

    var compose, configureRoutes, configureApplicationContainer;

    /*
    // compose the application and dependency graph
    */
    compose = function (onReady) {
        var gidget = new Gidget({
            routerName: 'bootstrappers.sammy',
            router: new Sammy('#main', function () {}),
            callback: function (gidgetApp) {
                configureApplicationContainer(gidgetApp);

                // Start handler
                configureRoutes(gidgetApp);
                gidgetApp.routeEngine.start();
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
    // Register Modules
    */
    configureRoutes = function (gidget) {
        gidget.registerModule(scope.resolve('homeController'));
        gidget.registerModule(scope.resolve('breweriesController'));
    };

    // START
    compose();

}(Hilary.scope('myWebApp'), jQuery, Sammy, Gidget));
```

Great. Now let's take advantage of the application lifecycle. We're going to add before and after handlers to log our actions out to the console:
```JavaScript
configureApplicationLifecycle = function (pipelines) {
    pipelines.before(function (verb, path, params) {
        console.log('about to navigate to:', { verb: verb, path: path, params: params });
    });

    pipelines.after(function (verb, path, params) {
        console.log('finished navigating to:', { verb: verb, path: path, params: params });
    });
};
```

When we're done, it should look like this:
```JavaScript
(function (scope, $, Sammy, Gidget) {
    "use strict";

    var compose, configureRoutes, configureApplicationContainer, configureApplicationLifecycle;

    /*
    // compose the application and dependency graph
    */
    compose = function (onReady) {
        var gidget = new Gidget({
            routerName: 'bootstrappers.sammy',
            router: new Sammy('#main', function () {}),
            callback: function (gidgetApp) {
                configureApplicationContainer(gidgetApp);
                configureApplicationLifecycle(gidgetApp.pipelines());

                // Start handler
                configureRoutes(gidgetApp);
                gidgetApp.routeEngine.start();
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
        gidget.registerModule(scope.resolve('homeController'));
        gidget.registerModule(scope.resolve('breweriesController'));
    };

    // START
    compose();

}(Hilary.scope('myWebApp'), jQuery, Sammy, Gidget));
```

When we run this app, we should be able to navigate to the following routes and see the result:
```
/sammy_hilary/#/example1
/sammy_hilary/#/example2
/sammy_hilary/#/breweries/straub
/sammy_hilary/#/breweries/straub/beers/light
/sammy_hilary/#/breweries/straub/beers/lager
/sammy_hilary/#/breweries/straub/beers/amber
```
