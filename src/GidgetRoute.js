Hilary.scope('gidget').register({
    name: 'GidgetRoute',
    dependencies: ['IGidgetRoute', 'argumentValidator'],
    factory: function (IGidgetRoute, argumentValidator) {
        'use strict';

        return function (route) {
            if (!argumentValidator.validate(IGidgetRoute, route)) {
                return;
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
