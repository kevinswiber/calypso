var Query = require('./query');
var Parser = require('./compiling/bootstrapper');
var Repository = require('./repository/repository');
var RepositoryFactory = require('./repository/repository_factory');
var SessionConfig = require('./session_config');

exports.Parser = Parser
exports.Query = Query;
exports.SessionConfig = SessionConfig;
exports.Repository = Repository;
exports.RepositoryFactory = RepositoryFactory;

var Engine = function(driver) {
  this.driver = driver;
};

Engine.prototype.createSession = function(config) {
  return this.driver.createSession(config);
};

exports.configure = function(options) {
  var driver = options.driver;

  return new Engine(driver);
};
