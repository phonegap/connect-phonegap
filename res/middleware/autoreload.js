<script type="text/javascript">
//
// Reload the app if server detects local change
//
(function() {

    function checkForReload() {
        var xhr = new XMLHttpRequest;
        xhr.open('get', 'http://' + document.location.host + '/autoreload', true);
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
                var response = JSON.parse(this.responseText);
                if (response.outdated) {
                    window.location.reload();
                }
            }
        }
        xhr.send();
    }

    setInterval(checkForReload, 1000 * 3);

})(window);
</script>
