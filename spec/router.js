describe('Backbone.Router', function () {

  var router, location;

  beforeEach(function () {
    location = new Location('http://www.example.com');
    Backbone.history = _.extend(new Backbone.History, { location: location });
    router = new Backbone.Router();
  });

  describe('passing function on instantiation', function () {

    var routes, ctx, options, init;

    beforeEach(function () {
      options = {
        foo: 'bar'
      };
      routes = function () {
        ctx = this;
      };
      init = sinon.spy(Backbone.Router.prototype, 'initialize');
      router = new Backbone.Router(routes, options);
    });

    afterEach(function () {
      init.restore();
    });
    
    it('should call function within context of router', function () {
      expect(ctx).to.equal(router);
    });

    it('should call the initialize function with the options', function () {
      expect(init.args[0][0]).to.equal(options);
    });

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
        url.should.equal('/search/name/myfoo/bar');
      });

      it('should return url with any other params added as query parameters', function () {
        var url = router.url('search', { type: 'name', optional: 'foo', other: 'bar', foo: 'test' });
        url.should.equal('/search/name/myfoo/bar?foo=test');
      });

      it('should correctly handle optional paramters', function () {
        var url = router.url('search', { type: 'name', other: 'bar' });
        url.should.equal('/search/name/bar');
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

  describe('#navigate', function () {

    describe('when the current URL query params and navigating to one with them', function () {

      var pushed;

      beforeEach(function () {
        pushed = sinon.spy();
        location.replace('http://www.example.com/search?q=test');
        router.route('search', 'search');
        Backbone.history = _.extend(new Backbone.History, {
          location: location,
          history: {
            pushState: pushed
          }
        });
        Backbone.history.start({ silent: true, pushState: true });
        Backbone.history.navigate('search?q=joe');
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should replace all query parameters with the new ones', function () {
        pushed.args[0][2].should.equal('/search?q=joe');
      });

    });

  });

  describe('filters', function () {

    var Router, home, search, contact, filter;

    beforeEach(function () {
      home = sinon.spy();
      search = sinon.spy();
      contact = sinon.spy();
      filter = sinon.spy();
      Router = Backbone.Router.extend({
        routes: {
          '': 'home',
          'search/:type': 'search',
          'contact/:id': 'contact'
        },
        home: home,
        search: search,
        contact: contact,
        filter: filter,
      });
    });

    describe('with no options', function () {

      beforeEach(function () {
        Router.prototype.before = { 'filter': {} };
        router = new Router();
        location.replace('http://www.example.com/');
        Backbone.history.start({ pushState: true });
        Backbone.history.stop();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the filter for every route', function () {
        filter.calledTwice.should.be.true;
      });

      it('should call the associated route method', function () {
        home.calledOnce.should.be.true;
        search.calledOnce.should.be.true;
      });

    });

    describe('with the only option', function () {

      beforeEach(function () {
        Router.prototype.before = { 'filter': { only: 'search' } };
        router = new Router();
        location.replace('http://www.example.com/');
        Backbone.history.start({ pushState: true });
        Backbone.history.stop();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the filter only for routes specified', function () {
        filter.calledOnce.should.be.true;
      });

      it('should call the associated route method', function () {
        search.calledOnce.should.be.true;
      });

    });

    describe('with the except option', function () {

      beforeEach(function () {
        Router.prototype.before = { 'filter': { except: ['home', 'search'] } };
        router = new Router();
        location.replace('http://www.example.com/');
        Backbone.history.start({ pushState: true });
        Backbone.history.stop();
        location.replace('http://www.example.com/contact/123');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the filter only for routes not specified', function () {
        filter.calledOnce.should.be.true;
      });

      it('should call the associated route method', function () {
        contact.calledOnce.should.be.true;
      });

    });

    describe('when calling a before filter', function () {

      var filterCalled, correct;
      var search = function () {
        if (filterCalled) correct = true;
      };
      var filter = function () {
        filterCalled = true;
      };

      beforeEach(function () {
        filter = sinon.spy(filter);
        Router.prototype.filter = filter;
        Router.prototype.before = { 'filter': {} };
        Router.prototype.search = search;
        router = new Router();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the before filter before the route method', function () {
        correct.should.be.true;
      });

      it('should pass the route name to the before filter', function () {
        filter.args[0][0].should.equal('search');
      });

      it('should pass any parameters as the second argument of filter', function () {
        filter.args[0][1].should.eql({ type: 'name' });
      });

    });

    describe('when a before filter returns false', function () {
      
      var anotherFilter;
      var filter = function () {
        return false;
      };

      beforeEach(function () {
        filter = sinon.spy(filter);
        anotherFilter = sinon.spy();
        Router.prototype.filter = filter;
        Router.prototype.anotherFilter = anotherFilter;
        Router.prototype.before = { 'filter': {}, 'anotherFilter': {} };
        router = new Router();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the filter', function () {
        filter.calledOnce.should.be.true;
      });

      it('should not call any other later filters', function () {
        anotherFilter.called.should.be.false;
      });

      it('should not call the associated route method', function () {
        search.called.should.be.false;
      });

    });

    describe('when calling an after filter', function () {

      var routeCalled, correct;
      var search = function () {
        routeCalled = true;
      };
      var filter = function () {
        if (routeCalled) correct = true;
      };

      beforeEach(function () {
        filter = sinon.spy(filter)
        Router.prototype.filter = filter;
        Router.prototype.after = { 'filter': {} };
        Router.prototype.search = search;
        router = new Router();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the after filter after the route method', function () {
        correct.should.be.true;
      });

      it('should pass the route name to the after filter', function () {
        filter.args[0][0].should.equal('search');
      });

      it('should pass any parameters as the second argument of filter', function () {
        filter.args[0][1].should.eql({ type: 'name' });
      });

    });

    describe('when calling an around filter', function () {

      var route, filterCalled, correct;
      var filter = function (r) {
        route = r;
      };
      var anotherFilter = function (r) {
        filterCalled = true;
        r();
      };
      var search = function () {
        if (filterCalled) {
          correct = true;
        }
      };

      beforeEach(function () {
        search = sinon.spy(search);
        filter = sinon.spy(filter);
        anotherFilter = sinon.spy(anotherFilter);
        Router.prototype.filter = filter;
        Router.prototype.anotherFilter = anotherFilter;
        Router.prototype.around = { 'filter': {}, 'anotherFilter': {} };
        Router.prototype.search = search;
        router = new Router();
        location.replace('http://www.example.com/search/name');
        Backbone.history.start({ pushState: true });
      });

      afterEach(function () {
        Backbone.history.stop();
      });

      it('should call the around filter', function () {
        filter.calledOnce.should.be.true;
      });

      it('should not call the route method immediately', function () {
        search.calledOnce.should.be.false;
      });

      it('should not call any other around filters immediately', function () {
        anotherFilter.calledOnce.should.be.false;
      });

      it('should pass the route name to the around filter', function () {
        filter.args[0][1].should.equal('search');
      });

      it('should pass any parameters as the third argument of filter', function () {
        filter.args[0][2].should.eql({ type: 'name' });
      });

      describe('when the route() function is called', function () {

        beforeEach(function () {
          route();
        });

        it('should call other around filters before the route method', function () {
          correct.should.be.true;
        });

        it('should call the route method with the params hash', function () {
          search.args[0][0].should.eql({ type: 'name' });
        });

      });

    });

  });

});
