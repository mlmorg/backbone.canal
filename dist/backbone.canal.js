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
  var _extractParameters = Backbone.Router.prototype._extractParameters;

  // Useful regex patters
  var paramNamesPattern = /[\:\*]\w+/g;
  var queryStringPattern = /\?.*$/;
  var plusPattern = /\+/g;
  var r20Pattern = /%20/g;

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
      },

      param: function (obj) {
        // Build param strings
        var params = _.map(obj, function (value, key) {
          return key + '=' + encodeURIComponent(value);
        });

        // Create full query param string
        return params.join('&').replace(r20Pattern, '+');
      }

    }

  };

  // Extend Backbone.Router
  // ----------------------
  _.extend(Backbone.Router.prototype, {

    route: function (route, name, callback) {
      if (!_.isRegExp(route)) {
        // Get route parameter names
        var names = _.map(route.match(paramNamesPattern), function (name) {
          return name.substring(1);
        });

        // Add the un-regexed route to the routes name array
        if (name) {
          this._routes = this._routes || {};
          this._routes[name] = this._routes[name] || [];
          this._routes[name].push({ url: route, names: names });

          // Sort the route array by numer of parameters
          this._routes[name] = _.sortBy(this._routes[name], function (route) {
            return -route.names.length;
          });
        }

        // Create a regular expression from the route
        route = this._routeToRegExp(route);
      }

      // Default callback to the method present on the router
      if (!callback) {
        callback = this[name];
      }

      // Add the handler to Backbone.History
      Backbone.history.route(route, _.bind(function (fragment, qs) {
        // Extract route parameters and query parameters
        var params = this._extractParameters(route, names, fragment, qs);

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

    url: function (name, params) {
      var routes = this._routes[name];
      params = _.clone(params);

      if (routes) {
        // Determine the best match for this route with the passed params
        var keys = _.keys(params);
        var route = _.find(routes, function (route) {
          var diff = _.difference(route.names, keys);
          return !diff.length;
        });

        // Build url, adding the parameters into the named/splat parts
        var url = route.url;
        _.each(route.names, function (name) {
          var regex = new RegExp('(\\(\\/)?[:\\*]' + name + '\\)?');
          url = url.replace(regex, params[name]);
          delete params[name];
        });

        // Add query parameters to url
        var query = Canal.options.param(params);
        if (query) {
          url += '?' + query;
        }

        return url;
      }
    },

    _extractParameters: function (route, names, fragment, qs) {
      // Default to empty hash
      var params = {};

      // Parse query parameters and merge onto params hash
      if (qs) {
        _.extend(params, Canal.options.deparam(qs.substring(1)));
      }

      // Extract named/splat parameters and merge onto params hash
      var namedParams = _extractParameters(route, fragment);
      if (namedParams) {
        _.each(namedParams, function (param, i) {
          // Set names according to the names array
          params[names[i]] = param;
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
      var qs = fragment.match(queryStringPattern) || '';
      if (qs) {
        qs = qs[0];
        fragment = fragment.replace(qs, '');
      }

      // If a handler matches, run callback
      var matched = _.any(this.handlers, function (handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment, qs);
          return true;
        }
      });
      return matched;
    }

  });

}).call(this);
