<script type="text/javascript">
(function(window) {
  var socket = new WebSocket('ws://127.0.0.1:3000');
  var previousConsole = window.console || {};
  window.console = {
    log:function(msg){
      previousConsole.log && previousConsole.log(msg);
      socket.send('log%!@$#'+msg);
    },
    warn:function(msg){
      previousConsole.warn && previousConsole.warn(msg);
      socket.send('warn%!@$#'+msg);
    },
    error:function(msg){
      previousConsole.error && previousConsole.error(msg);
      socket.send('error%!@$#'+msg);
    },
    assert:function(assertion, msg){
      previousConsole.assert && previousConsole.assert(assertion, msg);
      if(assertion){
        socket.send('assert%!@$#'+msg);
      }
    }
  }
})(window);

</script>
