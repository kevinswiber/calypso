var Book = require('./models/book');
var Query = require('../').Query;
var session = require('./setup')();

var languageQuery = Query.of('books')
  .ql('select title as t, author as a where author=@author')
  .params({ author: 'Stephen Hawking' });

var objectQuery = Query.of(Book)
  .where('title', { contains: 'breakfast' });

session.find(languageQuery, function(err, books) {
  console.log(books);

  session.find(objectQuery, function(err, books) {
    console.log(books);
  });
});
