describe('Backbone.Router', function () {

  var router, location;

  beforeEach(function () {
    location = new Location('http://www.example.com');
    Backbone.history = _.extend(new Backbone.History, { location: location });
    router = new Backbone.Router();
  });

  describe('on window.location change', function () {

    describe('when a route has named (and optional) parameters', function () {

      var search;

      beforeEach(function () {
        search = sinon.spy();
        router.route('search/:type(/my:optional)/:other', 'search', search);
        location.replace('http://www.example.com/search/name/foo?q=Joe Strummer');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call associated route method with params hash', function () {
        search.args[0][0].should.be.an('object');
      });

      it('should include named parameters in hash with correct associations', function () {
        search.args[0][0].type.should.equal('name');
        search.args[0][0].other.should.equal('foo');
        should.not.exist(search.args[0][0].optional);
      });

      it('should include query parameters in hash', function () {
        search.args[0][0].q.should.equal('Joe Strummer');
      });

    });

    describe('when a route has a trailing splat', function () {

      var search;

      beforeEach(function () {
        search = sinon.spy();
        router.route('search*splat', 'search', search);
        location.replace('http://www.example.com/search/name/other?q=Joe Strummer');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call associated route method with params hash', function () {
        search.args[0][0].should.be.an('object');
      });

      it('should include splat parameters in hash', function () {
        search.args[0][0].splat.should.equal('/name/other');
      });

      it('should include query parameters in hash', function () {
        search.args[0][0].q.should.equal('Joe Strummer');
      });

    });

    describe('when a route has no named/splat parameters', function () {

      var search;

      beforeEach(function () {
        search = sinon.spy();
        router.route('search', 'search', search);
        location.replace('http://www.example.com/search?q=Joe Strummer');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call associated route method with params hash', function () {
        search.args[0][0].should.be.an('object');
      });

      it('should include query parameters in hash', function () {
        search.args[0][0].q.should.equal('Joe Strummer');
      });

    });

  });

  describe('#url', function () {

    describe('when no route matches', function () {
      
      it('should return undefined', function () {
        var url = router.url('nonexistant');
        expect(url).to.be.undefined;
      });

    });

    describe('when a route has named, optional and splat parameters', function () {

      beforeEach(function () {
        router.route('search/:type(/my:optional)/*other', 'search');
      });

      it('should return url with correct associations replaced with params', function () {
        var url = router.url('search', { type: 'name', optional: 'foo', other: 'bar' });
        url.should.equal('search/name/myfoo/bar');
      });

      it('should return url with any other params added as query parameters', function () {
        var url = router.url('search', { type: 'name', optional: 'foo', other: 'bar', foo: 'test' });
        url.should.equal('search/name/myfoo/bar?foo=test');
      });

      it('should correctly handle optional paramters', function () {
        var url = router.url('search', { type: 'name', other: 'bar' });
        url.should.equal('search/name/bar');
      });

    });

  });

  describe('#go', function () {

    describe('when no method or matching route exists', function () {

      it('should throw an error', function () {
        var fn = function () { router.go('nonexistant'); };
        expect(fn).to.throw(Error);
      });

    });

    describe('when a method exists but no matching route', function () {

      var params, Router;

      beforeEach(function () {
        params = { name: 'joe' };
        Router = Backbone.Router.extend({ search: sinon.spy() });
        router = new Router();
        router.go('search', params);
      });

      it('should call the method', function () {
        router.search.calledOnce.should.be.true;
      });

      it('should pass the params hash', function () {
        router.search.args[0][0].should.equal(params);
      });

    });

    describe('when a method and matching route exist', function () {

      var params, search;

      beforeEach(function () {
        params = { type: 'name', q: 'Joe' };
        search = sinon.spy();
        router.route('search/:type', 'search', search);
        Backbone.history.start({ silent: true, pushState: false });
        router.go('search', params);
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the associated route method', function () {
        search.calledOnce.should.be.true;
      });

      it('should pass the paramters hash', function () {
        search.args[0][0].should.eql(params);
      });

      it('should change to the correct url', function () {
        location.hash.should.equal('#search/name?q=Joe');
      });

    });

    describe('when the matching route is an empty string', function () {

      var home;

      beforeEach(function () {
        home = sinon.spy();
        location.replace('http://www.example.com/#another');
        router.route('', 'home', home);
        Backbone.history.start({ silent: true, pushState: false });
        router.go('home');
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should change to the correct url', function () {
        location.hash.should.equal('#');
      });

    });

    describe('when passed options', function () {

      var navigate, options;

      beforeEach(function () {
        options = { trigger: false, replace: true };
        navigate = sinon.stub(router, 'navigate');
        router.route('', 'home');
        router.go('home', null, options);
      });

      afterEach(function () {
        navigate.reset();
      });

      it('should pass the options hash to the navigate method', function () {
        navigate.args[0][1].should.eql(options);
      });

    });

  });

});
