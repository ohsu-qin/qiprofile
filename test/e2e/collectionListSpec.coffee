webdriver = require 'selenium-webdriver'

expect = require('./helpers/expect')()

Page = require './helpers/page'

_ = require 'lodash'


class CollectionListPage extends Page
  # @param url the page request URL
  constructor: ->
    # Call the Page superclass initializer. The 
    super('/quip?project=QIN_Test',  true)

  # @returns the collection {name, description, url} object
  #   array promise
  collections: ->
    @findAll(By.repeater('collection in collections'), 'li')
      .then (rows) =>
        rows.map (row) =>
          @_parse_row(row)
      .then (rows) =>
         webdriver.promise.all(rows)

  # @returns the collection {name, description, url} promise
  _parse_row: (row) ->
    nameFinder = row.text(By.binding('collection.name'))
    descFinder = row.text(By.binding('collection.description'))
    infoFinder = row.find('button')
    finders = [nameFinder, descFinder, infoFinder]
    webdriver.promise.all(finders).then (resolved) ->
      [name, desc, info] = resolved
      {name: name, description: desc, info: info}


# Hyperlink locator.
ANCHOR_LOCATOR = By.tagName('a')


describe 'E2E Testing Collection List', ->
  page = null

  before ->
    page = new CollectionListPage()

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist

   # The page header test cases.
  describe 'Header', ->
    it 'should display the billboard', ->
      expect(page.billboard, 'The billboard is incorrect')
        .to.eventually.equal('Collections')

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
    collectionsFinder = null

    before ->
      collectionsFinder = page.collections()

    it 'should display the Breast and Sarcoma collections', ->
      names = collectionsFinder.then (collections) ->
        _.map(collections, 'name')
      # The collections are sorted. The comparison is the Chai
      # deep equals operator eql rather than equal.
      expect(names, 'The collection names are incorrect')
        .to.eventually.eql(['Breast', 'Sarcoma'])

    it 'should have an info button', ->
      collectionsFinder.then (collections) ->
        for coll in collections
          expect(coll.info, "The #{ coll.name } collection is" +
                            " missing an info button")
            .to.exist
