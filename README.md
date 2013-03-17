# backbone.canal

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

Any named parameters in the route are sent within a hash as the first argument
to the associated route method. For instance, in the following example the `id`
route parameter is accessed from the `params` hash.

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

Any route navigated to with query parameters (i.e. `?foo=bar`) is called with
a hash of those values as its second argument. Using the last example, we could
navigate to the same route, like so:

``` javascript
router.navigate('contact/123?action=edit', true);
```
The `contact` method would then receive two arguments, a `params` hash
- containing any named/splat parameters - and a `query` hash - containing any
query parameters sent alongside the request:

``` javascript
contact: function (params, query) {
  var id = params.id; // 123
  var action = query.action; // edit
}

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
