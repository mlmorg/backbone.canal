(function () {

  "use strict";

  // Alias libraries
  var root = this;
  var _ = root._;
  var Backbone = root.Backbone;

  // References for overridden methods
  var _routeToRegExp = Backbone.Router.prototype._routeToRegExp;
  var _extractParameters = Backbone.Router.prototype._extractParameters;

  // Useful regex patters
  var paramIdentifiers = /[\:\*]/g;
  var paramNames = /[\:\*](\w+)/g;

  // Extend Backbone.Router
  // ----------------------
  _.extend(Backbone.Router.prototype, {

    _routeToRegExp: function (route) {
      // Get route parameter names
      var names = _.map(route.match(paramNames), function (name) {
        return name.replace(paramIdentifiers, '');
      });

      // Create RegExp with original method
      var regex = _routeToRegExp(route);

      // Include paramter names on regex object
      regex.names = names;
      return regex;
    },

    _extractParameters: function (route, fragment) {
      // Extract named/splat parameters into hash using original method
      var params = {};
      _.each(_extractParameters(route, fragment), function (param, i) {
        // Set names according to the names array on the regex object
        params[route.names[i]] = param;
      });

      // Return arguments array
      return [params];
    }

  });

}).call(this);
