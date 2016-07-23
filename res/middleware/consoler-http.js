(function(window) {
    var socket = io('http://' + document.location.host);
    
    // Copy the functions to avoid stack overflow
    var previousConsole = Object.assign({}, window.console);
        
    // Overwrite these individually to preserve other log properties
    window.console.log = function(){
        if(previousConsole.log) {
            previousConsole.log.apply(previousConsole, arguments);
        }
        socket.emit('console','log', Array.prototype.slice.call(arguments).join(' '));
    };
    
    window.console.warn = function(){
        if(previousConsole.warn) {
            previousConsole.warn.apply(previousConsole, arguments);
        }
        socket.emit('console','warn', Array.prototype.slice.call(arguments).join(' '));
    };
    
    window.console.error = function(){
        if(previousConsole.error) {
            previousConsole.error.apply(previousConsole, arguments);
        }
        socket.emit('console','error', Array.prototype.slice.call(arguments).join(' '));
    };
    
    window.console.assert = function(assertion) {
        if(previousConsole.assert) {
            previousConsole.assert.apply(previousConsole, arguments);
        }
        if(assertion){
            socket.emit('console','assert', Array.prototype.slice.call(arguments, 1).join(' '));
        }
    };
})(window);
