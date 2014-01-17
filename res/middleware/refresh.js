<script type="text/javascript">
//
// Refresh the app on a four-finger tap.
//
(function() {

    function ontouchstart(event) {
        if (event.touches.length === 4) {
            document.body.removeEventListener('touchstart', ontouchstart, false);
            window.location.reload(true);
        }
    }

    document.body.addEventListener('touchstart', ontouchstart, false);

})(window);
</script>
