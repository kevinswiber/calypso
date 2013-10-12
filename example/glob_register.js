var glob = require('glob');

module.exports = function(convention) {
  var mappings = [];
  glob.sync(convention.glob).forEach(function(file) {
    var model = require(file);
    var obj = new model();

    var collection = convention.collection(file, model);
    function register(mapping) {
      var map = mapping
        .of(model)
        .at(collection)

      Object.keys(obj).forEach(function(key) {
        if (obj.hasOwnProperty(key)) {
          var options = convention.property(key, obj);
          map.map(key, options);
        }
      });
    }

    mappings.push(register);
  });

  return mappings;
};
