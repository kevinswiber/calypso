var Query = require('../query');

var Repository = module.exports = function(session, model) {
  this.session = session;
  this.model = model;
};

Repository.prototype.find = function(query, cb) {
  this.session.find(query, cb);
};

Repository.prototype.get = function(id, cb) {
  var query = Query.of(this.model)
  this.session.get(query, id, cb);
};

Repository.create = function(session, model) {
  return new Repository(session, model);
};
