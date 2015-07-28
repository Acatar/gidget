Hilary.scope('GidgetContainer').register({
    name: 'GidgetRoute',
    factory: function () {
        'use strict';

        return function (route) {
            if (!route) {
                throw new Error('GidgetRoute does not have a parameterless constructor');
            }

            if (typeof route.routeHandler !== 'function') {
                throw new Error('A routeHandler function is required when creating a new GidgetRoute');
            }

            var self = route.routeHandler;

            if (typeof route.before === 'function') {
                self.before = route.before;
            }

            if (typeof route.after === 'function') {
                self.after = route.after;
            }

            return self;
        };
    }
});
