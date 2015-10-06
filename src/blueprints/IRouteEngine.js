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
                args: ['path', 'payload', 'callback']
            },
            put: {
                type: 'function',
                args: ['path', 'payload', 'callback']
            },
            patch: {
                type: 'function',
                args: ['path', 'payload', 'callback']
            },
            del: {
                type: 'function',
                args: ['path', 'callback']
            },
            navigate: {
                type: 'function',
                args: ['pathOrOptions', 'data', 'pushStateToHistory']
            },
            updateHistory: {
                type: 'function',
                args: ['path', 'data']
            },
            register: {
                type: 'blueprint',
                blueprint: new Blueprint({
                    __blueprintId: 'IRouteEngine.register',
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
                    patch: {
                        type: 'function',
                        args: ['path', 'callback']
                    },
                    del: {
                        type: 'function',
                        args: ['path', 'callback']
                    },
                })
            },
            resolveRoute: {
                type: 'function',
                args: ['path', 'verb', 'payload']
            },
            resolveAndExecuteRoute: {
                type: 'function',
                args: ['path', 'verb', 'callback', 'payload']
            },
            start: 'function',
            dispose: 'function',
            pipeline: 'object'
        });
    }
});
