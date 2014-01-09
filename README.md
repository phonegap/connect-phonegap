# phonegap-soundwave

> Connect middleware to stream a PhoneGap app.

## Examples

### Standalone

    var soundwave = require('phonegap-soundwave');
    soundwave.listen(3000);

### Express

    var soundwave = require('phonegap-soundwave'),
        express = require('express'),
        app = express();

    app.use(soundwave());
    app.listen(3000);

### Connect

    var soundwave = require('phonegap-soundwave'),
        connect = require('connect'),
        app = connect();

    app.use(soundwave());
    app.listen(3000);

### HTTP

    var soundwave = require('phonegap-soundwave'),
        http = require('http');

    var server = http.createServer(soundwave());
    server.listen(3000);
