Hilary.scope('gidget').register({
    name: 'argumentValidator',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        'use strict';

        return {
            validate: function (blueprint, argument) {
                var isValid = blueprint.syncSignatureMatches(argument),
                    i;

                if (isValid.result) {
                    return true;
                } else {
                    for (i = 0; i < isValid.errors.length; i += 1) {
                        exceptions.throwArgumentException(isValid.errors[i]);
                    }
                    return isValid;
                }
            }
        };
    }
});
