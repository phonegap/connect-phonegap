# phonegap-soundwave [![Build Status][travis-ci-img]][travis-ci-url]

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

## API

    var soundwave = require('phonegap-soundwave');

### soundwave()

Returns a `http.Server` request listener that is also a compatible
`connect` middleware function.

Returns:

  - {Function} request listener

### soundwave.listen(port, [options])

Create an `http.Server` and listen on the specified port.
All arguments are passed directly into `http.listen(...)`.

See [http.listen](http://nodejs.org/api/http.html#http_server_listen_path_callback)
for details.

Returns:

  - {Object} that is an `http.Server` instance.

### soundwave.serve(options, [callback])

Convenience method to `soundwave.listen(...)` that supports PhoneGap CLI events.

Options:

  - `options`
    - `port` {Number} to listen on (Default: 3000).
  - `callback` {Function}
    - `e` {Error} is null unless there is an error.
    - `server` {Object}
      - `address` {String} is the server address.
      - `port` {Number} is the server port.

Events:

  - `error` is emitted when an error occurs.
  - `log` is emitted with server log info.

[travis-ci-img]: https://travis-ci.org/phonegap/node-phonegap-soundwave.png?branch=master
[travis-ci-url]: http://travis-ci.org/phonegap/node-phonegap-soundwave

