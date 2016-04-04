<script type="text/javascript">
(function() {

    var url = 'http://' + document.location.host + '/__api__/devices';

    function updateDeviceList(devices) {
        if(devices.length > 0) {
          var devicesEm = document.createElement("select");
          devicesEm.style.position = "absolute";
          devicesEm.style.top = "0px";
          devicesEm.style.right = "0px";
          devicesEm.id = "devices";
          for(var i = 0 , j = devices.length ; i < j ; i++) {
            var deviceEm = document.createElement("option");
            deviceEm.text = devices[i].device.platform + " " + devices[i].device.version;
            deviceEm.value = devices[i].ipaddress;
            deviceEm.style["background-color"] = "green";
            devicesEm.add(deviceEm);
          }
          var exDevicesEm = document.getElementById("devices");
          if(exDevicesEm) {
            var exDevicesParentEm = exDevicesEm.parentNode;
            exDevicesParentEm.replaceChild(devicesEm, exDevicesEm);
          } else {
            document.body.appendChild(devicesEm);
          }
        }
    }

    function checkForDevices() {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200 && this.responseText) {
                var response = JSON.parse(this.responseText);
                if (response.devices) {
                  updateDeviceList(response.devices);
                }
            }
        }
        xhr.send();
    }

    setInterval(checkForDevices, 1000 * 10);

})(window);

</script>
