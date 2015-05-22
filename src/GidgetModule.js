/*globals Hilary*/
Hilary.scope('GidgetContainer').register({
    name: 'GidgetModule',
    factory: function () {
        "use strict";
        
        return function () {
            var self = {};
            
            self.get = {};
            self.post = {};
            self.put = {};
            self.del = {};
            self.any = {};
            
            return self;
        };
    }
});
