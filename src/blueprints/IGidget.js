Hilary.scope('gidget').register({
    name: 'IGidget',
    dependencies: ['Blueprint'],
    factory: function (Blueprint) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidget',
            GidgetModule: 'function',
            GidgetRoute: {
                type: 'function',
                args: ['route']
            },
            Bootstrapper: {
                type: 'function',
                args: ['scope', 'bootstrapper']
            }
        });
    }
});
