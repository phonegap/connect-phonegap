<script type="text/javascript">
(function (global, factory) {
    "use strict";

    if (typeof global.define === 'function' && global.define.amd) {
        global.require(['socket.io/socket.io'], factory);
    }
    else if (typeof exports === 'object') {
        module.exports = factory(require('socket.io'));
    }
    else {
	    var tag = document.createElement('script');

	    tag.src = '/socket.io/socket.io.js';

	    tag.onload = function(){
		    factory(global.io);
	    };

	    document.body.appendChild(tag);
    }
}(this, function (io) {
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
        },
        assert:function(assertion, msg){
            previousConsole.assert && previousConsole.assert(assertion, msg);
            if(assertion){
                socket.emit('console','assert', msg);
            }
        }
    }
}));
</script>
