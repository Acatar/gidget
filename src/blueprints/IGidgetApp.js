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
            PipelineEvent: {
                type: 'function',
                args: ['event']
            },
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
