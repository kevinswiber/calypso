var register = require('./glob_register');
var MapConvention = require('./map_convention');
var calypso = require('../');
var UsergridDriver = require('calypso-usergrid');

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  })
});

module.exports = function() {
  var convention = new MapConvention(__dirname + '/models/*.js');
  var config = register(convention);

  return engine.createSession(config);
};
