
var getIP = require('../lib/getIP'),
    net = require('net'),
    ip = require('ip');

describe("module getIP", function() {
    var socket = {address:function() {},on:function(){} },
        default_port = 80,
        default_domain = 'www.google.com';

    beforeEach(function() {
        spyOn(socket, 'address').andReturn({address:'0.0.0.0'});
        spyOn(net, 'createConnection').andReturn(socket); 
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
            expect(net.createConnection).toHaveBeenCalledWith(default_port, default_domain);
        });

        
    });
    
    /*it("should call socket.address", function () {
        expect(socket.address).toHaveBeenCalled();    
    });*/ 
});
