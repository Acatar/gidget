Hilary.scope('gidget').register({
    name: 'Route',
    factory: function () {
        'use strict';

        return function (route, caseSensitive) {
            var self = this,
                flags = caseSensitive ? '' : 'i';

            route = route || {};

            self.expression = new RegExp('^' + route.expressionString + '\/?$', flags);
            self.expressionString = route.expressionString;
            self.paramNames = route.paramNames;
            self.source = String(route.source);
            self.verb = route.verb;
        };
    }
});
