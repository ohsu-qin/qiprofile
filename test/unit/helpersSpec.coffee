define ['ngmocks', 'helpers', 'moment'], (mocks, helpers, moment) ->
  describe 'Unit Testing Helpers', ->
    Helpers = null
    
    beforeEach ->
      # Obtain the Helpers service.
      angular.mock.module('qiprofile.helpers')
      inject ['Helpers', (_Helpers_) ->
        Helpers = _Helpers_
      ]
      
    describe 'copyNonNullPublicProperties', ->
      it 'should copy public properties', ->
        src = {a: 1}
        dest = {}
        Helpers.copyNonNullPublicProperties(src, dest)
        expect(dest.a, 'A public property was not copied').to.equal(src.a)

      it 'should replace null public properties', ->
        src = {a: 1}
        dest = {a: null}
        Helpers.copyNonNullPublicProperties(src, dest)
        expect(dest.a, 'A public property was not copied').to.equal(src.a)

      it 'should not copy private properties', ->
        src = {_a: 2}
        dest = {}
        Helpers.copyNonNullPublicProperties(src, dest)
        expect(dest._a, 'A private property was copied').to.not.exist

      it 'should not overwrite non-null properties', ->
        src = {a: 1}
        dest = {a: 2}
        Helpers.copyNonNullPublicProperties(src, dest)
        expect(dest.a, 'A non-null destination property was overrwritten')
          .to.not.equal(src.a)
    
    describe 'fixDate', ->
      it 'should replace a string date', ->
        date = moment('Aug 14, 2012')
        obj = {date: 'Aug 14, 2012'}
        Helpers.fixDate(obj, 'date')
        expect(obj.date, 'A string date was not parsed').to.eql(date)

      it 'should not replace a parsed date', ->
        date = moment('Aug 14, 2012')
        obj = {date: date}
        Helpers.fixDate(obj, 'date')
        expect(obj.date, 'A parsed date was modified').to.equal(date)
        