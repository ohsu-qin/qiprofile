describe 'Midway Testing Controllers', ->
  tester = null

  beforeEach ->
    tester = ngMidwayTester('qiprofile')
  
  afterEach ->
    tester.destroy()
  
  describe 'The Subject List', ->
    scope = null
    
    it 'should route home to the subject list', (done) ->
      tester.visit '/quip', ->
        console.log(">> sl visit enter")
        expect(tester.path()).to.equal('/quip')
        expect(tester.viewElement()).to.exist
        expect(tester.viewScope()).to.exist
        # scope = tester.inject('$route').current.scope
        # console.log(">> sl ck " + scope)
        # resolved = ->
        #   scope.subjects
        # tester.until resolved, ->
        #   console.log(">> sl rslvd enter")
        #   expect(scope.subjects).to.not.be.empty
        #   done()
