(function (testScope, scope) {
    'use strict';

    testScope.register({
        name: 'gidget.blueprint.fixture',
        dependencies: ['describe', 'it', 'expect'],
        factory: function (describe, it, expect) {

            describe('Blueprints in gidget', function () {

                describe('when a module declares a blueprint', function () {

                    it('should implement the Blueprint that it declares', function () {
                        // when
                        var actual = scope.validateBlueprints();

                        if (actual.result === false) {
                            console.log('blueprint errors:', actual.errors);
                        }

                        // then
                        expect(actual.result).to.equal(true);
                    });

                });

                describe('when a GidgetModule is created', function () {

                    it('should implement IGidgetModule', function () {
                        // given
                        var IGidgetModule = scope.resolve('IGidgetModule'),
                            GidgetModule = scope.resolve('GidgetModule'),
                            modl = new GidgetModule(),
                            actual;

                        // when
                        actual = IGidgetModule.syncSignatureMatches(modl);

                        // then
                        expect(actual.result).to.equal(true);
                    });

                });

            });

        }
    });

}(Hilary.scope('gidget-tests'), Hilary.scope('GidgetContainer')));
