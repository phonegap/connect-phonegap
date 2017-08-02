(function(window) {
    var socket = io('http://127.0.0.1:3000');

    // Copy the functions to avoid stack overflow
    var previousConsole = Object.assign({}, window.console);

    // Overwrite these functions individually to preserve other console properties
    ['log', 'warn', 'error', 'assert'].forEach(function(func) {
        window.console[func] = function() {
            if (previousConsole[func]) {
                previousConsole[func].apply(previousConsole, arguments);
            }
            socket.emit('console', func, Array.prototype.slice.call(arguments).join(' '));
        };
    });
})(window);
