/*globals describe, it, chai*/
(function (exports, scope, describe, it, expect) {
    'use strict';

    var compose, start;

    compose = function () {
        scope.register({ name: 'describe', factory: function () { return describe; } });
        scope.register({ name: 'it', factory: function () { return it; } });
        scope.register({ name: 'expect', factory: function () { return expect; } });
        // scope.register({ name: 'Blueprint', factory: function () { return Hilary.Blueprint; } });
    };


    start = function () {
        compose();

        scope.resolve('gidget.browser.fixture');
        scope.resolve('gidget.browser.bootstrappers.sammy.fixture');
        scope.resolve('gidget.blueprint.fixture');
    };

    start();

}(window, Hilary.scope('gidget-tests'), describe, it, chai.expect));
