Hilary.scope('gidget').register({
    name: 'IRouteEngineBootstrapper',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IRouteEngine',
            get: {
                type: 'function',
                args: ['path', 'callback']
            },
            post: {
                type: 'function',
                args: ['path', 'callback']
            },
            put: {
                type: 'function',
                args: ['path', 'callback']
            },
            del: {
                type: 'function',
                args: ['path', 'callback']
            },
            navigate: {
                type: 'function',
                args: ['path', 'pushStateToHistory']
            },
            start: {
                type: 'function',
                args: ['callback']
            }
        });
    }
});
