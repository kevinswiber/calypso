var register = require('./glob_register');
var MapConvention = require('./map_convention');
var calypso = require('../');
var UsergridDriver = require('calypso-usergrid');

var convention = new MapConvention(__dirname + '/models/*.js');
var mappings = register(convention);

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  }),
  mappings: mappings
});

module.exports = function(cb) {
  engine.build(function(err, connection) {
    if (err) {
      return cb(err);
    }

    cb(null, connection.createSession());
  });
};
