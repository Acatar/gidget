/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'exceptions',
    factory: function () {
        "use strict";
        
        var self = {
            makeException: undefined,
            argumentException: undefined,
            throwArgumentException: undefined,
            notImplementedException: undefined,
            throwNotImplementedException: undefined,
            throwException: undefined
        },
            makeException;
        
        makeException = function (name, message, data) {
            var msg = typeof message === 'string' ? message : name,
                err = new Error(msg);
            
            err.message = msg;

            if (name !== msg) {
                err.name = name;
            }

            if (data) {
                err.data = data;
            }
            
            return err;
        };
        
        self.makeException = makeException;
        
        self.argumentException = function (message, argument, data) {
            var msg = typeof argument === 'undefined' ? message : message + ' (argument: ' + argument + ')';
            return makeException('ArgumentException', msg, data);
        };
        
        self.throwArgumentException = function (message, argument, data) {
            self.throwException(self.argumentException(message, argument, data));
        };

        self.notImplementedException = function (message, data) {
            return makeException('NotImplementedException', message, data);
        };
        
        self.throwNotImplementedException = function (message, data) {
            self.throwException(self.notImplementedException(message, data));
        };
        
        self.throwException = function (exception) {
            throw exception;
        };
        
        return self;
    }
});
