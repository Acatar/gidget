Hilary.scope('gidget').register({
    name: 'GidgetModule',
    dependencies: [],
    factory: function () {
        'use strict';

        return function () {
            var self = {};

            self.get = {};
            self.post = {};
            self.put = {};
            self.del = {};
            self.any = {};

            return self;
        };
    }
});
