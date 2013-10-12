var Book = require('./models/book');
var Query = require('../').Query;
var setup = require('./setup')

var run = function(err, session) {
  var languageQuery = Query.of('books')
    .ql('select title, author as writer where author=@author')
    .params({ author: 'Stephen Hawking' });

  var objectQuery = Query.of(Book)
    .where('title', { contains: 'breakfast' }); // contains
    /*.select('title', 'author') // partial selection, returns as new object
    .select(function(obj) { return  [obj.title, obj.author] }) // mapping function
    .and('author', { equals: 'Kurt Vonnegut, Jr.' }) // equals, conjunction (alias of where)
    .and('age', { gte: 40 }) // gt, gte, lt, lte
    .and('location', { within: '50' of: [40.22, 83.333] }) // location
    .or(['title', { contains: 'breakfast' }], ['title', { contains: 'universe' }]) // disjunction
    .orderBy('location') // order by ascending (implicit)
    .orderByDescending('age') // order by (explicit)*/

  session.find(languageQuery, function(err, books) {
    console.log(books);

    session.find(objectQuery, function(err, books) {
      console.log(books);
    });
  });
};

setup(run);
