var Compiler = module.exports = function (options) {
  this.fields = [];
  this.sorts = '';
  this.filter = [];
  this.query = [];
  this.params = {};
};

Compiler.prototype.compile = function(options) {
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
};

Compiler.prototype.visitSelectStatement = function(statement) {
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

Compiler.prototype.visitFieldList = function(fieldList) {
  this.fields = fieldList.fields;
};

Compiler.prototype.visitFilter = function(filterList) {
  filterList.expression.accept(this);
};

Compiler.prototype.visitOrderBy = function(orderBy) {
  this.sorts = orderBy.sortList.sorts.map(function(sort) {
    var str = sort.field;
    if (sort.direction) {
      str += ' ' + sort.direction;
    }

    return str;
  }).join(' ');
};

Compiler.prototype.visitLocationPredicate = function(location) {
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

Compiler.prototype.visitConjunction = function(conjunction) {
  if (conjunction.isNegated) {
    this.filter.push('not');
  }
  this.filter.push('(');
  conjunction.left.accept(this);
  this.filter.push('and');
  conjunction.right.accept(this);
  this.filter.push(')');
};

Compiler.prototype.visitDisjunction = function(disjunction) {
  if (disjunction.isNegated) {
    this.filter.push('not');
  }
  this.filter.push('(');
  disjunction.left.accept(this);
  this.filter.push('or');
  disjunction.right.accept(this);
  this.filter.push(')');
};

Compiler.prototype.visitContainsPredicate = function(contains) {
  var isParam = false;

  if (typeof contains.value === 'string'
      && contains.value[0] === '@' && this.params) {
    contains.value = this.params[contains.value.substring(1)];
    isParam = true;
  }

  if (typeof contains.value === 'string') {
    contains.value = normalizeString(contains.value, isParam);
  }

  var expr = [contains.field, 'contains', contains.value];

  this.filter.push(expr.join(' '));
};

Compiler.prototype.visitComparisonPredicate = function(comparison) {
  if (!comparison.array) comparison.array = [];

  var isParam = false;
  if (typeof comparison.value === 'string'
      && comparison.value[0] === '@' && this.params) {
    comparison.value = this.params[comparison.value.substring(1)];
    isParam = true;
  }

  if (typeof comparison.value === 'string') {
    comparison.value = normalizeString(comparison.value, isParam);
  }

  var op;

  switch (comparison.operator) {
    case 'eq':
      op = '===';
      break;
  }

  var expr = [comparison.field, op, comparison.value];
  comparison.array.push(expr.join(' '));
  this.filter.push(expr.join(' '));
};

var normalizeString = function(str, isParam) {
  if (str[0] === '\'' && str[str.length - 1] === '\'') {
    return str;
  }

  if (!isParam && str[0] === '"' && str[str.length - 1] === '"') {
    str = str.substring(1, str.length - 1);
  }

  str = JSON.stringify(str);

  str = str.substring(1, str.length - 1);
  str = str.replace("'", "\\'");
  str = str.replace('\\"', '"');

  str = "'" + str + "'";

  return str;
};
