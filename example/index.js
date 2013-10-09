var Book = require('./models/book');
var Query = require('../query');
var session = require('./setup')();

var authorQuery = Query.of(Book)
  .ql('select * where author=@author',
      { author: 'Stephen Hawking' });

var titleQuery = Query.of(Book)
  .where('title', { contains: 'breakfast' });

session.find(authorQuery, function(err, books) {
  console.log(books);

  session.find(titleQuery, function(err, books) {
    console.log(books);
  });
});
