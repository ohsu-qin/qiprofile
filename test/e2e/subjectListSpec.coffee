expect = require('./helpers/expect')()

Page = require './helpers/page' 

class SubjectListPage extends Page
  h3Locator = By.tagName('h3')

  anchorLocator = By.tagName('a')

  # @returns the collection {name, subjects} array promise
  collection_subjects: ->
    element.all(By.repeater('coll in collections')).map (repeat) ->
      repeat.isElementPresent(h3Locator).then (exists) ->
        if exists
          repeat.element(h3Locator).then (h3) ->
            coll = h3.getText()
            repeat.isElementPresent(anchorLocator).then (exists) ->
              if exists
                repeat.all(anchorLocator).then (hyperlinks) ->
                  sbjs = (hyperlink.getText() for hyperlink in hyperlinks)
                  {name: coll, subjects: sbjs}  
              else
                {name: coll, subjects: []}  
        else
          []

describe 'E2E Testing Subject List', ->
  page = null

  beforeEach ->
    page = new SubjectListPage '/quip?project=QIN_Test'

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

  it 'should display the billboard', ->
    expect(true).to.be.true
    expect(page.billboard, 'The billboard is incorrect')
      .to.eventually.equal('Patients')

  it 'should have a home button', ->
    pat = /.*\/quip\?project=QIN_Test$/
    expect(page.home, 'The home URL is incorrect')
      .to.eventually.match(pat)

  it 'should have help text', ->
    expect(page.help, 'The help is missing').to.eventually.exist

  it 'should display a contact email link', ->
    pat = /a href="mailto:\w+@ohsu.edu"/
    expect(page.contactInfo, 'The email address is missing')
      .to.eventually.match(pat)

  describe 'Collections', ->
    content = null

    beforeEach ->
      content = page.collection_subjects()

    it 'should display the Breast and Sarcoma collections', ->
      collections = content.then (assns) ->
        assns.map (assn) -> assn.name
      # The collections are sorted. The comparison is the Chai
      # deep equals operator eql rather than equal.
      expect(collections, 'The collections are incorrect')
        .to.eventually.eql(['Breast', 'Sarcoma'])

    it 'should display the subjects', ->
      subjects = content.then (assns) ->
        assns.map (assn) -> assn.subjects 
      expected = (("Patient #{ n }" for n in [1, 2, 3]) for i in [1, 2])
      expect(subjects, 'The subjects are incorrect')
        .to.eventually.eql(expected)
