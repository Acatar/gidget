Hilary.scope('node-web-sammy').register({
    name: 'homeController',
    dependencies: ['$gidgetModule', 'jQuery'],
    factory: function (self, $) {
        'use strict';

        self.get['/sammy_hilary'] = function () {
            var html = '<h1>Gidget with the Sammy Bootstrapper and hilary</h1>';
            html += '<p>This example uses the Gidget DSL with Sammy.js for routing and hilary as the IoC Container</p>';

            $('#main').html(html);
        };

        self.get['/sammy_hilary/#/example1'] = function () {
            $('#main').html('<h1>/sammy_hilary/#/example1</h1>');
        };

        self.get['/sammy_hilary/#/example2'] = function () {
            $('#main').html('<h1>/sammy_hilary/#/example2</h1>');
        };

        return self;
    }
});
