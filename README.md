Gidget
==========

A Domain Service Language (DSL) for JavaScript SPAs and Node.js servers inspired by NancyFx and Sinatra

## Getting started

You can install Gidget with bower, or download the js files from the release directory.

```Shell
$ bower install --save gidget
```

Gidget depends on [Hilary](https://github.com/Acatar/hilaryjs), so you'll need to add two script tags to your DOM.

```HTML
<script src="/bower_components/hilary/release/hilary.min.js"></script>
<script src="/bower_components/gidget/release/gidget.min.js"></script>
```

### Gidget Modules
Let's start by creating a controller. We do this by creating instances of ``GidgetModule``.

```JavaScript
var controller = new GidgetModule();

controller.get['/'] = function (params) {
    console.log('Home');
};
```

Gidget has built in support for parameters:

```JavaScript
var controller = new GidgetModule();

controller.get['/breweries/:brewery/beers/:beer'] = function (params) {
    console.log('Brewery', params.brewery);
    console.log('Beer', params.beer);
};
```

### Starting Gidget (the Bootstrapper)
Gidget has a built in Bootstrapper to help you get started. You don't have to use it, but it's the easiest way to get started.

```JavaScript
Gidget.Bootstrapper({
    start: function (gidgetApp) {
        // perform any startup tasks such as binding your DOM
    },
    configureRoutes: function (gidgetApp) {
        // add your controllers
        // usually you would not define the controllers // here. you would merely register them
        var controller = new GidgetModule();

        controller.get['/'] = function (params) {
            console.log('Home');
        };

        controller.get['/breweries/:brewery/beers/:beer'] = function (params) {
            console.log('Brewery', params.brewery);
            console.log('Beer', params.beer);
        };

        gidgetApp.registerModule(controller);
    },
    configureApplicationLifecycle: function (gidetApp, pipelines) {
        pipelines.before(function (verb, path, params) {
            console.log('about to navigate to:', { verb: verb, path: path, params: params });
        });

        pipelines.after(function (verb, path, params) {
            console.log('finished navigating to:', { verb: verb, path: path, params: params });
        });
    }
});
```

If you are composing your application using Hilary, there are some additional features you can take advantage of. Note that in this example, we pass our Hilary scope into the Bootstrapper as the first argument.

```JavaScript
var scope = Hilary.scope('myScope');

Gidget.Bootstrapper(scope, {
    // ommited for brevity
    // start: ...
    // configureRoutes: ...
    // configureApplicationLifecycle: ...
    configureApplicationContainer: function (gidgetApp) {
        scope.register({
            name: 'example',
            factory: function () {
                console.log('example');
            }
        });
    }
});
```

Finally, if you are using a different RouteEngine, you can override the compose behavior:

```JavaScript
var scope = Hilary.scope('myScope');

Gidget.Bootstrapper(scope, {
    // ommited for brevity
    // start: ...
    // configureRoutes: ...
    // configureApplicationLifecycle: ...
    // configureApplicationContainer: ...
    compose: function (onReady) {
        var gidget;

        try {
            gidget = new Gidget({
                routeEngine: myRouteEngine()
            });

            onReady(null, gidget);
        } catch (e) {
            onReady('Whoops!');
        }
    }
});
```



## Router Dependencies
Gidget has a simple route engine that supports ``post``, ``put``, ``get``, and ``del``. Gidget can also be bootstrapped with a different route engine, such as Sammy.
