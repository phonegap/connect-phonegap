
var getIP = require('../lib/getIP'),
    net = require('net'),
    ip = require('ip');

describe("module getIP", function() {
    console.log(socket);
    var socket = {address:function() {},on:function(){} };

    beforeEach(function() {
        spyOn(socket, 'address').and.returnValue({address:'0.0.0.0'});
        spyOn(net, 'createConnection').and.returnValue(socket); 
    });

    it("should export a function", function () {
        expect(getIP).toEqual(jasmine.any(Function));
    });
   
    describe("execution", function() {
        var cb = function(){};
        beforeEach(function() {
            getIP(cb);
        });

        it("should call net.createConnection", function () {
            expect(net.createConnection).toHaveBeenCalledWith(80, 'www.google.com');
        });

        
    });
    
    /*it("should call socket.address", function () {
        expect(socket.address).toHaveBeenCalled();    
    });*/ 
});
