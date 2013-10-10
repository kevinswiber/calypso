var MemorySession = require('../memory_session');
var Query = require('../').Query;
var Book = require('./models/book');
var data = require('./data');
var mappings = require('./book_map');

var session = MemorySession.create(data, function(config) {
  config.add(mappings);
});

var q = Query.of(Book);

session.find(q, function(err, result) {
  console.log(result);
});
