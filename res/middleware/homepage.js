<script type="text/javascript">
//
// Go to app's homepage on a three-finger tap.
//
(function() {

    function ontouchstart(event){
        if (event.gesture.touches.length === 3) {
            Hammer(document.body).off('touch', ontouchstart, false);
            window.history.back(window.history.length);
        }
    }
    Hammer(document.body).on('touch', ontouchstart, false);

})(window);
</script>
