var Book = require('./models/book');

module.exports = function(mapping) {
  mapping 
    .of(Book)
    .at('books')
    .map('title')
    .map('author')
};
