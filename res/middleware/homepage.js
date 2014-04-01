<script type="text/javascript">
//
// Go to app's homepage on a three-finger tap.
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
        if (touchCount === 3) {
            e.preventDefault();
            window.history.back(window.history.length);
        }
    }, false);

})(window);
</script>
