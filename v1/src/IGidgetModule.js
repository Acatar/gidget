Hilary.scope('GidgetContainer').register({
    name: 'IGidgetModule',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidgetModule',
            get: 'object',
            post: 'object',
            put: 'object',
            del: 'object',
            any: 'object'
        });
    }
});
