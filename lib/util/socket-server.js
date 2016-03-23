module.exports = {
    attachConsole:function(server) {
        var WebSocketServer = require('ws').Server;
        var wss = new WebSocketServer({server: server});
        wss.on('connection', function (ws) {
            ws.on('message', function (data, flags) {
                var args = data.split("%!@$#")
                var type = args[0]
                var message = args[1]
                
                switch(type) {
                    case 'warn' :
                        server.emit('log', '[console.warn]'.yellow, message);
                        break;
                    case 'assert' :
                        server.emit('log', '[console.assert]'.yellow, message);
                        break;
                    case 'error' :
                        server.emit('log', '[console.error]'.red, message);
                        break;
                    case 'log' : // intentional fallthrough
                    default : 
                        server.emit('log', '[console.log]'.green, message);
                        break;
                }
            });
        });
    }
}
