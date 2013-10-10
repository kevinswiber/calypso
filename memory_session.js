var ConstructorMap = require('./constructor_map');
var Compiler = require('./memory_compiler');
var SessionConfig = require('./session_config');

var Session = module.exports = function(data) {
  this.data = data;
  this.config = null;
};

Session.prototype.init = function(config) {
  this.config = config;
};

function convertToModel(config, entity) {
  var obj = Object.create(config.constructor.prototype);
  var keys = Object.keys(config.fieldMap);
  
  keys.forEach(function(key) {
    var prop = config.fieldMap[key] || key;
    obj[key] = entity[prop];
  });

  return obj;
}

Session.prototype.find = function(query, cb) {
  var config = query.modelConfig;
  var querystring;

  var ql;
  var fields;
  var fieldMap;

  if (query) {
    var compilerOptions = {
      query: query,
      quoteStrings: true
    };

    var compiler = new Compiler();
    var compiled = compiler.compile(compilerOptions);

    ql = compiled.ql;
    fields = compiled.fields;
    fieldMap = compiled.fieldMap;
  }

  var results = this.data.map(function(datum) {
    return convertToModel(config, datum);
  });

  cb(null, results);
};

Session.prototype.get = function(query, id, cb) {
  var config = query.modelConfig;

  var result = convertToModel(config, data[0]);

  cb(null, result);
};

Session.create = function(data, configFunc) {
  var session = new Session(data);
  var config = new SessionConfig(session);

  if (configFunc) {
    configFunc(config);
  }

  session.init(config);

  return session;
};
