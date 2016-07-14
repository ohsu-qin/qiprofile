webdriver = require 'selenium-webdriver'

expect = require('./helpers/expect')()

Page = require './helpers/page'

_ = require 'lodash'


class CollectionListPage extends Page
  constructor: ->
    # Call the Page superclass initializer with the helpShown
    # flag set to true, since the help box is displayed on
    # this landing page.
    super(Page.HOME,  true)

  # @returns the collection {name, description, url} object
  #   array promise
  collections: ->
    @findAll('qi-collections-collection').then (rows) =>
      resolvers = rows.map(@_parse_row)
      Promise.all(resolvers)

  # @returns the collection {name, description, url} promises
  _row_finders: (row) ->
    name: row.text('a')
    description: row.text('span')
    info: row.find('button')

  # @returns a promise which resolves to the collection
  #   {name, description, url}
  _parse_row: (row) =>
    accumulate = (accum, pair) ->
      [property, value] = pair
      accum[property] = value
      accum

    finders = @_row_finders(row)
    resolvers = _.pairs(finders).map (pair) ->
      [property, finder] = pair
      finder.then (resolved) ->
        [property, resolved]

    Promise.all(resolvers).then (resolved) =>
      resolved.reduce(accumulate, {})

describe 'E2E Testing Collection List', ->
  page = null

  before ->
    page = new CollectionListPage

  it 'should load the page', ->
    expect(page.content, 'The page was not loaded')
      .to.eventually.exist
  
  # Note - it would be nice to test whether a trailing slash
  # resolves to the same page, but the many attempts to build
  # such a test case were unsuccessful. Test manually instead.

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
    rows = null
    
    before ->
      page.collections().then (colls) ->
        rows = colls

    it 'should display the Breast and Sarcoma collections', ->
      # The collections are sorted. The comparison is the Chai
      # deep equals operator eql rather than equal.
      names = _.map(rows, 'name')
      expect(names, 'The collection names are incorrect')
        .to.eql(['Breast', 'Sarcoma'])

    it 'should have an info button', ->
      for row, i in rows
        expect(row.info, "The #{ row.name } collection #{ i }" +
                         " is missing an info button")
          .to.exist

    xit 'should link to the collection detail', ->
      # TODO - Enable when the detail link is enabled.
      for row, i in rows
        expect(row.detail, "The #{ row.name } collection #{ i }" +
                           " is missing a detail hyperlink")
          .to.exist
        # The collection detail URL is
        # .../qiprofile/<project>/<collection>/....
        regex = RegExp(HOME + '/(\w+)')
        match = regex.exec(row.detail)
        expect(match, "The #{ row.name } collection detail" +
                          " hyperlink is malformed: #{ row.detail }")
          .to.exist
        expect(match[1], "The #{ row.name } collection detail" +
                       " hyperlink is incorrect: #{ row.detail }")
          .to.equal(row.name.toLowerCase())
