var ConstructorMap = require('./constructor_map');
var Query = require('./query');
var Parser = require('./compiling/bootstrapper');
var Repository = require('./repository/repository');
var RepositoryFactory = require('./repository/repository_factory');

exports.Parser = Parser
exports.Query = Query;
exports.Repository = Repository;
exports.RepositoryFactory = RepositoryFactory;

var Engine = function(driver, mappings) {
  this.driver = driver;

  mappings.forEach(function(mapping) {
    var constructorMap = new ConstructorMap();
    mapping(constructorMap);
  });
};

Engine.prototype.build = function(cb) {
  this.driver.init(cb);
};

exports.configure = function(options) {
  var driver = options.driver;
  var mappings = options.mappings;

  return new Engine(driver, mappings);
};
