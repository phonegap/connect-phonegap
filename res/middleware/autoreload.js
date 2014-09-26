<script type="text/javascript" src="js/deploy.js"></script>
<script type="text/javascript" src="js/fileUtils.js"></script>
<script type="text/javascript">
//
// Reload the app if server detects local change
//
(function() {

    var host = 'http://127.0.0.1:3000',
        url = host + '/__api__/autoreload';

    function postStatus() {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
            }
        }
        xhr.send();
    }

    function checkForReload() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
                var response = JSON.parse(this.responseText);
                if (response.content.outdated) {
                    postStatus();
                    window.phonegap.app.downloadZip({
                        address: host
                    });
                }
            }
        }
        xhr.send();
    }

    setInterval(checkForReload, 1000 * 3);
})(window);
</script>
