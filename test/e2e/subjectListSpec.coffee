_ = require 'lodash'

webdriver = require 'selenium-webdriver'

expect = require('./helpers/expect')()

Page = require './helpers/page'

class SubjectListPage extends Page
  constructor: ->
    super('/quip/subjects?project=QIN_Test')

  # Hyperlink locator.
  ANCHOR_LOCATOR = By.tagName('a')

  # @returns a promise resolving to the asssociative collection
  #   {name: subjects} object
  @property collectionSubjects: ->
    # @param assoc the associate accumulator object
    # @param pair the [name, subjects] array
    # @returns the accumulator object
    merge = (assoc, pair) ->
      [name, subjects] = pair
      assoc[name] = subjects
      assoc

    @findAll('collection in collections')
      .then (lists) ->
        lists.map (list) ->
          name = list.text(By.binding('collection'))
          subjects = list.findAll('a')
            .then (anchors) ->
              anchors.map (anchor) -> anchor.text()
            .then (text) ->
              webdriver.promise.all(text)
          pair = [name, subjects]
          webdriver.promise.all(pair)
      .then (pairs) ->
        webdriver.promise.all(pairs)
      .then (pairs) ->
        pairs.reduce(merge, {})

describe 'E2E Testing Subject List', ->
  page = null

  beforeEach ->
    page = new SubjectListPage

  # FIXME - before the tests, Protractor displays the following message:
  #     Client error: TypeError: Cannot read property 'hasOwnProperty' of null
  #     See the log at /var/log/qiprofile.log
  #   However, the tests then run successfully.
  #   Find out why this error occurs and why, unlike other errors, it is
  #   ignored.

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
    assocFinder = null

    before ->
      assocFinder = page.collectionSubjects

    it 'should display the Breast and Sarcoma collections', ->
      expect(assocFinder, 'The collections are incorrect')
        .to.eventually.have.all.keys(['Breast', 'Sarcoma'])

    it 'should display the subjects', ->
      expected = ("Patient #{ n }" for n in [1, 2, 3])
      assocFinder.then (assoc) ->
        expect(assoc.Breast, 'The Breast subjects are incorrect')
          .to.eql(expected)
        expect(assoc.Sarcoma, 'The Sarcoma subjects are incorrect')
          .to.eql(expected)

    it 'should visit the Subject Detail page', ->
      visit = page.findAll('collection in collections')
        .then (collElts) ->
          collElts[0].findAll('subject in subjects')
        .then (sbjElts) ->
          sbjElts[0].find('a')
        .then (linkElt) ->
          linkElt.visit()
       expect(visit, 'The Subject Detail page is not visited')
        .to.eventually.match(/^\/quip\/\w+\/subject\/\d+/)
