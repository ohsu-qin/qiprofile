expect = require('./helpers/expect')()

Page = require './helpers/page'

describe 'E2E Testing Collection', ->
  page = null

  beforeEach ->
    page = new Page '/quip/breast?project=QIN_Test'

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist
