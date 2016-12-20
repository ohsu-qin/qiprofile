(function() {
  var Page, ProjectListPage, _, expect,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  expect = require('../testing/expect')();

  Page = require('../testing/page');

  _ = require('lodash');


  /**
   * The Project List E2E page encapsulation.
   *
   * @module projects
   * @class ProjectListPage
   * @extends Page
   */

  ProjectListPage = (function(superClass) {
    extend(ProjectListPage, superClass);

    function ProjectListPage() {
      this._parse_row = bind(this._parse_row, this);
      ProjectListPage.__super__.constructor.call(this, '/qiprofile/', true);
    }

    ProjectListPage.prototype.projects = function() {
      return this.findAll('qi-project-item').then((function(_this) {
        return function(rows) {
          var resolvers;
          resolvers = rows.map(_this._parse_row);
          return Promise.all(resolvers);
        };
      })(this));
    };

    ProjectListPage.prototype._row_finders = function(row) {
      return {
        link: row.find('a'),
        name: row.text('a'),
        description: row.text('span'),
        info: row.find('button')
      };
    };

    ProjectListPage.prototype._parse_row = function(row) {
      var accumulate, finders, resolvers;
      accumulate = function(accum, pair) {
        var property, value;
        property = pair[0], value = pair[1];
        accum[property] = value;
        return accum;
      };
      finders = this._row_finders(row);
      resolvers = _.toPairs(finders).map(function(pair) {
        var finder, property;
        property = pair[0], finder = pair[1];
        return finder.then(function(resolved) {
          return [property, resolved];
        });
      });
      return Promise.all(resolvers).then(function(resolved) {
        return resolved.reduce(accumulate, {});
      });
    };

    return ProjectListPage;

  })(Page);


  /**
   * The Project List E2E validator.
   *
   * @module projects
   * @class ProjectListSpec
   */

  describe('E2E Testing Project List', function() {
    var page;
    page = null;
    before(function() {
      return page = new ProjectListPage;
    });
    it('should load the page', function() {
      return expect(page.content, 'The page was not loaded').to.eventually.exist;
    });
    describe('Header', function() {
      it('should display the billboard', function() {
        return expect(page.billboard, 'The billboard is incorrect').to.eventually.equal('Projects');
      });
      it('should have a home button', function() {
        return expect(page.home, 'The home URL is incorrect').to.eventually.match(page.url_pattern());
      });
      return describe('Help', function() {
        var help;
        help = null;
        before(function() {
          return help = page.help;
        });
        it('should have help text', function() {
          return expect(help, 'The help text is missing').to.eventually.exist.and.not.be.empty;
        });
        return it('should display a {qu,sugg}estion box hyperlink', function() {
          return expect(help, 'The {qu,sugg}estion box hyperlink is missing').to.eventually.include(Page.SUGGESTION_BOX_URL);
        });
      });
    });
    return describe('Projects', function() {
      var rows;
      rows = null;
      before(function() {
        return page.projects().then(function(colls) {
          return rows = colls;
        });
      });
      it('should display the QIN_Test project', function() {
        var names;
        names = _.map(rows, 'name');
        return expect('QIN_Test', 'The project names are incorrect').to.be.oneOf(names);
      });
      return it('should link to the Collections List page', function() {
        var actual, i, j, len, matcher, results, row;
        results = [];
        for (i = j = 0, len = rows.length; j < len; i = ++j) {
          row = rows[i];
          expect(row.link, ("The " + row.name + " collection " + i) + " is missing a hyperlink").to.exist;
          matcher = page.url_pattern("" + page.url + row.name);
          actual = row.link.visit();
          results.push(expect(actual, ("The visited " + row.name + " Collection List") + " page URL is incorrect").to.eventually.match(matcher));
        }
        return results;
      });
    });
  });

}).call(this);
