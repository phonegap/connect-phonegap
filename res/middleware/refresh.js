<script type="text/javascript">
    function touchStart(event){
        // reload
        if(event.touches.length == 4){
            document.body.removeEventListener('touchstart', touchStart, false);
            window.location.reload(true);
        }
    }

    document.body.addEventListener('touchstart', touchStart, false);
</script>
