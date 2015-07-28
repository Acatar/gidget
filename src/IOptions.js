Hilary.scope('GidgetContainer').register({
    name: 'IOptions',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IOptions',
            routerName: 'string'
        });
    }
});
