var Ast = require('./Ast');
var ConstructorMap = require('./constructor_map');

var Query = module.exports = function(modelConfig) {
  this.modelConfig = modelConfig;
  this.collection = this.modelConfig.collection;
  this.fields = [];
  this.filter = null;
  this.orderBy = '';
  this.querylang = null;
  this.preparedValues = null;
  this.raw = null;
};


Query.of = function(arg) {
  var config;

  if (typeof arg === 'string') {
    config = new ConstructorMap()
      .at(arg)
      .bare();
  } else if(typeof arg === 'function') {
    config = arg.__orm_model_config__;
  }

  var query = new Query(config); 
  return query;
};

Query.prototype.hasDetails = function() {
  return this.fields.length || this.filter || this.orderBy.length;
};

Query.prototype.ql = function(ql, values) {
  this.querylang = ql;

  if (values) {
    this.params(values);
  }

  return this;
};

Query.prototype.params = function(values) {
  var hasValues = !!this.preparedValues;

  if (values && typeof values === 'object') {
    if (!hasValues) {
      this.preparedValues = {};
      hasValues = true;
    };

    var self = this;
    Object.keys(values).forEach(function(key) {
      self.preparedValues[key] = Query.escape(values[key]);
    });
  }

  return this;
};

Query.prototype.raw = function(raw) {
  this.raw = raw;
  return this;
};

Query.prototype.select = function(fields) {
  if (!Array.isArray(fields)) {
    fields = [fields];
  }

  var self = this;
  fields.forEach(function(field) {
    field = self.modelConfig.fieldMap.hasOwnProperty(field)
              ? self.modelConfig.fieldMap[field]
              : field;

    self.fields.push(field);
  });

  return this;
};

Query.prototype.where = function(field, filter) {
  field = this.modelConfig.fieldMap.hasOwnProperty(field)
            ? this.modelConfig.fieldMap[field]
            : field;

  var keys = Object.keys(filter);

  var f = null;

  if (keys[0] === 'contains') {
    f = new Ast.ContainsPredicateNode(field, Query.escape(filter['contains']));
  };

  if (keys[0] === 'equals') {
    f = new Ast.ComparisonPredicateNode(field, 'eq', Query.escape(filter['equals']));
  };

  if (this.filter) {
    this.filter = new Ast.ConjunctionNode(this.filter, f);
  } else {
    this.filter = f;
  }

  return this;
};

Query.prototype.build = function() {
  if (this.raw) {
    return { type: 'raw', value: this.raw };
  }

  if (this.querylang) {
    return { type: 'ql', value: { ql: this.querylang, params: this.preparedValues } };
  };

  var fieldListNode = new Ast.FieldListNode();
  fieldListNode.fields = this.fields;

  var statement = new Ast.SelectStatementNode(fieldListNode, this.filter, null);
  return { type: 'ast', value: statement };
};

Query.escape = function(value) {
  var val = value;

  if (!val) {
    return '';
  }

  var type = typeof val;

  if (type === 'number') {
    val = val.toString();
  }

  val = val
    .replace(/\x00/g, '\0')
    .replace(/\x08/g, '\b')
    .replace(/\x09/g, '\t')
    .replace(/\x0a/g, '\n')
    .replace(/\x0d/g, '\r')
    .replace(/\x1a/g, '\Z')
    .replace(/\x22/g, '\"')
    .replace(/\x25/g, '\%')
    .replace(/\x27/g, '\\\'')
    .replace(/\x5c/g, '\\')
    .replace(/\x5f/g, '\_')

  return val;
};
