/*!
 * Module dependencies.
 */
 
var archiver = require('archiver'),
    fs = require('fs'),
    generateZip = require('./ext/generate-zip'),
    path = require('path');
    
module.exports = function(options){
    return function(req, res, next){
        if (req.url.indexOf('/__api__/zip') === 0 && req.method === 'GET') {
            options.req = req;
            generateZip(options, function(e, data) {
                try {
                    if (e) throw e;
                    stats = fs.lstatSync(data.zipPath); // throws if path doesn't exist
                }
                catch (err) {
                    res.writeHead(404, {'Content-Type': 'text/plain'});
                    res.write('404 Not Found\n');
                    res.end();
                    return;
                }

                if (stats.isFile()) {
                    // path exists, is a file
                    res.writeHead(200, {'Content-Type': 'application/zip'} );

                    var stream = fs.createReadStream(data.zipPath);
                    stream.pipe(res);
                }
            });
        }
        else {
            next();
        }
    };
};

