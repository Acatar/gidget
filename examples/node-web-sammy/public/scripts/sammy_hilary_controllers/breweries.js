Hilary.scope('node-web-sammy').register({
    name: 'breweries_controller',
    dependencies: ['GidgetModule', 'jQuery'],
    factory: function (GidgetModule, $) {
        'use strict';

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
