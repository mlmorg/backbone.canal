describe('Backbone.Canal', function () {

  var router, location;

  beforeEach(function () {
    location = new Location('http://www.example.com');
    Backbone.history = _.extend(new Backbone.History, { location: location });
    router = new Backbone.Router();
  });

  describe('::configure', function () {

    describe('when altering the param method', function () {

      var _param = Backbone.Canal.options.param;
      var param = function (obj) {
        return 'name=' + obj.name + '_strummer';
      };

      beforeEach(function () {
        router.route('search', 'search');
        Backbone.Canal.configure({ param: param });
      });

      afterEach(function () {
        Backbone.Canal.configure({ param: _param });
      });

      it('should use altered param method', function () {
        var url = router.url('search', { name: 'joe' });
        url.should.equal('/search?name=joe_strummer');
      });

    });

    describe('when altering the deparam method', function () {

      var search;
      var _deparam = Backbone.Canal.options.deparam;
      var deparam = function (string) {
        var split = string.split('=');
        return { n: split[1] };
      };

      beforeEach(function () {
        search = sinon.spy();
        router.route('search', 'search', search);
        Backbone.Canal.configure({ deparam: deparam });
        location.replace('http://www.example.com/search?name=joe_strummer');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.Canal.configure({ deparam: _deparam });
        Backbone.history.stop();
      });

      it('should use altered deparam method', function () {
        search.args[0][0].should.eql({ n: 'joe_strummer' });
      });

    });

  });

});
