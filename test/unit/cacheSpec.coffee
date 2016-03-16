define ['ngmocks', 'cache'], (ng) ->
  describe 'Unit Testing the Cache Service', ->
    # The qiprofile cache factory.
    Cache = null

    beforeEach ->
      # Fake the services.
      ng.module('qiprofile.cache')
      inject ['Cache', (_Cache_) ->
        Cache = _Cache_
      ]

    describe 'Cache', ->
      it 'adds an object', ->
        a = {id: 1}
        cached = Cache.add(a, a.id)
        expect(cached, 'The object was not cached').to.exist
        expect(cached, 'The cached object is incorrect').to.equal(a)
        cached = Cache.get(1)
        expect(cached, 'The object was not cached').to.exist
        expect(cached, 'The cached object is incorrect').to.equal(a)

      it 'replaces a cached object', ->
        a = {id: 1}
        b = {id: 1}
        Cache.add(a, a.id)
        Cache.add(b, b.id)
        cached = Cache.get(1)
        expect(cached, 'The object was not cached').to.exist
        expect(cached, 'The cached object is incorrect').to.equal(b)

      it 'removes a cached object', ->
        a = {id: 1}
        Cache.add(a, a.id)
        cached = Cache.remove(1)
        expect(cached, 'The removed object is not returned').to.exist
        expect(cached, 'The removed object is incorrect').to.equal(a)
        cached = Cache.get(1)
        expect(cached, 'The object was not removed from the cache').to.not.exist
