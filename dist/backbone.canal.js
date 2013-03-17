/*!
 * backbone.canal v0.1.0
 * Copyright 2013, Matt Morgan (@mlmorg)
 * MIT license
 */
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
  var paramIdentifiersPattern = /^[\:\*]/;
  var paramNamesPattern = /[\:\*]\w+/g;
  var queryParamIdentifierPattern = /^\?/;
  var queryParamsPattern = /\?.*$/;
  var plusPattern = /\+/g;

  // Backbone.Canal
  // --------------
  var Canal = Backbone.Canal = {

    configure: function (options) {
      return _.extend(this.options, options);
    },

    options: {

      deparam: function (string) {
        // Extract the key/value pairs
        var items = string.replace(plusPattern, ' ').split('&');

        // Build hash
        var obj = {};
        _.each(items, function (params) {
          var param = params.split('=');
          obj[param[0]] = decodeURIComponent(param[1]);
        });

        return obj;
      }

    }

  };

  // Extend Backbone.Router
  // ----------------------
  _.extend(Backbone.Router.prototype, {

    _routeToRegExp: function (route) {
      // Get route parameter names
      var names = _.map(route.match(paramNamesPattern), function (name) {
        return name.replace(paramIdentifiersPattern, '');
      });

      // Create RegExp with original method
      var regex = _routeToRegExp(route);

      // Include paramter names on regex object
      regex.names = names;
      return regex;
    },

    _extractParameters: function (route, fragment) {
      // Extract query parameters
      var query = {};
      var queryParams = fragment.match(queryParamsPattern);
      if (queryParams) {
        // Remove query parameters from fragment
        fragment = fragment.replace(queryParams[0], '');

        // Parse query parameters
        var parsedParams = Canal.options.deparam(
          queryParams[0].replace(queryParamIdentifierPattern, '')
        );

        // Add parsed query parameters into query hash
        _.each(parsedParams, function (value, key) {
          query[key] = value;
        });
      }

      // Extract named/splat parameters
      var params = {};
      var namedParams = _extractParameters(route, fragment);
      if (namedParams) {
        // Add parameters to the params hash
        _.each(namedParams, function (param, i) {
          // Set names according to the names array on the regex object
          params[route.names[i]] = param;
        });
      }

      // Return arguments array
      return [params, query];
    }

  });

}).call(this);
