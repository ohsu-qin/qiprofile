expect = require('./helpers/expect')()

Page = require('./helpers/page')()

class SubjectListPage extends Page
  collections: ->
    element.all(By.repeater('coll in collections')).map (elt, index) ->
      elt.findElement(By.tagName('h3')).getText()

describe 'E2E Testing Subject List', ->
  page = new SubjectListPage '/quip'
  
  it 'should display the billboard', ->
    expect(page.billboard).to.eventually.equal('Patients')
  
  it 'should have the Breast and Sarcoma collections', ->
    collections = page.collections()
    expect(collections).to.eventually.contain('Breast')
    expect(collections).to.eventually.contain('Sarcoma')
