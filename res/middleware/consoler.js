<script src="/socket.io/socket.io.js"></script>
<script>
(function(window) {
    var socket = io('http://' + document.location.host);
    var previousConsole = window.console || {};
    window.console = {
        log:function(msg){
            previousConsole.log && previousConsole.log(msg);
            socket.emit('console','log', msg);
        },
        warn:function(msg){
           previousConsole.warn && previousConsole.warn(msg);
            socket.emit('console','warn', msg);
        },
        error:function(msg){
            previousConsole.error && previousConsole.error(msg);
            socket.emit('console','error', msg);
        }
    }
})(window);
</script>