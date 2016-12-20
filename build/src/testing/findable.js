(function() {
  var Findable, Table, _, addFindableMixin, addMixin, addTableMixin, expect, webdriver,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('lodash');

  webdriver = require('selenium-webdriver');

  expect = require('./expect')();

  require('./object');


  /**
   * The WebElement extension for finding subelements.
   *
   * @module testing
   * @class Findable
   */

  Findable = (function() {
    function Findable() {}


    /**
     * Finds the element with the given search selection chain.
     * Each selector is either a Protractor By object or a search
     * condition string. The search condition string can be CSS,
     * an id or an xpath, determined as follows:
     *
     * * If the string contains a '/' or equals '..', then the
     *   string is assumed to be an xpath.
     *
     * * Otherwise, if the string starts with '#', then the search
     *   is on the id following the hash.
     *
     * * Otherwise, if the search argument starts with '.', then
     *   the search is by CSS.
     *
     * * Otherwise, the search is by tag name.
     *
     * For example,
     *
     *     page.find('.qi-billboard', 'h3', '..')
     *
     * returns the parent of the h3 elt within the .qi-billboard
     * elt on the page.
     *
     * The ElementFinder result is extended with a find function
     * for chaining, so the above example is equivalent to:
     *
     *     page.element(By.css('.qi-billboard'))
     *       .then (bb) ->
     *         bb.element(By.tagName('h3'))
     *       .then (h3) ->
     *         h3.element(By.xpath('..'))
     *
     * @method find
     * @param selectors the search conditions
     * @return a promise which resolves to the target
     *   Findable, or null if no such WebElement exists
     */

    Findable.prototype.find = function() {
      var selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this._find.apply(this, selectors).then(function(elt) {
        if (elt != null) {
          return addFindableMixin(elt);
        } else {
          return elt;
        }
      });
    };


    /**
     * @method _find
     * @private
     * @param selectors the search conditions
     * @return a promise which resolves to the target
     *   ElementFinder, or null if no such elt exists
     */

    Findable.prototype._find = function() {
      var locators, next, selector, selectors, target;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];

      /**
       * @method next
       * @param current the Findable to search from, or this
       *   Page to search from the document root
       * @param locator the protractor By object
       * @return the result of calling *elt* on the current
       *   object with the given locator
       */
      next = function(current, locator) {
        return current.element(locator);
      };
      locators = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selectors.length; j < len; j++) {
          selector = selectors[j];
          results.push(this._locatorFor(selector));
        }
        return results;
      }).call(this);
      target = locators.reduce(next, this);
      return target.isPresent().then(function(exists) {
        if (exists) {
          return target;
        } else {
          return null;
        }
      });
    };


    /**
     * Finds the elements with the given search selection.
     * The selectors are described in the find function.
     * Unlike the find function, findAll only accepts one
     * selector argument.
     *
     * Each Findable in the array result is extended
     * with a find function for chaining.
     *
     * @method findAll
     * @param selectors the search condition
     * @return a promise which resolves to the target
     *   Findable array
     */

    Findable.prototype.findAll = function() {
      var elements, selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      elements = this._findAll.apply(this, selectors);
      return elements.count().then(function(n) {
        var i, j, len, ref, results;
        ref = _.range(n);
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          i = ref[j];
          results.push(addFindableMixin(elements.get(i)));
        }
        return results;
      });
    };


    /**
     * @method _findAll
     * @private
     * @param selectors the search condition
     * @return a promise which resolves to the target
     *   WebElement array
     */

    Findable.prototype._findAll = function() {
      var locators, next, selector, selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];

      /**
       * @method next
       * @param parent the Findable to search from, or
       *   this Page to search from the document root
       * @param locator the protractor By object
       * @return the search result WebElement array
       */
      next = function(current, locator) {
        return current.all(locator);
      };
      locators = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = selectors.length; j < len; j++) {
          selector = selectors[j];
          results.push(this._locatorFor(selector));
        }
        return results;
      }).call(this);
      return locators.reduce(next, this);
    };


    /**
     * @method text
     * @param selectors the search condition
     * @return a promise which resolves to this WebElement's visible
     *   text, or null if either:
     *   * the search result does not exist
     *   * the element is not displayed
     *   * the text content is empty
     */

    Findable.prototype.text = function() {
      var selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this.find.apply(this, selectors).then(function(target) {
        if (target != null) {
          return target.isDisplayed().then(function(shown) {
            if (shown) {
              return target;
            } else {
              return null;
            }
          });
        } else {
          return null;
        }
      }).then(function(target) {
        if (target != null) {
          return target.getText();
        } else {
          return null;
        }
      }).then(function(text) {
        if ((text != null) && text.length) {
          return text;
        } else {
          return null;
        }
      });
    };


    /**
     * Clicks on this element, captures the visited URL,
     * and returns.
     *
     * @method visit
     * @return the visited URL
     */

    Findable.prototype.visit = function() {

      /**
       * Navigates to the previous page, if necessary.
       *
       * @method restore
       * @param prev_url the previous location
       * @return the URL of the page navigated from
       */
      var restore;
      restore = function(prev_url) {
        return browser.getCurrentUrl().then(function(curr_url) {
          if (curr_url === prev_url) {
            return curr_url;
          } else {
            return browser.navigate().back().then(function() {
              return curr_url;
            });
          }
        });
      };
      return browser.getCurrentUrl().then((function(_this) {
        return function(url) {
          url;
          return _this.click().then(function() {
            return restore(url);
          });
        };
      })(this));
    };


    /**
     * Finds a nested hyperlink. The hyperlink is the href
     * attribute of an anchor element (<a href=...></a>) contained
     * within this Findable's HTML.
     *
     * @method hyperlink
     * @param selectors the search condition
     * @return a promise which resolves to the hyperlink URL
     */

    Findable.prototype.hyperlink = function() {
      var selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      selectors.push('a');
      return this._find.apply(this, selectors).then(function(anchor) {
        if (anchor) {
          return anchor.getAttribute('href');
        } else {
          return null;
        }
      });
    };


    /**
     * Finds all nested hyperlinks.
     * See the hyperlink method.
     *
     * @method hyperlinks
     * @param selectors the search condition
     * @return a promise which resolves to the hyperlink URLs
     */

    Findable.prototype.hyperlinks = function() {
      var selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      selectors.push('a');
      return this._findAll.apply(this, selectors).then(function(anchors) {
        return anchors.map(function(anchor) {
          return anchor.getAttribute('href');
        });
      });
    };


    /**
     * Finds the table WebElement for the given find() selector.
     * The return value is a promisr resolving to a Table object.
     * Each table promise resolves to an object {header, body},
     * where:
     * * header is a promise which resolves to an array of table
     *   heading text value promises
     * * body is a promise which resolves to an array of row promises
     *
     * Each row promise resolves to an array of column text promises.
     *
     * If the function argument is provided, then it is applied to
     * each table cell text value promise.
     *
     * @method findTable
     * @param bindings the table  {field: ng-bind expression}
     *   bindings
     * @param selectors the table elt find selectors
     * @return a promise resolving to the table WebElement
     *   with the field properties, or null if the table
     *   does not exist
     */

    Findable.prototype.findTable = function() {
      var finder, selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return finder = this._find.apply(this, selectors).then(function(table) {
        if (table != null) {
          return addTableMixin(table);
        } else {
          return table;
        }
      });
    };


    /**
     * Finds the table WebElements for the given Page.findAll()
     * selector. The return value is an array of table promises.
     * Each table promise resolves to an object {header, body},
     * where:
     * * header is a promise which resolves to an array of table
     *   heading text value promises
     * * body is a promise which resolves to an array of row promises
     *
     * Each row promise resolves to an array of column text promises.
     *
     * If the function argument is provided, then it is applied to
     * each table cell text value promise.
     *
     * @method findTables
     * @param selector the Protractor CSS locator argument
     * @return a promise resolving to the Table array
     */

    Findable.prototype.findTables = function() {
      var selectors;
      selectors = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return this._findAll.apply(this, selectors).then(function(tables) {
        return tables.map(addTableMixin);
      });
    };


    /**
     * @method _locatorFor
     * @private
     * @param selector the search condition
     * @return the By locator object
     */

    Findable.prototype._locatorFor = function(selector) {
      var ref;
      if (_.isString(selector)) {
        if (selector === '..' || indexOf.call(selector, '/') >= 0) {
          return By.xpath(selector);
        } else if (selector[0] === '#' && (ref = !' ', indexOf.call(selector, ref) >= 0)) {
          return By.id(selector.slice(1));
        } else if (selector.match('in ')) {
          return By.repeater(selector);
        } else if (selector.match(/^\w[\w-]*$/)) {
          return By.tagName(selector);
        } else {
          return By.css(selector);
        }
      } else if (selector != null) {
        return selector;
      } else {
        throw new Error("The selector is not defined");
      }
    };

    return Findable;

  })();


  /**
   * The Table class represents a table WebElement with the
   * following properties:
   *
   * * header - a promise resolving to the array of `<th/>`
   *   WebElement text values
   *
   * * rows - a promise resolving to the two-dimensional
   *   `<tr/> x <td/>` cell value array
   *
   * The header values can be either in a separate `thead`
   * row or as the leading `th` element in each `tbody` row,
   * e.g.:
   *
   *     <table id="t01">
   *       <thead>
   *         <tr>
   *           <th>Name</th>
   *           <th>Gender</th>
   *         </tr>
   *       </thead>
   *       <tbody>
   *         <tr>
   *           <td>John</td>
   *           <td>Male</td>
   *         </tr>
   *       </tbody>
   *     </table>
   *
   * or:
   *
   *     <table id="t02">
   *       <tbody>
   *         <tr>
   *           <th>Name</th>
   *           <td>John</td>
   *         </tr>
   *         <tr>
   *           <th>Gender</th>
   *           <td>Male</td>
   *         </tr>
   *       </tbody>
   *     </table>
   *
   * In the both cases, the Table *heading* resolves to
   * ['Name', 'Gender']. In the first case, the Table
   * *rows* resolves to [['John', 'Male]]. In the second
   * case, the Table *rows* resolves to [['John'], ['Male]].
   *
   * If this table contains a `<tbody/>` subelement, then this
   * property includes the rows in the first such body
   * subelement. Otherwise, this methods returns all `<tr/>`
   * rows contained in the table.
   *
   * Note - If there are multiple `<tbody/>` elements in the
   *   table, only the rows of the first `<tbody>` are returned.
   *
   * Note - The rows of nested `<table/>` elements are returned
   *   along with the parent rows.
   *
   * TODO - address the above two notes by adding a Table
   *   subTables property for subtables and include only the
   *   direct rows in a parent Table.
   *
   * Note - The Table class is not defined in it's own file
   *   because there is a cyclical Findable dependency.
   *
   * @module testing
   * @class Table
   * @extends Findable
   */

  Table = (function(superClass) {
    extend(Table, superClass);

    function Table() {
      return Table.__super__.constructor.apply(this, arguments);
    }


    /**
     * Adds *field* properties to this table which resolve to the
     * the value given by the corresponding AngularJS binding
     * expression.
     *
     * @method addBindings
     * @param bindings {Object} the {field: binding} object, where
     *   *binding* is the AngularJS expression to which the field
     *   element is bound
     * @return this table WebElement
     */

    Table.prototype.addBindings = function(bindings) {
      var binding, field, locator;
      for (field in bindings) {
        binding = bindings[field];
        locator = By.binding(binding);
        this[field] = this.find(locator).then(function(elt) {
          if (elt != null) {
            return elt.text();
          } else {
            return elt;
          }
        });
      }
      return this;
    };

    Table.property({
      rows: function() {
        return this.find(By.tagName('tbody')).then(function(body) {
          if (body != null) {
            return body;
          } else {
            return this;
          }
        }).then(function(parent) {
          return parent.findAll(By.tagName('tr'));
        }).then(function(rows) {
          return rows.map(function(row) {
            return row.findAll(By.tagName('td'));
          });
        }).then(function(rows) {
          return webdriver.promise.all(rows);
        });
      }
    });

    Table.property({
      header: function() {
        return this.findAll(By.tagName('th')).then(function(headings) {
          return headings.map(function(heading) {
            return heading.text();
          });
        }).then(function(headings) {
          return webdriver.promise.all(headings);
        });
      }
    });

    return Table;

  })(Findable);

  addMixin = function(mixin, obj) {
    var extended, key;
    extended = _.extend(new mixin, obj);
    for (key in obj) {
      if (_.isUndefined(extended[key])) {
        extended[key] = obj[key];
      }
    }
    return extended;
  };

  addFindableMixin = _.partial(addMixin, Findable);

  addTableMixin = _.partial(addMixin, Table);

  module.exports = Findable;

}).call(this);
