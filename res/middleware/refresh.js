<script type="text/javascript">
//
// Refresh the app on a four-finger tap.
//
(function() {

    var currentTouches = {};

    document.addEventListener('touchstart', function(e) {
        var touch;
        for(var i = 0, l = e.touches.length; i < l; i++) {
            touch = e.touches[i];
            currentTouches[touch.identifier] = touch;
        }
    });

    document.addEventListener('touchend', function(e) {
        var touchCount = Object.keys(currentTouches).length;
        currentTouches = {};
        if (touchCount === 4) {
            e.preventDefault();
            window.location.reload(true);
        }
    }, false);

})(window);
</script>
