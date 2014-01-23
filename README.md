# phonegap-soundwave [![Build Status][travis-ci-img]][travis-ci-url]

> Connect middleware to stream a PhoneGap app.

## Examples

### Standalone

    var soundwave = require('phonegap-soundwave');
    soundwave.serve();

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

### soundwave.serve(options, [callback])

Creates a local server to serve up the project. The intended
receiver is the PhoneGap App but any browser can consume the
content.

Options:

  - `options`
    - `port` {Number} to listen on (Default: 3000).
    - `[autoreload]` {Boolean} toggle AutoReload watch (default: true).
  - `callback` {Function}
    - `e` {Error} is null unless there is an error.
      - `data` {Object}
        - `server` {http.Server} is the server running.
        - `address` {String} is the server address.
        - `port` {Number} is the server port.

Events:

  - `error` is emitted when an error occurs.
  - `log` is emitted with server log info.

### soundwave.create(options)

The project is created from the same app template used by the PhoneGap CLI
and Cordova CLI. When a template does not exist, it is fetched and saved
in the common directory:

    ~/.cordova/lib/www/phonegap/VERSION/

Options:

  - `options` {Object}
    - `path` {String} is the path to create the project.
    - `version` {String} defines the PhoneGap app version.

Events:

  - `progress` emits state while downloading the app template.
    - `state` {Object} with `received`, `total`, and `percentage`.
  - `error` emitted when an error occurs.
    - `e` {Error}
  - `complete` emits when the project has been created.
    - `data` {Object} is indentical to the input `options`.

Example:

    soundwave.create({
        path: 'path/to/app',
        version: '3.3.0'
    })
    .on('progress', function(state) {
        // only emitted when downloading a template.
        // state values are only defined when response supports
        // content-length header.
        if (state.percentage) {
            console.log('downloaded: ' + state.percentage + '%');
        }
    }
    .on('error', function(e) {
        // handle error
    })
    .on('complete', function(data) {
        // data.path is the app path
        console.log('created project at: ' + data.path);
    });

[travis-ci-img]: https://travis-ci.org/phonegap/node-phonegap-soundwave.png?branch=master
[travis-ci-url]: http://travis-ci.org/phonegap/node-phonegap-soundwave

