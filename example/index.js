var Book = require('./models/book');
var Query = require('../query');
var session = require('./setup')();

var languageQuery = Query.of('books')
  .ql('select title, author where author=@author')
  .params({ author: 'Stephen Hawking' });

var objectQuery = Query.of(Book)
  .where('title', { contains: 'breakfast' });

session.find(languageQuery, function(err, books) {
  console.log(books);

  session.find(objectQuery, function(err, books) {
    console.log(books);
  });
});
