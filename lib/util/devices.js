module.exports = {
  findDeviceIdx: function(options, curAddress) {
      if(options.devices) {
          for(var i = 0, j = options.devices.length ; i < j ; i++) {
            if(options.devices[i].ipaddress == curAddress) {
              return i;
            }
          }
          return -1;
      }
  },
  updateDeviceTimestamp: function(options, curAddress) {
    if(options.devices && options.devices.length > 0) {
      var deviceIdx = this.findDeviceIdx(options, curAddress);

      if(deviceIdx !== -1) {
        options.devices[deviceIdx].timestamp = Date.now();
        //console.log("updated timestamp to:", options.devices[deviceIdx].timestamp);
      }
    }
  },
  clearExpired: function(options) {
    if(options.devices) {
      //console.log("clearing stale connected devices");
      for(var i = 0, j = options.devices.length ; i < j ; i++) {
        var curTimestamp = Date.now();
        if(curTimestamp > options.devices[i].timestamp + 10000) {
          //console.log("Device", options.devices[i], "hasn't autoreloaded in a while. Removing it");
          options.devices.splice(i, 1);
        }
      }
    }
  }
}
