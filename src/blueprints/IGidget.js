Hilary.scope('gidget').register({
    name: 'IGidget',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidget',
            GidgetModule: {
                type: 'function',
                args: ['path', 'callback']
            },
            GidgetRoute: {
                type: 'function',
                args: ['route']
            }
        });
    }
});
