
(function(window) {
    var socket = io('http://127.0.0.1:3000');
    var previousConsole = window.console || {};
    window.console = {
        log:function(msg){
            if(previousConsole.log) {
                previousConsole.log(msg);
            }
            socket.emit('console','log', msg);
        },
        warn:function(msg){
            if(previousConsole.warn) {
                previousConsole.warn(msg);
            }
            socket.emit('console','warn', msg);
        },
        error:function(msg){
            if(previousConsole.error) {
                previousConsole.error(msg);
            }
            socket.emit('console','error', msg);
        },
        assert:function(assertion, msg) {
            if(previousConsole.assert) {
                previousConsole.assert(assertion, msg);
            }
            if(assertion){
                socket.emit('console','assert', msg);
            }
        }
    };
})(window);
