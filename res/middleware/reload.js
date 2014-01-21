<script type="text/javascript">
//
// Reload the app if server detects local change
//
(function() {

    function checkForReload() {
        var xhr = new XMLHttpRequest;
        xhr.open('get', 'http://' + document.location.host + '/cordova_live_reload', true);
        xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && /^[2]/.test(this.status)) {
                var reload = JSON.parse(this.responseText).reload;
                console.log('reload' + reload);
                if (reload) window.location.reload();
            }
        }
        xhr.send();
    }

    setInterval(checkForReload, 1000*5);

})(window);
</script>