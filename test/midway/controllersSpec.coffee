describe 'Midway Testing Controllers', ->
  tester = null

  beforeEach ->
    tester = ngMidwayTester('qiprofile')
  
  afterEach ->
    tester.destroy()
  
  describe 'Subject List', ->
    scope = null
    
    it 'should route home to the subject list', (done) ->
      tester.visit '/test/quip', ->
        #expect(tester.path()).to.equal('/')
        expect(tester.viewElement()).to.exist
        console.log(tester.viewElement().html())
        # scope = tester.inject('$route').current.scope
        # console.log(">> sl ck " + scope)
        # resolved = ->
        #   scope.subjects
        # tester.until resolved, ->
        #   console.log(">> sl rslvd enter")
        #   expect(scope.subjects).to.not.be.empty
        done()
