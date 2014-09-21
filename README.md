# calypso

* Use a SQL-like query language over any queryable data store.
* Automatically map query results to models.
* Protect against SQL injection with prepared statements.
* Create your own driver for your favorite database or web service!

## Install

`npm install calypso`

You'll also need a driver.  Available drivers:

* MongoDB: https://github.com/kevinswiber/calypso-mongodb
* Usergrid: https://github.com/kevinswiber/calypso-usergrid
* LevelDB/LevelUP: https://github.com/kevinswiber/calypso-level
* Memory: https://github.com/kevinswiber/calypso-memory
* Postgres: https://github.com/mdobson/calypso-postgres

## Usage

```javascript
var calypso = require('calypso');
var Query = calypso.Query;
var UsergridDriver = require('calypso-usergrid');

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  })
});

engine.build(function(err, connection) {
  var session = connection.createSession();

  var query = Query.of('books')
    .ql('select title, author as writer where author=@author')
    .params({ author: 'Stephen Hawking' });

  session.find(query, function(err, books) {
    console.log(books);
  });
});

// Output:
// [ { title: 'A Brief History of Time', writer: 'Stephen Hawking' } ]

```

### Query.of

Takes a collection name or a constructor function that has been mapped.  (See: [Mappings](#mappings))

Returns a Query instance.

### Query#ql

Accepts Calypso Query Language as a string.

```javascript
var query = Query.of('books')
  .ql('where title contains "breakfast"');
```

### Query#params

Add parameters to prepared statements.  Parameters will be properly escaped to prevent SQL injection attacks.

```javascript
var query = Query.of('books')
  .ql('where title contains @term')
  .params({ term: 'breakfast' });
```


### Mappings

Constructor functions can be assigned mappings.  Calypso will automatically instantiate the object when receiving query results.  Here's a quick Getting Started guide.

1\. Require dependencies.

```javascript
var calypso = require('calypso');
var Query = calypso.Query;
var UsergridDriver = require('usergrid-calypso');
```

2\. Set up a constructor function that assigns properties to instances.

```javascript
var Book = function() {
  this.title = null;
  this.writer = null;
};
```

3\. Set up a mapping for the constructor.

```javascript
var mapping = function(config) {
  config
    .of(Book)
    .at('books')
    .map('title')
    .map('writer', { to: 'author' })
};
```

Notice we're mapping Book#writer to the data store's author property.

4\. Configure a new Calypso engine.

```javascript
var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  }),
  mappings: [mapping]
});
```

5\. Query based on the JavaScript properties.

```javascript
engine.build(function(err, connection) {
  var session = connection.createSession();

  var query = Query.of(Book)
    .ql('where writer=@writer')
    .params({ writer: 'Stephen Hawking' });

  session.find(query, function(err, books) {
    console.log(books);
  });
});
```

Output: `[ { title: 'A Brief History of Time', writer: 'Stephen Hawking' } ]`

## Sessions

Sessions are created by drivers.  See the Usergrid Driver for more information: https://github.com/kevinswiber/calypso-usergrid

### Session#find(query, callback)

This method returns an array of results.  It takes a query object and a callback in the form of `function(err, results)`.

### Session#get(query, id, callback)

The query passed to this method is without fields or filters.

Example:

```javascript
session.get(Query.of(Book), 1234, function(err, book) {
  console.log(book);
});
```

## Repositories

A repository can be used instead of sessions.  They provide similar functionality to sessions, except they are tied to a particular constructor.

Example:

```javascript
var calypso = require('calypso');
var Query = calypso.Query;
var RepositoryFactory = calypso.RepositoryFactory;
var UsergridDriver = require('calypso-usergrid');

var Book = function() {
  this.title = null;
  this.writer = null;
};

var bookMapping = function(config) {
  config
    .of(Book)
    .at('books')
    .map('title')
    .map('writer', { to: 'author' })
};

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  }),
  mappings: [bookMapping]
});

engine.build(function(err, connection) {
  var session = connection.createSession();

  var factory = RepositoryFactory.create(session);

  var bookRepository = factory.of(Book);

  var id = 'd4d66224-f54e-11e2-9033-b1911fc0a0cc';

  bookRepository.get(id, function(err, book) {
    console.log(book);
  });
});

```

Output: `[ { title: 'A Brief History of Time', writer: 'Stephen Hawking' } ]`

## Calypso Query Language

The Calypso Query Language (CaQL) has support for field selection, field aliases, filters, and ordering.

See the full specification here: [Calypso Query Language Specification](https://github.com/kevinswiber/caql#calypso-query-language-specification)

## License

MIT
