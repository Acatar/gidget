/*globals describe, it, chai*/
(function (exports, scope, gidgetScope, describe, it, expect) {
    'use strict';

    var compose, start;

    compose = function (onReady) {
        scope.register({ name: 'describe', factory: function () { return describe; } });
        scope.register({ name: 'it', factory: function () { return it; } });
        scope.register({ name: 'expect', factory: function () { return expect; } });
        scope.register({ name: 'is', factory: function () { return scope.getContext().is; } });
        scope.register({ name: 'gidgetScope', factory: function () { return gidgetScope; } });
        // scope.register({ name: 'Blueprint', factory: function () { return Hilary.Blueprint; } });

        if (onReady) {
            onReady();
        }
    };

    start = function () {
        scope.resolve('gidget.browser.fixture');
        scope.resolve('gidget.blueprint.fixture');
        scope.resolve('gidget.DefaultRouteEngine.registeringRoutes.fixture');
        scope.resolve('gidget.DefaultRouteEngine.pipelines.fixture');
    };

    compose(start);

}(window, Hilary.scope('gidget-tests'), Hilary.scope('gidget'), describe, it, chai.expect));
