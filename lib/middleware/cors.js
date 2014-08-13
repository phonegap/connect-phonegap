/*!
 * Module dependencies.
 */

/**
 * Cors Middlware.
 *
 * Set CORS headers.
 */

module.exports = function() {
    return function(req,res, next){
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
        }

        next();
    };
};
