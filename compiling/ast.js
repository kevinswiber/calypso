var Ast = {};

Ast.SelectStatementNode = function(fieldListNode, filterNode, orderByNode) {
  this.fieldListNode = fieldListNode;
  this.filterNode = filterNode;
  this.orderByNode = orderByNode;
  this.type = 'SelectStatement';
};

Ast.FieldListNode = function(seed) {
  this.fields = [];

  if (seed) {
    this.fields.push(seed);
  }

  this.type = 'FieldList';
};

Ast.FieldListNode.prototype.push = function(field) {
  this.fields.push(field);
};

Ast.ColumnNode = function(name, alias) {
  this.name = name;
  this.alias = alias;

  this.type = 'Column';
};

Ast.FilterNode = function(expression) {
  this.expression = expression;
  this.type = 'Filter';
};

Ast.NotNode = function(expression){
  expression.negate();
  this.expression = expression;
  this.type = 'Not';
};

Ast.DisjunctionNode = function(left, right) {
  this.isNegated = false;
  this.left = left;
  this.right = right;
  this.type = 'Disjunction';
};

Ast.DisjunctionNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.ConjunctionNode = function(left, right) {
  this.isNegated = false;
  this.left = left;
  this.right = right;
  this.type = 'Conjunction';
};

Ast.ConjunctionNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.ComparisonPredicateNode = function(field, operator, value) {
  this.field = field;
  this.operator = operator;
  this.value = value;
  this.isNegated = false;
  this.type = 'ComparisonPredicate';
};

Ast.ComparisonPredicateNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.ContainsPredicateNode = function(field, value) {
  this.field = field;
  this.operator = 'contains';
  this.value = value;
  this.isNegated = false;
  this.type = 'ContainsPredicate';
};

Ast.ContainsPredicateNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.LikePredicateNode = function(field, value) {
  this.field = field;
  this.operator = 'like';
  this.value = value;
  this.isNegated = false;
  this.type = 'LikePredicate';
};

Ast.LikePredicateNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.LocationPredicateNode = function(field, value) {
  this.field = field;
  this.operator = 'within';
  this.value = value;
  this.isNegated = false;
  this.type = 'LocationPredicate';
};

Ast.LocationPredicateNode.prototype.negate = function() {
  this.isNegated = !this.isNegated;
  return this;
};

Ast.LocationNode = function(distance, coordinates) {
  this.distance = distance;
  this.coordinates = coordinates;
  this.type = 'Location'
};

Ast.CoordinatesNode = function(lattitude, longitude) {
  this.lattitude = lattitude;
  this.longitude = longitude;
  this.type = 'Coordinates';
};

Ast.OrderByNode = function(sortList) {
  this.sortList = sortList;
  this.type = 'OrderBy';
};

Ast.SortListNode = function(initial) {
  this.sorts = [initial];
  this.type = 'SortList';
};

Ast.SortListNode.prototype.push = function(item) {
  this.sorts.push(item);
};

Ast.SortNode = function(field, direction) {
  this.field = field;
  this.direction = direction ? direction.toLowerCase() : 'asc';
  this.type = 'Sort';
};

Object.keys(Ast).forEach(function(key) {
  if (Ast.hasOwnProperty(key)) {
    Ast[key].prototype.accept = function(visitor) {
      visitor.visit(this);
    };
  }
});

module.exports = Ast;

