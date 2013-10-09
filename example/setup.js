var register = require('./glob_register');
var MapConvention = require('./map_convention');
var UsergridSession = require('../').UsergridSession;

var sessionOptions = {
  org: 'kevinswiber',
  app: 'sandbox'
};

module.exports = function() {
  var convention = new MapConvention(__dirname + '/models/*.js');
  var config = register(convention);

  return UsergridSession.create(sessionOptions, config);
};
