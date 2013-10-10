var Ast = require('./ast');
var parser = require('./parser').parser;

parser.yy = Ast;

exports.parse = function(query) {
  return parser.parse(query);
};

