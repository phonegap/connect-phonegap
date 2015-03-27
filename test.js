var phonegap = require('./lib');

phonegap.create({
    path: '_testapp',
    version: '3.3.0'
})
.on('progress', function(state) {
    console.log('progress:', state);
})
.on('error', function(e) {
    console.error('error:', e);
})
.on('complete', function(data) {
    console.log('complete:', data);
});