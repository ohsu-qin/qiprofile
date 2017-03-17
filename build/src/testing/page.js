
/**
 * The test helper module.
 *
 * @module testing
 */

(function() {
  var Findable, Page, URL_PAT_PREFIX, _, expect,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  expect = require('./expect')();

  Findable = require('./findable');

  require('coffee-errors');

  require('./object');

  URL_PAT_PREFIX = "http://[-\\w]+:\\d+";


  /**
   * The E2E page base encapsulation. Page folows the PageObject pattern
   * (https://code.google.com/p/selenium/wiki/PageObjects). If the Page
   * is instantiated with an url argument, then the given url is visited.
   * The Page class has accessors for the common qiprofile layout elements,
   * e.g. the title text and help pane.
   *
   * Page is intended to encapsulate structural HTML access. Extend Page
   * for each partial to be tested. Each Page accessor function should
   * validate that an element which should always be present exists,
   * but should not validate that the element content reflects the model.
   * Element content validation is the responsibility of the Mocha 'it'
   * clauses.
   *
   * @example
   *     Page = require '../testing/page'
   *     class LoginPage extends Page
   *       constructor: ->
   *         super('/login.html')
   *       ...
   *     login = new LoginPage()
   *     expect(login.title).to.eventually.equal('Login')
   *
   * @module testing
   * @class Page
   * @extends Findable
   */

  Page = (function(superClass) {
    extend(Page, superClass);


    /**
     * @method constructor
     * @param url the page request URL
     * @param helpShown flag indicating whether the help box is
     *   initially shown (default false)
     */

    function Page(url1, helpShown) {
      this.url = url1;
      this.helpShown = helpShown != null ? helpShown : false;
      Page.__super__.constructor.call(this);
      browser.get(this.url);
    }

    Page.prototype.element = element;

    Page.prototype.all = element.all;


    /**
     * @method url_pattern
     * @param url the URL without host or port
     *   (default this page's URL)
     * @return the full URL matcher
     */

    Page.prototype.url_pattern = function(url) {
      var pat_str;
      if (!url) {
        url = this.url;
      }
      pat_str = URL_PAT_PREFIX + url + '$';
      return new RegExp(pat_str);
    };

    Page.property({
      title: function() {
        return browser.getTitle();
      }
    });

    Page.property({
      title: function() {
        return this.text('.qi-title', 'h3');
      }
    });

    Page.property({
      content: function() {
        return this.find('.qi-content');
      }
    });

    Page.property({
      home: function() {

        /**
         * @method findHomeButton
         * @return the Home button
         */
        var findHomeButton;
        findHomeButton = (function(_this) {
          return function() {
            return _this.find('qi-home', 'button');
          };
        })(this);
        return findHomeButton().then(function(btn) {
          expect(btn, 'The home button is missing').to.exist;
          return btn.visit();
        });
      }
    });

    Page.property({
      help: function() {
        var findButton;
        findButton = (function(_this) {
          return function() {
            return _this.find('qi-toggle-help', 'button');
          };
        })(this);
        if (this.helpShown) {
          return this.find('.qi-help').then(function(helpBox) {
            expect(helpBox, 'The help box is missing').to.exist;
            return helpBox.getInnerHtml();
          });
        } else {
          return findButton().then((function(_this) {
            return function(btn) {
              expect(btn, 'The help button is missing').to.exist;
              return btn.click().then(function() {
                return _this.find('.qi-help').then(function(helpBox) {
                  var help;
                  expect(helpBox, "The help box is not shown after click").to.exist;
                  help = helpBox.getInnerHtml();
                  return btn.click().then(function() {
                    return help;
                  });
                });
              });
            };
          })(this));
        }
      }
    });

    return Page;

  })(Findable);

  Page.SUGGESTION_BOX_URL = 'http://qiprofile.idea.informer.com';

  Page.HOME = '/qiprofile/QIN_Test';

  Page.HOME_URL_PAT = new RegExp(URL_PAT_PREFIX + (Page.HOME + "$"));

  module.exports = Page;

}).call(this);
