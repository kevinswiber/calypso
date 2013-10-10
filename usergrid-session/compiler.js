var parser = require('../parser');

var UsergridCompiler = function(options) {
  this.fields = [];
  this.sorts = '';
  this.filter = [];
  this.query = [];
  this.params = {};

  this.removeUUID = false;
  this.removeType = false;

  if (options && options.quoteStrings) {
    this.quoteStrings = true;
  }

  if (options && options.uri) {
    this.uri = options.uri;
  }
};

UsergridCompiler.prototype.visit = function(node) {
  this['visit' + node.type](node);
};

UsergridCompiler.prototype.compile = function(options) {
  if (options.quoteStrings) {
    this.quoteStrings = true;
  };

  var query = options.query.build();
  
  if (query.type === 'ast') {
    query.value.accept(this);
  } else if (query.type === 'ql') {
    this.quoteStrings = false;
    var ast = parser.parse(query.value.ql);
    this.params = query.value.params;
    ast.accept(this);
  } else if (query.type === 'raw') {
    return query.value;
  }

  var fieldMap = {};
  var fields = [];
  var hasFields = false;
  var hasFieldMap = false;
  
  this.fields.forEach(function(field) {
    if (field.name) {
      fields.push(field.name);
      hasFields = true;
      if (field.alias) {
        fieldMap[field.name] = field.alias;
        hasFieldMap = true;
      }
    }
  });

  var statement = 'select ' + fields.join(', ');

  if (this.filter.length) {
    statement += ' where ' + this.filter.join(' ');
  }

  if (this.sorts) {
    statement += ' order by ' + this.sorts;
  }

  return {
    ql: statement,
    fields: hasFields ? fields : null,
    fieldMap: hasFieldMap ? fieldMap : null
  };
};

UsergridCompiler.prototype.visitSelectStatement = function(statement) {
  if (!statement.fieldListNode.fields.length) {
    statement.fieldListNode.push('*');
  }

  statement.fieldListNode.accept(this);

  if (statement.filterNode) {
    statement.filterNode.accept(this);
  }
  if (statement.orderByNode) {
    statement.orderByNode.accept(this);
  }
};

UsergridCompiler.prototype.visitFieldList = function(fieldList) {
  this.fields = fieldList.fields;
  /*if (this.fields[0] !== '*') {
    if (this.fields.indexOf('uuid') === -1) {
      this.fields.push('uuid');
      this.removeUUID = true;
    }
    if (this.fields.indexOf('type') === -1) {
      this.fields.push('type');
      this.removeType = true;
    }
  }*/
};

UsergridCompiler.prototype.visitFilter = function(filterList) {
  filterList.expression.accept(this);
};

UsergridCompiler.prototype.visitOrderBy = function(orderBy) {
  this.sorts = orderBy.sortList.sorts.map(function(sort) {
    var str = sort.field;
    if (sort.direction) {
      str += ' ' + sort.direction;
    }

    return str;
  }).join(' ');
};

UsergridCompiler.prototype.visitLocationPredicate = function(location) {
  if (location.operator !== 'within') {
    return;
  }

  if (location.isNegated) {
    this.filter.push('not');
  }

  this.filter.push('location within');
  this.filter.push(location.value.distance);
  this.filter.push('of');
  this.filter.push(location.value.coordinates.lattitude + ',');
  this.filter.push(location.value.coordinates.longitude);
};

UsergridCompiler.prototype.visitConjunction = function(conjunction) {
  if (conjunction.isNegated) {
    this.filter.push('not');
  }
  this.filter.push('(');
  conjunction.left.accept(this);
  this.filter.push('and');
  conjunction.right.accept(this);
  this.filter.push(')');
};

UsergridCompiler.prototype.visitDisjunction = function(disjunction) {
  if (disjunction.isNegated) {
    this.filter.push('not');
  }
  this.filter.push('(');
  disjunction.left.accept(this);
  this.filter.push('or');
  disjunction.right.accept(this);
  this.filter.push(')');
};

UsergridCompiler.prototype.visitContainsPredicate = function(contains) {
  if (typeof contains.value === 'string'
      && contains.value[0] === '@' && this.params) {
    contains.value = this.params[contains.value.substring(1)];
  }

  if (typeof contains.value === 'string'
      && contains.value[0] === '"' && contains.value[contains.value.length - 1] === '"') {
      var value = contains.value.substring(1, contains.value.length - 1);
      value = value.replace("'", "\\'");
      contains.value = "'" + value + "'";
  }

  var expr = [contains.field, 'contains', contains.value];

  this.filter.push(expr.join(' '));
};

UsergridCompiler.prototype.visitComparisonPredicate = function(comparison) {
  if (!comparison.array) comparison.array = [];

  var isParam = false;

  if (typeof comparison.value === 'string'
      && comparison.value[0] === '@' && this.params) {
    comparison.value = this.params[comparison.value.substring(1)];
    isParam = true;
  }

  if (this.quoteStrings || isParam) {
    if (typeof comparison.value === 'string') {
      comparison.value = '\'' + comparison.value + '\'';
    }
  }

  if (typeof comparison.value === 'string'
      && comparison.value[0] === '"' && comparison.value[comparison.value.length - 1] === '"') {
      comparison.value = '\'' + comparison.value.slice(1, -1) + '\'';
  }

  var expr = [comparison.field, comparison.operator, comparison.value];
  if (comparison.isNegated) {
    expr.unshift('not');
  }
  comparison.array.push(expr.join(' '));
  this.filter.push(expr.join(' '));
};

module.exports = function(options) {
  return new UsergridCompiler(options);
};

