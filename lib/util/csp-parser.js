/**
 * Util function to return the csp string as an object. Forked from: 
 * https://github.com/helmetjs/content-security-policy-parser/blob/master/index.js
 *
 * Options:
 *
 *   - `policy` {String}
 */
module.exports = function (policy) {
  return policy.split(';').reduce(function (result, directive) {
    var split = directive.trim().split(/\s+/g)

    var key = split.shift()

    if (key) {
      result[key] = split
    }

    return result
  }, {})
}