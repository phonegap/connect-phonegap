# connect-phonegap [![Build Status][travis-ci-img]][travis-ci-url] [![Build status](https://ci.appveyor.com/api/projects/status/3ka36c9k47vnbi0s/branch/master?svg=true)](https://ci.appveyor.com/project/stevengill/connect-phonegap/branch/master) [![bitHound Score][bithound-img]][bithound-url] [![codecov](https://codecov.io/gh/phonegap/connect-phonegap/branch/master/graph/badge.svg)](https://codecov.io/gh/phonegap/connect-phonegap)

> Connect middleware to serve a PhoneGap app.

## What is it?

  A fine question for an even finer middleware. `connect-phonegap` is a server that runs on your development machine (typically through the `phonegap-cli`) and serves your PhoneGap app to the accompanying PhoneGap Developer App. `connect-phonegap` does this by watching your PhoneGap project and first sends a zip of the www/ to your app. When you update your project, the differences are then sent to your connected phone to display updates.

  To note: when the server sends content to your phone, the server is also injecting js inline into the .html pages. The injected scripts are for detecting changes on the server, logging, handling three/four finger taps, etc. Sometimes this may interfere with your own js code that you may write. Therefore, we have options in order to toggle these scripts.


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
  - `[console]` {Boolean} toggle console logging injection script - allows logs to be appears on your terminal(default: true).
  - `[deploy]` {Boolean} toggle deploy injection script - allows zips to be unzipped and deployed when sent to the client (default: true).
  - `[homepage]` {Boolean} toggle homepage injection script - allows the ability to three finger tap back to the landing page of the PhoneGap Developer App (default: true).
  - `[proxy]` {Boolean} toggle proxy injection script - for previewing the app from browser. Allows cors requests to be proxy'd through the server (default: true).
  - `[push]` {Boolean} toggle push injection script - allows push notifications to be used within the PhoneGap Developer App (default: true).
  - `[refresh]` {Boolean} toggle refresh injection script - allows four finger tap to hard refresh your app (default: true).

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
