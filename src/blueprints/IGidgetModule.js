Hilary.scope('gidget').register({
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
            register: {
                type: 'blueprint',
                blueprint: new Blueprint({
                    __blueprintId: 'IGidgetModule.register',
                    get: {
                        type: 'function',
                        args: ['routePath', 'routeHandler']
                    },
                    post: {
                        type: 'function',
                        args: ['routePath', 'routeHandler']
                    },
                    put: {
                        type: 'function',
                        args: ['routePath', 'routeHandler']
                    },
                    del: {
                        type: 'function',
                        args: ['routePath', 'routeHandler']
                    }
                })
            }
        });
    }
});
