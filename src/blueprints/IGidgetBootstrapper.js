Hilary.scope('gidget').register({
    name: 'IGidgetBootstrapper',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidgetBootstrapper',
            compose: {
                type: 'function',
                args: ['onReady']
            },
            start: {
                type: 'function',
                args: ['gidgetApp']
            },
            configureRoutes: {
                type: 'function',
                args: ['gidgetApp']
            },
            configureApplicationContainer: {
                type: 'function',
                args: ['gidgetApp']
            },
            configureApplicationLifecycle: {
                type: 'function',
                args: ['gidgetApp', 'pipelines']
            }
        });
    }
});
