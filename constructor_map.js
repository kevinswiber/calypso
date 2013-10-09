var ConstructorMap = module.exports = function() {
  this.constructor = null;
  this.collection = null;
  this.fields = {};
  this.fieldMap = {};
};

ConstructorMap.prototype.of = function(constructor) {
  this.constructor = constructor;
  constructor.__orm_model_config__ = this;
  return this;
};

ConstructorMap.prototype.at = function(collection) {
  this.collection = collection;
  return this;
};

ConstructorMap.prototype.map = function(field, options) {
  options = options || {};

  options.to = options.to || field;

  this.fields[field] = options;
  this.fieldMap[field] = options.to;

  return this;
};
