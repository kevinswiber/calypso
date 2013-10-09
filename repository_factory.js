var Repository = require('./repository');

var RepositoryFactory = module.exports = function(session) {
  this.session = session;
};

RepositoryFactory.prototype.of = function(model) {
  return Repository.create(this.session, model);
};

RepositoryFactory.create = function(session) {
  return new RepositoryFactory(session);
};
