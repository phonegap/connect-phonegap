<script type="text/javascript">
  document.addEventListener("deviceready", function(){
    var port = 1234;
    var wsserver = cordova.plugins.wsserver;
    wsserver.start(port, {
        // WebSocket Server
        'onStart' : function(addr, port) {
            console.log(['Listening on', addr, 'on port' , port].join(" "));
        },
        'onStop' : function(addr, port) {
            console.log(['Stopped Listening on', addr, 'on port' , port].join(" "));
        },
        // WebSocket Connection
        'onOpen' : function(conn) {
            /* conn: {
             'uuid' : '8e176b14-a1af-70a7-3e3d-8b341977a16e',
             'remoteAddr' : '192.168.1.10',
             'acceptedProtocol' : 'my-protocol-v1',
             'httpFields' : {...}
             } */
            console.log('A user connected from '+conn.remoteAddr);
        },
        'onMessage' : function(conn, msg) {
            console.log(conn);
            console.log(msg);
            req = JSON.parse(msg);

            if(!req || !req.service || !req.action || !req.args) {
              throw new Error("Request needs to have service, action and args attributes");
            }

            var success = function(res) {
              console.log("sending success res ", res);
              wsserver.send(conn, JSON.stringify(res));
            };

            var error = function(e) {
              console.log("sending error", e);
              var err = {
                error: e
              }
              wsserver.send(conn, JSON.stringify(err));
            };
            if(cordova && cordova.exec) {
              cordova.exec(success, error, req.service, req.action, req.args);
            } else {
              throw new Error("Cordova is undefined or exec is not available");
            }
        },
        'onClose' : function(conn) {
            console.log('A user disconnected from '+conn.remoteAddr);
        }
    });
  });
</script>
