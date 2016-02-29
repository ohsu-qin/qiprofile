expect = require('./helpers/expect')()

Page = require './helpers/page'

class SubjectListPage extends Page
  # Subheading locator.
  H3_LOCATOR = By.tagName('h3')

  # Hyperlink locator.
  ANCHOR_LOCATOR = By.tagName('a')

  # @returns the collection {name, subjects} array promise
  collection_subjects: ->
    element.all(By.repeater('coll in collections')).map (repeat) ->
      repeat.isElementPresent(H3_LOCATOR).then (exists) ->
        if exists
          h3 = repeat.element(H3_LOCATOR)
          coll = h3.getText()
          repeat.isElementPresent(ANCHOR_LOCATOR).then (exists) ->
            if exists
              repeat.all(ANCHOR_LOCATOR).then (hyperlinks) ->
                sbjs = (hyperlink.getText() for hyperlink in hyperlinks)
                {name: coll, subjects: sbjs}
            else
              {name: coll, subjects: []}
        else
          []

describe 'E2E Testing Subject List', ->
  page = null

  beforeEach ->
    page = new SubjectListPage '/quip/subjects?project=QIN_Test'

  # FIXME - before the tests, Protractor displays the following message:
  #   Client error: TypeError: Cannot read property 'hasOwnProperty' of null
  #   See the log at /var/log/qiprofile.log
  # However, the tests then run successfully.
  # Find out why this error occurs and why, unlike other errors, it is
  # ignored.

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

   # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Patients')

    it 'should have a home button', ->
      expect(page.home, 'The home URL is incorrect')
        .to.eventually.match(Page.HOME_URL_PAT)

    describe 'Help', ->
      help = null
    
      before ->
        help = page.help

      it 'should have help text', ->
        expect(help, 'The help text is missing')
          .to.eventually.exist.and.not.be.empty

      it 'should display a {qu,sugg}estion box hyperlink', ->
        expect(help, 'The {qu,sugg}estion box hyperlink is missing')
          .to.eventually.include(Page.SUGGESTION_BOX_URL)

  describe 'Collections', ->
    collectionSubjectsFinder = null

    before ->
      collectionSubjectsFinder = page.collection_subjects()

    it 'should display the Breast and Sarcoma collections', ->
      collectionsFinder = collectionSubjectsFinder.then (colls) ->
        colls.map (coll) -> coll.name
      # The collections are sorted. The comparison is the Chai
      # deep equals operator eql rather than equal.
      expect(collectionsFinder, 'The collections are incorrect')
        .to.eventually.eql(['Breast', 'Sarcoma'])

    it 'should display the subjects', ->
      subjectsFinder = collectionSubjectsFinder.then (collections) ->
          collections.map (coll) -> coll.subjects
      expected = (("Patient #{ n }" for n in [1, 2, 3]) for i in [1, 2])
      expect(subjectsFinder, 'The subjects are incorrect')
        .to.eventually.eql(expected)
