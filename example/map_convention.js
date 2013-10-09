var inflect = require('inflect-js');
var Book = require('./models/book');

var MapConvention = module.exports = function(glob) {
  this.glob = glob;
};

MapConvention.prototype.collection = function(file, model) {
  var re = /([^\/\\]+)\.js$/;
  var match = re.exec(file);
  var name = match[1];

  return inflect.pluralize(name);
};

MapConvention.prototype.property = function(name, instance) {
  if (instance instanceof Book) {
    return { to: name };
  }
};

