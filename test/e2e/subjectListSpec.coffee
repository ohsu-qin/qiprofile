expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectListPage extends Page
  h3Locator = By.tagName('h3')
  
  collections: ->
    repeats = element.all(By.repeater('coll in collections'))
    repeats.map (row, index) ->
      row.isElementPresent(h3Locator).then (exists) ->
        if exists
          row.findElement(h3Locator).getText()
        else
          null

describe 'E2E Testing Subject List', ->
  page = null

  beforeEach ->
    page = new SubjectListPage '/quip'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Patients')
  
  it 'should have the Breast and Sarcoma collections', ->
    # The collections are sorted. The comparison is the Chai deep
    # equals operator eql rather than equal.
    expect(page.collections()).to.eventually.eql(['Breast', 'Sarcoma'])
