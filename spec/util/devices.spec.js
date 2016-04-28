var devices = require('../../lib/util/devices'),
    options = {},
    curAddress = "192.168.1.69";

describe('devices', function() {
    beforeEach(function() {
      options = {
        devices: [
          {ipaddress: "192.168.2.69", device: {platform: "android", version: "3.6.4"}},
          {ipaddress: "192.168.2.70", device: {platform: "ios", version: "4.0.0"}},
          {ipaddress: "192.168.2.71", device: {platform: "windows", version: "3.0.0"}},
          {ipaddress: "192.168.2.72", device: {platform: "ubuntu", version: "2.0.0"}},
          {ipaddress: "192.168.2.73", device: {platform: "tizen", version: "1.0.0"}},
          {ipaddress: "192.168.2.74", device: {platform: "blackberry", version: "0.1.1"}}
        ]
      };
    });
    describe('should find device by index', function() {
        it('should return -1 if device is not found', function () {
          curAddress = "192.168.2.68";
          expect(devices.findDeviceIdx(options, curAddress)).toEqual(-1);
        });
        it('should return -1 if device is not found', function () {
          curAddress = "192.168.2.71";
          expect(devices.findDeviceIdx(options, curAddress)).toEqual(2);
        });
    });
    describe('should update device timestamp', function() {
        it('should set device timestamp to Date.now()', function () {
          curAddress = "192.168.2.70"; 
          devices.updateDeviceTimestamp(options, curAddress);
          expect(options.devices[1].timestamp).toBeDefined();
        });
        it('should not set device timestamp if device is not present', function () {
          curAddress = "192.168.2.75";
          devices.updateDeviceTimestamp(options, curAddress);
          for(var i = 0 ; i < options.devices.length ; i += 1) {
            expect(options.devices[i].timestamp).not.toBeDefined();
          }
        });
    });
    describe('should clear expired devices', function() {
        it('should not clear non expired devices', function () {
          options.devices.forEach(function(device, index) {
            device.timestamp = Date.now() - 5000;
          });
          devices.clearExpired(options);
          expect(options.devices.length).toEqual(6);
        });
        it('should successfully clear expired devices that havent pinged in 10 seconds', function () {
          options.devices.forEach(function(device, index) {
            if(index % 2 === 0) {
              device.timestamp = Date.now() - 15000;
            } else {
              device.timestamp = Date.now() - 5000;
            }
          });
          devices.clearExpired(options);
          expect(options.devices.length).toEqual(4);
        });
    });
});

