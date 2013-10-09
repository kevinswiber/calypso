var glob = require('glob');

module.exports = function(convention) {
  return function(config) {
    glob.sync(convention.glob).forEach(function(file) {
      var model = require(file);
      var obj = new model();

      var registration = function(mapping) {
        var collection = convention.collection(file, model);
        var map = mapping
          .of(model)
          .at(collection)

        Object.keys(obj).forEach(function(key) {
          if (obj.hasOwnProperty(key)) {
            var options = convention.property(key, obj);
            map.map(key, options);
          }
        });
      };

      config.add(registration);
    });
  };
};
