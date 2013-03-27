(function () {

  "use strict";

  // Alias libraries
  var root = this;
  var _ = root._;
  var Backbone = root.Backbone;

  // References for overridden methods
  var _constructor = Backbone.Router.prototype.constructor;
  var _extractParameters = Backbone.Router.prototype._extractParameters;
  var _getFragment = Backbone.History.prototype.getFragment;

  // Useful regex patters
  var paramNamesPattern = /(\(.*?)?[:\*]\w+\)?/g;
  var optionalParamPattern = /\(.*?[:\*](\w+)\)/;
  var queryStringPattern = /\?.*$/;
  var plusPattern = /\+/g;
  var r20Pattern = /%20/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

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
  Backbone.Router = Backbone.Router.extend({

    constructor: function () {
      this._routes = {};
      this._named = {};
      return _constructor.apply(this, arguments);
    },

    route: function (route, name, callback) {
      // Store information about the route on the router
      route = this._storeRoute(route, name);

      // Default callback to the method present on the router
      if (!callback) {
        callback = this[name];
      }

      // Add the handler to Backbone.History
      Backbone.history.route(route, _.bind(function (fragment) {
        // Extract route and query parameters
        var params = this._extractParameters(route, fragment);

        // Create argument array
        var args = [params];

        // Call any before filters
        _.each(this._getFilters(name, 'before'), function (filter) {
          filter.apply(this, [name].concat(args));
        });

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
      params = params || {};

      // Determine the best match for this route with the passed params
      var routes = this._named[name] || [];
      var keys = _.keys(params);
      var route = _.find(routes, function (route) {
        var names = _.difference(route.parameters, route.optionalParameters);
        var diff = _.difference(names, keys);
        return !diff.length;
      });

      // If we have a matching route, build the URL for it
      if (route) {
        return this._buildUrl(route.route, params);
      }
    },

    go: function (name, params, options) {
      // Get the associated route URL
      var url = this.url(name, params);

      // If a URL exists, navigate to it
      if (_.isString(url)) {
        return this.navigate(url, _.extend({ trigger: true }, options));
      }

      // Otherwise, call the router method, if it exists
      else if (this[name]) {
        return this[name](params);
      }

      // When no method or matching route exists, throw an error
      else {
        throw new Error('No method or matching route exists');
      }
    },

    _extractParameters: function (route, fragment) {
      var params = {};

      // Remove any query parameters from fragment
      var query = getQueryString(fragment);
      fragment = fragment.replace(query, '');

      // Parse query parameters and merge onto hash
      if (query) {
        _.extend(params, Canal.options.deparam(query.substr(1)));
      }

      // Extract named/splat parameters and merge onto hash
      var paramNames = this._routes[route].parameters;
      var paramValues = _extractParameters.call(this, route, fragment);
      if (paramValues) {
        _.each(paramValues, function (param, i) {
          // Set the parameter key to the name in the names array or, if no
          // name is in the array, the index value
          var key = paramNames[i] || i;
          params[key] = param;
        });
      }
      return params;
    },

    _getFilters: function (name, type) {
      var filters = [];
      _.each(this[type], function (options, filterName) {
        var add = true;
        options = options || {};

        // Determine whether this filter should be used based on only option
        if (options.only) {
          add = false;
          options.only = _.isArray(options.only) ?
            options.only : [options.only];
          if (_.contains(options.only, name)) {
            add = true;
          }
        }

        // Determine whether this filter should be used based on except option
        if (options.except) {
          options.except = _.isArray(options.except) ?
            options.except : [options.except];
          if (_.contains(options.except, name)) {
            add = false;
          }
        }

        // Upon determination, add the filter to the filters array
        if (add && this[filterName]) {
          filters.push(this[filterName]);
        }
      }, this);
      return filters;
    },

    _storeRoute: function (route, name) {
      var url = route;

      // Create a regular expression of the route
      if (!_.isRegExp(route)) {
        route = this._routeToRegExp(route);
      }

      // Get route parameter names and any optionals
      var optionals = [];
      var parameters = _.map(url.match(paramNamesPattern), function (name) {
        var optional = name.match(optionalParamPattern);
        if (optional) {
          name = optional[1];
          optionals.push(name);
        } else {
          name = name.substr(1);
        }
        return name;
      });

      // Store hash of route information on the router
      this._routes[route] = {
        route: route,
        url: url !== route ? url : undefined,
        parameters: parameters,
        optionalParameters: optionals
      };

      // Add route information to an array of routes associated with a method
      this._named[name] = this._named[name] || [];
      this._named[name].push(this._routes[route]);

      // Sort the named route array by number of parameters
      this._named[name] = _.sortBy(this._named[name], function (route) {
        return -route.parameters.length;
      });

      return route;
    },

    _buildUrl: function (route, params) {
      params = _.clone(params || {});

      // Get route information
      route = this._routes[route];

      // Start with the base
      var url = route.url || '';

      // Replace named/splat parts with their parameter equivalent
      _.each(route.parameters, function (name) {
        // Find named/splat parts that match the passed parameter
        var match = url.match(new RegExp('(\\(.*?)?[:\\*]' + name + '\\)?'));
        if (match) {
          var value = params[name];

          // Optional parameters that don't exist on the params hash should
          // be removed
          if (!_.isString(value)) {
            value = '';
          }
          // Add any leading characters stripped out of optional parts
          else {
            if (match[1]) {
              value = match[1].substring(1) + value;
            }
          }

          // Replace url part with the parameter value
          url = url.replace(match[0], value);

          // Remove this parameter from the hash
          delete params[name];
        }
      });

      // Add any extra items as query parameters to url
      var query = Canal.options.param(params);
      if (query) {
        url += '?' + query;
      }

      return url;
    }

  });

  // Extend Backbone.History
  // -----------------------
  _.extend(Backbone.History.prototype, {

    getFragment: function (fragment, forcePushState) {
      // Get query string from current URL, if necessary
      var query, queryRegExp;
      if (!_.isString(fragment)) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          query = this.location.search;
          queryRegExp = query.replace(escapeRegExp, '\\$&');
        }
      }

      // Get fragment from original method
      fragment = _getFragment.call(this, fragment, forcePushState);

      // Add the query string, if not already present
      if (query && !fragment.match(queryRegExp)) {
        fragment += query;
      }
      return fragment;
    },

    loadUrl: function (fragmentOverride) {
      // Get fragment
      var fragment = this.fragment = this.getFragment(fragmentOverride);

      // Create fragment base without a query string
      var query = getQueryString(fragment);
      var fragmentBase = query ? fragment.replace(query, '') : fragment;

      // If a handler matches the base, run callback
      var matched = _.any(this.handlers, function (handler) {
        if (handler.route.test(fragmentBase)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    }

  });

  // Helper functions
  // ----------------
  var getQueryString = function (url) {
    var query = url.match(queryStringPattern);
    if (query) {
      return query[0];
    }
  };

}).call(this);
