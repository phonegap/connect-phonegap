# connect-phonegap [![Build Status][travis-ci-img]][travis-ci-url] [![bitHound Score][bithound-img]][bithound-url]

> Connect middleware to serve a PhoneGap app.

## Examples

### Standalone

    var phonegap = require('connect-phonegap');
    phonegap.listen();

### Express

    var phonegap = require('connect-phonegap'),
        express = require('express'),
        app = express();

    app.use(phonegap());
    app.listen(3000);

### Connect

    var phonegap = require('connect-phonegap'),
        connect = require('connect'),
        app = connect();

    app.use(phonegap());
    app.listen(3000);

### HTTP

    var phonegap = require('connect-phonegap'),
        http = require('http');

    var server = http.createServer(phonegap());
    server.listen(3000);

## API

    var phonegap = require('connect-phonegap');

### phonegap()

Options:

  - `[options]` {Object}
  - `[autoreload]` {Boolean} toggle AutoReload watch (default: true).
  - `[localtunnel]` {Boolean} toggle localtunnel (default: false).

Events:

  - `error` is emitted when an error occurs.
  - `log` is emitted with log info.
  - `deviceConnected` is emitted whenever a new device connects to the server.

Return:

  - {Function} request listener that can be provided to `http.Server` or
    used as `connect` middleware.

Example:

    var phonegap = require('connect-phonegap')(),
        middleware = phonegap();

    // subscribe to events
    middleware.on('log', function() {
        console.log.apply(this, arguments);
    });

    // use as middleware
    app.use(middleware);

    // or

    // use as request listener
    http.createServer(middleware).listen(3000);

### phonegap.listen(options, [callback])
### phonegap.serve(options, [callback])

Creates a local server to serve up the project. The intended
receiver is the PhoneGap App but any browser can consume the
content.

Options:

  - `[options]`
    - `[port]` {Number} to listen on (Default: 3000).
    - all options available to phonegap() middleware.

Events:

   - `complete` is triggered when server starts.
    - `data` {Object}
      - `server` {http.Server} is the server running.
      - `address` {String} is the server address.
      - `port` {Number} is the server port.
  - `error` trigger when there is an error with the server or request.
    - `e` {Error} is null unless there is an error.
  - all events available to phonegap() middleware.
  - all events available to `http.Server`

Return:

  - {http.Server} instance that is also an event emitter.

Example:

    phonegap.listen()
            .on('complete', function(data) {
                // server is now running
            })
            .on('error', function(e) {
                // an error occured
            });
    });

[travis-ci-img]: https://travis-ci.org/phonegap/connect-phonegap.svg?branch=master
[travis-ci-url]: http://travis-ci.org/phonegap/connect-phonegap
[bithound-img]: https://www.bithound.io/github/phonegap/connect-phonegap/badges/score.svg
[bithound-url]: https://www.bithound.io/github/phonegap/connect-phonegap
