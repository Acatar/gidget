Hilary.scope('gidget').register({
    name: 'GidgetRequest',
    dependencies: ['is'],
    factory: function (is) {
        'use strict';

        return function (context) {
            var self = this,
                ctx;

            if (is.string(context)) {
                ctx = {};
            } else {
                ctx = context || {};
            }

            self.uri = context.uri;
            self.route = context.route;
            self.params = context.params;
            self.callback = context.callback;
        };
    }
});
