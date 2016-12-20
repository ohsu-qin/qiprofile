(function() {
  import ObjectHelper from "./object-helper.coffee";

  /**
   * The ObjectHelper validator.
   *
   * @class ObjectHelper
   * @static
   */
  var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  describe('ObjectHelper', function() {
    describe('fromJSON', function() {
      var mock, obj;
      mock = {
        _id: 1,
        an_int: 1,
        inner: {
          an_obj: {
            an_array: [
              {
                an_int: 3
              }
            ]
          }
        }
      };
      obj = null;
      beforeEach(function() {
        var data;
        data = JSON.stringify(mock);
        return obj = ObjectHelper.fromJson(data);
      });
      it('should add camelCase aliases to underscore properties', function() {
        expect('anInt' in obj, 'The alias is not defined as an enumerable' + ' property').to.be["true"];
        expect(obj.anInt, 'The alias value is incorrect').to.equal(mock.an_int);
        obj.an_int = obj.an_int + 1;
        expect(obj.anInt, 'The alias value does not reflect an underscore' + ' change').to.equal(obj.an_int);
        obj.anInt = obj.anInt + 1;
        return expect(obj.an_int, 'The underscore value does not reflect an alias' + ' change').to.equal(obj.anInt);
      });
      it('should make the camelCase alias enumerable', function() {
        return expect(indexOf.call(Object.keys(obj), 'anInt') >= 0, 'The camelCase property is' + ' still enumerable').to.be["true"];
      });
      it('should make the underscore property non-enumerable', function() {
        return expect(indexOf.call(Object.keys(obj), 'an_int') >= 0, 'The underscore property is' + ' still enumerable').to.be["false"];
      });
      it('should make the underscore property nonenumerable', function() {
        return expect(obj.an_int, 'an_int is incorrect').to.equal(mock.an_int);
      });
      it('should add camelCase aliases to inner objects', function() {
        expect('anObj' in obj.inner, 'The inner underscore scalar property' + ' is not aliased').to.be["true"];
        return expect(obj.inner.anObj.anInt, 'The inner reference alias value is' + ' incorrect').to.eql(mock.inner.an_obj.an_int);
      });
      return it('should add camelCase aliases to arrays', function() {
        var item;
        expect('anArray' in obj.inner.anObj, 'The inner underscore array' + ' property is not aliased').to.be["true"];
        expect(obj.inner.anObj.anArray.length, 'the inner array length is' + ' incorrect').to.equal(1);
        item = obj.inner.anObj.anArray[0];
        return expect('anInt' in item, 'The inner array item scalar property' + ' is not aliased').to.be["true"];
      });
    });
    describe('prettyPrint', function() {
      var cycle, mock;
      cycle = {
        d: 3
      };
      cycle.ref = cycle;
      mock = {
        a: 1,
        b: [
          {
            c: {
              d: 2
            }
          }
        ],
        cycle: cycle
      };
      return it('should print the hierarchy', function() {
        var actual, expected, i, j, ref;
        expected = ['{', '  "a": 1,', '  "b": [', '    {', '      "c": {', '        "d": 2', '      }', '    }', '  ],', '  "cycle": {', '    "d": 3,', '    "ref": "..."', '  }', '}'];
        actual = ObjectHelper.prettyPrint(mock).split("\n");
        for (i = j = 0, ref = Math.min(actual.length, expected.length); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          expect(actual[i], "prettyPrint result line " + i + " is incorrect").to.equal(expected[i]);
        }
        return expect(actual.length, "prettyPrint result line count is incorrect").to.equal(expected.length);
      });
    });
    return describe('aliasPublicDataProperties', function() {
      it('should alias public value properties', function() {
        var dest, src;
        src = {
          a: 1
        };
        dest = {};
        ObjectHelper.aliasPublicDataProperties(src, dest);
        return expect(dest.a, 'The public value property was not aliased').to.equal(src.a);
      });
      it('should alias public virtual properties', function() {
        var dest, src;
        src = {
          a: 1
        };
        Object.defineProperty(src, 'b', {
          enumerable: true,
          get: function() {
            return src.a;
          }
        });
        dest = {};
        ObjectHelper.aliasPublicDataProperties(src, dest);
        return expect(dest.b, 'The public virtual property was not aliased').to.equal(src.b);
      });
      it('should alias non-eumerable public properties', function() {
        var dest, src;
        src = {};
        Object.defineProperty(src, 'a', {
          enumerable: false,
          value: 1
        });
        dest = {};
        ObjectHelper.aliasPublicDataProperties(src, dest);
        return expect(dest.a, 'The public virtual property was not aliased').to.equal(src.a);
      });
      it('should not alias private properties', function() {
        var dest, src;
        src = {
          _a: 2
        };
        dest = {};
        ObjectHelper.aliasPublicDataProperties(src, dest);
        return expect(dest._a, 'A private property was aliased').to.not.exist;
      });
      return it('should not alias existing properties', function() {
        var dest, src;
        src = {
          a: 1
        };
        dest = {
          a: null
        };
        ObjectHelper.aliasPublicDataProperties(src, dest);
        return expect(dest.a, 'A non-null destination property was overrwritten').to.not.equal(src.a);
      });
    });
  });

}).call(this);
