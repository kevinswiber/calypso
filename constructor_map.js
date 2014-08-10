var ConstructorMap = module.exports = function() {
  this.constructor = null;
  this.collection = null;
  this.fields = {};
  this.fieldMap = {};
  this.isBare = false;
  this.key = '__calypsoKey';
};

ConstructorMap.prototype.of = function(constructor) {
  if (constructor) {
    this.constructor = constructor;
    constructor.__calypsoModelConfig = this;
  }

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

ConstructorMap.prototype.bare = function() {
  this.isBare = true;
  var ResultSet = function() {};

  this.of(ResultSet);

  return this;
};
