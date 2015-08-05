Hilary.scope('gidget').register({
    name: 'IGidgetModule',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        var registerBp = new Blueprint({
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
        });

        return new Blueprint({
            __blueprintId: 'IGidgetModule',
            get: 'object',
            post: 'object',
            put: 'object',
            del: 'object',
            register: {
                validate: function (obj, errors) {
                    if (!registerBp.syncSignatureMatches(obj).result) {
                        errors = errors.concat(registerBp.syncSignatureMatches(obj).errors);
                    }
                }
            }
        });
    }
});
