var ConstructorMap = require('./constructor_map');

var SessionConfig = module.exports = function(session) {
  this.session = session;

  this.mappings = [];
};

SessionConfig.prototype.add = function(mapping) {
  var constructorMap = new ConstructorMap();
  mapping(constructorMap);

  this.mappings.push(constructorMap);

  return this;
};
