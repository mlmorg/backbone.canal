describe('backbone.canal.js', function () {

  var router;
  var Router = Backbone.Router.extend({
    routes: {
      'search/:type': 'search',
      'search': 'search'
    },
    search: sinon.spy()
  });

  before(function () {
    router = new Router();
    Backbone.history.start({ pushState: false, silent: true });
  });

  after(function () {
    router.navigate('');
  });

  describe('when navigating to a route with named params', function () {

    var type = 'name';

    before(function () {
      router.navigate('search/' + type, true);
    });

    after(function () {
      router.search.reset();
    });

    it('should pass hash of parameters as first argument', function () {
      expect(router.search.args[0][0]).eql({ type: type });
    });

  });

  describe('when navigating to a route with query parameters', function () {

    var type = 'name';
    var query = { q: 'joe' };

    before(function () {
      router.navigate('search' + '?' + $.param(query), true);
    });

    after(function () {
      router.search.reset();
    });

    it('should pass hash of parameters as first argument', function () {
      expect(router.search.args[0][0]).eql(query);
    });

  });

});
