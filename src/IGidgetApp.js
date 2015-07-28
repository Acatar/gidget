Hilary.scope('GidgetContainer').register({
    name: 'IGidgetApp',
    dependencies: ['Blueprint', 'IRouteEngine'],
    factory: function (Blueprint, IRouteEngine) {
        'use strict';

        return new Blueprint({
            __blueprintId: 'IGidgetApp',
            GidgetModule: 'function',
            GidgetRoute: {
                type: 'function',
                args: ['route']
            },
            routeEngine: {
                validate: function (engine, errorArray) {
                    var validationResult = IRouteEngine.syncSignatureMatches(engine);
                    if (!validationResult.result) {
                        errorArray = errorArray.concat(validationResult.errors);
                    }
                }
            },
            pipelines: 'function',
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
