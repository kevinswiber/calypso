# calypso

* Use a SQL-like query language over any queryable data store.
* Automatically map query results to models.
* Protect against SQL injection with prepared statements.
* Create your own driver for your favorite database or web service!

## Install

`npm install calypso`

You'll also need a driver.  Check out the Usergrid driver here: https://github.com/kevinswiber/calypso-usergrid.

`npm install calypso-usergrid`

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

var session = engine.createSession();

var query = Query.of('books')
  .ql('select title, author as writer where author=@author')
  .params({ author: 'Stephen Hawking' });

session.find(query, function(err, books) {
  console.log(books);
});

// Output:
// [ { title: 'A Brief History of Time', writer: 'Stephen Hawking' } ]

```

### Query.of

Takes a collection name or a constructor function that has been mapped.  (See: [Mappings](#mappings))

Returns a Query instance.

### Query#ql

Accepts the Calypso query language as a string.

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

Constructor functions can be assigned mappings.  Calypso will automatically instantiate the object when receiving query results.  Here's a quick Getting Started.

1\. Set up a constructor function that assigns properties to instances.

```javascript
var Book = function() {
  this.title = null;
  this.writer = null;
};
```

2\. Set up a mapping for the constructor.

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

3\. Register mappings with the session.

```javascript
var UsergridDriver = require('calypso-usergrid');

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  })
});

var session = engine.createSession(function(config) {
  config.add(mapping);
});
```

4\. Query based on the JavaScript properties.

```javascript
var query = Query.of(Book)
  .ql('where writer=@writer')
  .params({ writer: 'Stephen Hawking' });

session.find(query, function(err, books) {
  console.log(books);
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

var engine = calypso.configure({
  driver: UsergridDriver.create({
    orgName: 'kevinswiber',
    appName: 'sandbox'
  })
});


var Book = function() {
  this.title = null;
  this.writer = null;
};

var mapping = function(config) {
  config
    .of(Book)
    .at('books')
    .map('title')
    .map('writer', { to: 'author' })
};


var session = engine.createSession(function(config) {
  config.add(mapping);
});

var factory = RepositoryFactory.create(session);

var bookRepository = factory.of(Book);

var id = 'd4d66224-f54e-11e2-9033-b1911fc0a0cc';

bookRepository.get(id, function(err, book) {
  console.log(book);
});
```

Output: `[ { title: 'A Brief History of Time', writer: 'Stephen Hawking' } ]`

## Calypso Query Language

The Calypso Query Language (CaQL) has support for field selection, field aliases, filters, and ordering.

### Field Selection

#### select (optional)

`select [fields | *]`

Select is optional.  If not provided, drivers should treat it as an unbounded field selection ('*').

#### fields

Fields can contain letters, numbers, underscores, and hyphens.

Deep field selections are allowed.

Example: `select client.address.street1`

Fields can be escaped using brackets as delimiters.

Example: `select [date of birth], age, name`

#### aliases

Fields can also be aliased.

Example: `select title as t, author as a`

### Filter Expressions

#### where

Starts a filter.

Example: `select title where author="Kurt Vonnegut"`

#### comparisons

CaQL supports the following comparison expressions:

Equality: `select * where name = "Kevin"`

Greater than: `select * where age > 30`

Greater than or equal to: `select * where age >= 30`

Less than: `select * where price < 10`

Less than or equal to: `select * where price <= 10`

#### contains

`select * where name contains "Kevin"`

#### location

The location expression supports a distance along with a latitude, longitude pair.

Example: `select * where location within 30 of 90.2342, 30.23432`

Note: Not all drivers may support this option.

#### conjunctions

CaQL has support for conjunctions using the keyword `and`.

Example: `select * where name="Kevin" and age=31`

#### disjunctions

CaQL has support for disjunctions, as well, using `or`.

Example: `select * where name="Kevin" or name="Matt"`

### Sorting

#### order by

Results can be sorted.  A direction can be added.  Ascending (`asc`) is used by default.  Descending (`desc`) must be explicit.

Example: `select name, age order by age desc, name asc`

## License

MIT
