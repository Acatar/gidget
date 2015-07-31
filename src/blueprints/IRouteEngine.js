Hilary.scope('gidget').register({
    name: 'IRouteEngine',
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
                args: ['path', 'data', 'pushStateToHistory']
            },
            beforeRouteResolution: {
                type: 'function',
                args: ['callback']
            },
            afterRouteResolution: {
                type: 'function',
                args: ['callback']
            },
            before: {
                type: 'function',
                args: ['callback']
            },
            after: {
                type: 'function',
                args: ['callback']
            },
            onError: {
                type: 'function',
                args: ['callback']
            },
            start: 'function',
            resolveRoute: {
                type: 'function',
                args: ['path']
            },
            resolveAndExecuteRoute: {
                type: 'function',
                args: ['path']
            },
            dispose: 'function'
        });
    }
});
