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
  var paramNamesPattern = /[\:\*]\w+/g;
  var queryStringPattern = /\?.*$/;
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

    route: function (route, name, callback) {
      // Create a regular expression from the route
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }

      // Default to the method present on the router
      if (!callback) {
        callback = this[name];
      }

      // Add the handler to Backbone.History
      Backbone.history.route(route, _.bind(function (fragment, queryString) {
        // Extract route parameters and query parameters
        var params = this._extractParameters(route, fragment, queryString);

        // Create argument array
        var args = [params];

        // Run the callback
        if (callback) {
          callback.apply(this, args);
        }

        // Trigger events
        this.trigger.apply(this, ['route:' + name].concat(args));
        this.trigger('route', name, args);
        Backbone.history.trigger('route', this, name, args);
      }, this));

      return this;
    },

    _routeToRegExp: function (route) {
      // Get route parameter names
      var names = _.map(route.match(paramNamesPattern), function (name) {
        return name.substring(1);
      });

      // Create RegExp with original method
      var regex = _routeToRegExp(route);

      // Include paramter names on regex object
      regex.names = names;
      return regex;
    },

    _extractParameters: function (route, fragment, queryString) {
      // Default to empty hash
      var params = {};

      // Parse query parameters and merge onto params hash
      if (queryString) {
        _.extend(params, Canal.options.deparam(queryString.substring(1)));
      }

      // Extract named/splat parameters and merge onto params hash
      var namedParams = _extractParameters(route, fragment);
      if (namedParams) {
        _.each(namedParams, function (param, i) {
          // Set names according to the names array on the regex object
          params[route.names[i]] = param;
        });
      }

      return params;
    }

  });

  // Extend Backbone.History
  // -----------------------
  _.extend(Backbone.History.prototype, {

    loadUrl: function (fragmentOverride) {
      // Get fragment
      var fragment = this.fragment = this.getFragment(fragmentOverride);

      // Extract and remove query string from fragment
      var queryString = fragment.match(queryStringPattern) || '';
      if (queryString) {
        queryString = queryString[0];
        fragment = fragment.replace(queryString, '');
      }

      // If a handler matches, run callback
      var matched = _.any(this.handlers, function (handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment, queryString);
          return true;
        }
      });
      return matched;
    }

  });

}).call(this);
