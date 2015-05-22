/*globals describe, it, Gidget, chai, console*/
var expect = chai.expect;


describe('Gidget Sammy Bootstrapper', function () {
    "use strict";
    
    it('should exist on window', function () {
        expect(Gidget).to.not.be.undefined;
    });
});
