<script type="text/javascript">
//
// Refresh the app on a four-finger tap.
//
(function() {

    function ontouchstart(event) {
        if (event.gesture.touches.length === 4) {
            Hammer(document.body).off('touch', ontouchstart, false);
            window.location.reload(true);
        }
    }

    Hammer(document.body).on('touch', ontouchstart, false);

})(window);
</script>
