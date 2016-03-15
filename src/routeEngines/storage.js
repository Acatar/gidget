Hilary.scope('gidget').register({
    name: 'storage',
    dependencies: [],
    factory: function () {
        'use strict';

        if (window.sessionStorage && window.sessionStorage.setItem && window.sessionStorage.getItem) {
            // sessionStorage is supported, prefer that
            return window.sessionStorage;
        }

        // sessionStorage is not supported, use volatile storage
        var self = {
                setItem: undefined, // name (string), payload (string)
                getItem: undefined // name (string)
            },
            storage = {};

        self.setItem = function (name, payload) {
            storage[name] = payload;
        };

        self.getItem = function (name) {
            return storage[name];
        };

        return self;
    }
});
