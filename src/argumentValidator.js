Hilary.scope('gidget').register({
    name: 'argumentValidator',
    dependencies: ['locale', 'exceptions'],
    factory: function (locale, exceptions) {
        'use strict';

        return {
            validate: function (blueprint, argument) {
                var isValid = blueprint.syncValidateSignature(argument),
                    i;

                if (isValid.result) {
                    for (i = 0; i < isValid.errors.length; i += 1) {
                        exceptions.throwArgumentException(isValid.errors[i]);
                    }
                    return true;
                } else {
                    return isValid;
                }
            }
        };
    }
});
