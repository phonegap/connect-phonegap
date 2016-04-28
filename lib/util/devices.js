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
    var toRemoveIdx = [];
    if(options.devices) {
      for(var i = 0, j = options.devices.length ; i < j ; i++) {
        var curTimestamp = Date.now();
        if(curTimestamp > options.devices[i].timestamp + 10000) {
          toRemoveIdx.push(i);
        }
      }
      for(var i = 0, j = toRemoveIdx.length ; i < j ; i++) {
        options.devices.splice(toRemoveIdx[i], 1);
      }
    }
  }
}
