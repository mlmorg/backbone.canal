describe('backbone.canal.js', function () {

  var Router, router, navigate;
  var query = { q: 'joe' };

  before(function () {
    Router = Backbone.Router.extend({
      routes: {
        'search/:type': 'search'
      },
      search: sinon.spy()
    });

    router = new Router();
    navigate = sinon.spy(router, 'navigate');

    try {
      Backbone.history.start({ pushState: false, silent: true });
    } catch (e) {}
  });

  after(function () {
    router.navigate('');
    navigate.restore();
  });

  describe('when navigating to a route with named params', function () {

    var type = 'name';

    before(function () {
      router.navigate('search/' + type, true);
    });

    it('should pass key/value pair object as argument', function () {
      expect(router.search.args[0][0]).eql({ type: type });
    });

  });

});
