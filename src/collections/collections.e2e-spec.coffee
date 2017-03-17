expect = require('../testing/expect')()

Page = require '../testing/page'

_ = require 'lodash'


###*
 * The Collection List E2E page encapsulation.
 *
 * @module collections
 * @class CollectionListPage
 * @extends Page
###
class CollectionListPage extends Page
  constructor: ->
    # Call the Page superclass initializer with the helpShown
    # flag set to true, since the help box is displayed on
    # this landing page.
    super(Page.HOME, true)
  
  # @return the collection {name, description, url} object
  #   array promise
  collections: ->
    @findAll('qi-collection-item').then (rows) =>
      resolvers = rows.map(@_parse_row)
      Promise.all(resolvers)
  
  # @return the collection {name, description, url} promises
  _row_finders: (row) ->
    link: row.find('a')
    name: row.text('a')
    description: row.text('span')
    info: row.find('button')
  
  # @return a promise which resolves to the collection
  #   {name, description, url}
  _parse_row: (row) =>
    accumulate = (accum, pair) ->
      [property, value] = pair
      accum[property] = value
      accum
    
    finders = @_row_finders(row)
    resolvers = _.toPairs(finders).map (pair) ->
      [property, finder] = pair
      finder.then (resolved) ->
        [property, resolved]
    
    Promise.all(resolvers).then (resolved) =>
      resolved.reduce(accumulate, {})

###*
 * The Collection List E2E validator.
 *
 * @module collections
 * @class CollectionListSpec
###
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
    it 'should display the title', ->
      expect(page.title, 'The title is incorrect')
        .to.eventually.equal('QIN_Test Collections')
    
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
      page.collections().then (_rows) ->
        rows = _rows
    
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
        expect(row.info.visit(), "The info link doesn't exist")
          .to.eventually.exist
    
    xit 'should link to the Collection Detail page', ->
      for row, i in rows
        expect(row.link, "The #{ row.name } collection #{ i }" +
                         " is missing a hyperlink")
          .to.exist
        # The Collection Detail page URL is
        # .../qiprofile/<project>/<collection>
        matcher = page.url_pattern("#{ page.url }/#{ row.name }")
        actual = row.link.visit()
        expect(actual, "The visited #{ row.name } Collection Detail" +
                       " page URL is incorrect")
          .to.eventually.match(matcher)
