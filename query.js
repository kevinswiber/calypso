var Ast = require('caql').Ast;
var ConstructorMap = require('./constructor_map');

var Query = module.exports = function(modelConfig) {
  this.modelConfig = modelConfig;
  this.collection = this.modelConfig.collection;
  this.mapper = null;
  this.fields = [];
  this.filter = null;
  this.sorts = [];
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
    config = arg.__calypsoModelConfig;
  }

  var query = new Query(config); 
  return query;
};

Query.prototype.hasDetails = function() {
  return this.fields.length || this.filter;
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
      var value = Query.escape(values[key]);
      self.preparedValues[key] = value;
    });
  }

  return this;
};

Query.prototype.raw = function(raw) {
  this.raw = raw;
  return this;
};

// Query API

Query.prototype.select = function(fields) {
  if (typeof fields === 'function') {
    this.mapper = fields;
  } else if (typeof fields === 'string') {
    var args = Array.prototype.slice.call(arguments);

    var self = this;
    args.forEach(function(field) {
      field = getField(field, self.modelConfig);
      self.fields.push(field);
    });
  }

  return this;
};

Query.prototype.where = Query.prototype.and = function(field, filter) {
  if (typeof field === 'object') {
    var keys = Object.keys(field);
    var query = this;

    keys.forEach(function(key) {
      query = query.where(key, { eq: field[key] });
    });

    return query;
  }

  field = getField(field, this.modelConfig);


  var keys = Object.keys(filter);
  var f = null;
  var isNegated = false;

  if (keys[0] === 'not') {
    filter = filter['not']
    keys = Object.keys(filter);
    isNegated = true;
  }

  var operator = keys[0];
  switch(operator) {
    case 'contains' :
      f = new Ast.ContainsPredicateNode(field, Query.escape(filter[operator]));
      break;
    case 'like' :
      f = new Ast.LikePredicateNode(field, Query.escape(filter[operator]));
      break;
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte':
    case 'eq':
      f = new Ast.ComparisonPredicateNode(field, operator, Query.escape(filter[operator]));
      break;
  }

  if (isNegated) {
    f.negate();
  }

  if (this.filter) {
    this.filter = new Ast.ConjunctionNode(this.filter, f);
  } else {
    this.filter = f;
  }

  return this;
};

Query.prototype.orderBy = function() {
  var args = Array.prototype.slice.call(arguments);
  var self = this;
  args.forEach(function(arg) {
    if (typeof arg === 'object') {
      var keys = Object.keys(arg);
      keys.forEach(function(key) {
        var field = key;
        var direction = arg[key];

        if (direction === 'ascending') {
          direction = 'asc';
        }
        else if (direction === 'descending') {
          direction = 'desc';
        }

        field = getField(field, self.modelConfig);
        self.sorts.push({ field: field, direction: direction });
      });
    } else if (typeof arg === 'string') {
      field = getField(arg, self.modelConfig);
      self.sorts.push({ field: arg, direction: 'asc' });
    }
  });

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

  if (!fieldListNode.fields.length) {
    fieldListNode.fields.push(new Ast.ColumnNode('*'));
  }

  var orderBy = null;
  if (this.sorts.length) {
    var sortList = new Ast.SortListNode();
    sortList.sorts.length = 0;
    this.sorts.forEach(function(sort) {
      sortList.push(new Ast.SortNode(sort.field, sort.direction));
    });

    orderBy = new Ast.OrderByNode(sortList);
  };

  var statement = new Ast.SelectStatementNode(fieldListNode, this.filter, orderBy);
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

function getField(field, modelConfig) {
  return modelConfig.fieldMap.hasOwnProperty(field)
         ? modelConfig.fieldMap[field]
         : field;
}
