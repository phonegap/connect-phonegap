/**
 * Util function to help check and modify the csp so that 
 * an app being served can still connect to the server.
 *
 * Options:
 *
 *   - `cspObject` {Object}
 */

module.exports = function(cspObject) {
    // ensure these are set to allow communication with server:
    // default-src *
    // style-src 'self' 'unsafe-inline' data: blob:
    // script-src *  'unsafe-inline' 'unsafe-eval' data: blob: 
    
    addPolicyValue(cspObject, 'default-src', '*');

    addPolicyValue(cspObject, 'style-src', '\'self\'');   
    addPolicyValue(cspObject, 'style-src', '\'unsafe-inline\'');
    addPolicyValue(cspObject, 'style-src', 'data:');
    addPolicyValue(cspObject, 'style-src', 'blob:');

    addPolicyValue(cspObject, 'script-src', '*');   
    addPolicyValue(cspObject, 'script-src', '\'unsafe-inline\'');
    addPolicyValue(cspObject, 'script-src', '\'unsafe-eval\'');
    addPolicyValue(cspObject, 'script-src', 'data:');
    addPolicyValue(cspObject, 'script-src', 'blob:');

    var cspString = flattenCSPObject(cspObject);

    return cspString;
};

// Util function to return cspObject as a nice flattened string for use in html
flattenCSPObject = function(cspObject) {
    var flatCsp = '';
    for(var policy in cspObject) {
        flatCsp += policy + ' ' + cspObject[policy].join(' ') + ';';
    }

    return flatCsp;
}
// Util function to ensure some policy values are not present
cleanPolicyValue = function(cspObject, policy, value) {
    var index = cspObject[policy].indexOf('none');
    if(index >= 0) {
        cspObject[policy].splice(index, 1);
    }
}

// Util function to help add various policy values for a particular policy
addPolicyValue = function(cspObject, policy, value) {
    if(typeof cspObject[policy] == 'undefined') {
        cspObject[policy] = [];
    }

    cleanPolicyValue(cspObject, policy, value);

    var index = cspObject[policy].indexOf(value);
    if(index === -1) {
        cspObject[policy].push(value);
    }
};