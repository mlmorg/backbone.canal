# Backbone.Canal

Backbone Router add-on for named routing, parameter handling, and before, after
& around filters. Its dependencies are Backbone and Underscore. Simply include
the `backbone.canal.js` distribution file immediately following Backbone in
your development environment. 

## Usage

### Route Parameters

Both named route parameters and any passed query paramters are sent in a hash
as the first argument to the associated route method. Any defined route can be
called with query parameters irrespective of if they have a trailing `splat`
or not. For example, using the router defined below and a URL of 
`contact/123?action=edit`, both the `id` route parameter and `action` query 
parameter can be accessed from the `params` hash:

``` javascript
var Router = Backbone.Router.extend({
  
  routes: {
    'contact/:id': 'contact'
  },

  contact: function (params) {
    var id = params.id;
    var action = params.action;
  }

});
```

### Named Routing

Any method that exists on a router can be called using `router.go()`, passing
the name of the method as the first argument. If the method has an associated 
route, the browser URL will update accordingly. Pass any route parameters
or query parameters in a hash as the second argument and the parameters will be
parsed and put in their respective places in the URL. For instance, we could
navigate to the example route above, like so:

``` javascript
router.go('contact', { id: '123', action: 'edit' });
```

The `router.go()` method acts similarly to `router.navigate()` and any options
applicable to it may also be passed in a hash as the third argument. For
example, we could call the `contact` method and update its URL but not create
an entry in the browser's history with:

``` javascript
router.go('contact', { id: '123', action: 'edit' }, { replace: true });
```

If you would just like to get the URL of a named route, simply call
`router.url()` with the same arguments:

``` javascript
router.url('contact', { id: '123', action: 'edit' });
```

### Before, After & Around Filters

Filters can be called before, after and around named routes by using the
`before`, `after` and `around` hashes mapping a 
filter method name to a hash of options. For options, `only` specifies the
named route (or array of names) that the filter should be run for; `except`
naturally corresponds to all routes except for the route (or routes) specified.

``` javascript
var Router = Backbone.Router.extend({

  routes: {
    '': 'home',
    'contact/:id': 'contact'
    'search': 'search'
  },

  before: {
    'myBeforeFilter': { only: 'contact' }
  },

  around: {
    'myAroundFilter': { except: ['home', 'contact'] }
  },

  ...
```

Before and after filter functions are called with the route name as the first 
argument and the hash of parameters as the second argument. The first argument
of an around filter, however, is a `route()` function that calls the route 
method, triggers the router events, and runs any after filters. To continue
from the last example:

``` javascript
  ...
  
  myBeforeFilter: function (name, params) {
    // do something
  },

  myAroundFilter: function (route, name, params) {
    // do something
    route();
    // do something else
  },

  ...
```

*Note: If a before filter returns `false` or an around filter never calls
`route()`, the associated route method, router events, and any other declared
filters will never be called.*

## Configuration

### Query Parameters

By default, Backbone.Canal comes preloaded with very minimal query parameter
parsing/serializing. If you find that you need more robust versions, you can
configure them yourself with:

``` javascript
Backbone.Canal.configure({

  param: function (obj) {
    return $.param(obj);
  },

  deparam: function (string) {
    return $.deparam(string);
  }

});
```

## Testing Environment

Install [Node.js](http://nodejs.org/). Make sure you've installed 
[Grunt](http://gruntjs.com/) and [Bower](https://github.com/twitter/bower)
globally:

```
npm install grunt-cli -g
npm install bower -g
```
Then, install the development dependencies:

```
npm install
```
Lint and run the tests with:
```
npm test
```
