(function () {

  var Location = this.Location = function (href) {
    this.replace(href);
  };

  _.extend(Location.prototype, {
    
    replace: function (href) {
      var el = document.createElement('a');
      el.href = href;
      _.extend(this, _.pick(el,
        'href',
        'hash',
        'host',
        'search',
        'fragment',
        'pathname',
        'protocol'
      ));
      if (!/^\//.test(this.pathname)) {
        this.pathname = '/' + this.pathname;
      }
    },

    toString: function () {
      return this.href;
    }

  });

})();
