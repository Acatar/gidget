/*globals Hilary, console*/
Hilary.scope('node-web-sammy').register({
    name: 'breweries_controller',
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

            if (params.splat) {
                for (i = 0; i < params.splat.length; i += 1) {
                    html += '<p>param[' + i.toString() + ']: ' + params.splat[i] + '</p>';
                }
            } else {
                for (prop in params) {
                    if (params.hasOwnProperty(prop)) {
                        html += '<p>' + prop + ': ' + params[prop] + '</p>';
                    }
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
            $('#main').html('<h1>/sammy_hilary/#/breweries/:id</h1>' + paramsToHtml(params));
        };

        breweriesHandler.before = function (verb, path, params) {
            logLifecycle('before breweries route', verb, path, params);
        };

        breweriesHandler.after = function (verb, path, params) {
            logLifecycle('after breweries route', verb, path, params);
        };

        beersHandler = function (params) {
            $('#main').html('<h1>/sammy_hilary/#/breweries/:id/beers/:beerId</h1>' + paramsToHtml(params));

            console.log('named-params', params);
        };

        self.get['/sammy_hilary/#/breweries/:id'] = breweriesHandler;
        self.get['/sammy_hilary/#/breweries/:id/beers/:beerId'] = beersHandler;

        return self;
    }
});
