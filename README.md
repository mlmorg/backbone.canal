# Backbone.Canal

Backbone.Router add-on for named routes, query parameters, and other helpful tools

## Installation

Include the distribution file immediately following Backbone:

``` html
<script src="jquery.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>

<script src="backbone.canal.js"></script>
```

## Usage

### Route parameters

Named parameters in the route are sent within a hash as the first argument
to the associated route method. For instance, in the following example the `id`
route parameter is accessed from the `params` hash:

``` javascript
var Router = Backbone.Router.extend({
  
  routes: {
    'contact/:id': 'contact'
  },

  contact: function (params) {
    var id = params.id;
  }

});
```

### Query parameters

Any query parameters appended to a URL are hashed and included as the second
argument to the associated route method. Any defined routes can be called with
query paramters irrespective of if they have a trailing `splat` or not. For
example, the same route as above could be navigated to with `?action=edit`
allowing the `action` parameter to be accessed from the `query` hash:

``` javascript
var Router = Backbone.Router.extend({

  routes: {
    'contact/:id': 'contact'
  },

  contact: function (params, query) {
    var id = params.id;
    var action = query.action;
  }

});
```

### App Routing

Any method that exists on a router can be called using `router.go()`, passing
the name of the method as the first argument. If the method has an associated 
URL route, the browser URL will change accordingly. Pass any route parameters
or query paramters in a hash as the second argument to the method. The
parameters will be parsed and placed accordingly. Using the example above, we
could navigate to it, like so:

``` javascript
router.go('contact', { id: '123', action: 'edit' });
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
bower install
```
Linting, running the tests, and creating the distribution files is accomplished
with:
```
grunt
```
