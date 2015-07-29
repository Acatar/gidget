Hilary.scope('gidget').register({
    name: 'IGidgetRoute',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidgetRoute',
            routeHandler: 'function'
        });
    }
});
