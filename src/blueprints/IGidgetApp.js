Hilary.scope('gidget').register({
    name: 'IGidgetApp',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidgetApp',
            start: 'function',
            routeEngine: 'object',
            pipeline: 'object',
            registerModule: {
                type: 'function',
                args: ['gidgetModule']
            },
            registerModules: {
                type: 'function',
                args: ['gidgetModules']
            }
        });
    }
});
