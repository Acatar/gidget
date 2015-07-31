Hilary.scope('gidget').register({
    name: 'GidgetContext',
    factory: function () {
        'use strict';

        return function (context) {
            var self = this;

            context = context || {};

            self.verb = context.verb;
            self.route = context.route;
            self.params = context.params;
        };
    }
});
