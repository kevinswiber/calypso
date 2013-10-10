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
var Query = require('calypso').Query;
var UsergridSession = require('calypso-usergrid');

var session = UsergridSession.create({
  orgName: 'kevinswiber',
  appName: 'sandbox'
});

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

Takes a collection name or a constructor function that has been mapped.  (See: Mappings)

Returns a Query instance.

### Query#ql

Accepts the Calypso query language as a string.

```javascript
var query = Query.of('books')
  .ql('where title contains "breakfast"');
```

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

Examples:

`select * where name = "Kevin"'
`select * where age > 30`
`select * where age >= 30`
`select * where price < 10`
`select * where price <= 10`

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

CaQL has support for disjunctions, as well.

Example: `select * where name="Kevin" or name="Matt"`

### Sorting

#### order by

Results can be sorted.  A direction can be added.  Ascending (`asc`) is used by default.  Descending (`desc`) must be explicit.

Example: `select name, age order by age desc, name asc`

## License

MIT
