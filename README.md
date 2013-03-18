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

### App Routing

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

If you would just like to get the URL of a named route, simply call:

``` javascript
router.url('contact', { id: '123', action: 'edit' });
```

### Element Routing

Any element on the page can navigate to a specific route on-click if it has
a `data-route` attribute specifying the associated route method. Parameters
are passed by setting attributes for each parameter name, leading with
`data-route-`. For example, we could set a list element to link to the above
route with:

``` html
<li data-route="contact" data-route-id="123" data-route-action="edit">Joe Strummer</li>
```

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

### Element Routing

If you'd like to disable element routing, set the configuration item to `false`:

``` javascript
Backbone.Canal.configure({
  elementRouting: false
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
bower install
```
Linting, running the tests, and creating the distribution files is accomplished
with:
```
grunt
```
