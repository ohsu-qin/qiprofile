expect = require('../testing/expect')()

Page = require '../testing/page'

_ = require 'lodash'

###*
 * The Project List E2E page encapsulation.
 *
 * @module projects
 * @class ProjectListPage
 * @extends Page
###
class ProjectListPage extends Page
  constructor: ->
    # Call the Page superclass initializer with the helpShown
    # flag set to true, since the help box is displayed on
    # this landing page.
    super('/qiprofile/', true)

  # @return the project {name, description, url} object
  #   array promise
  projects: ->
    @findAll('qi-project-item').then (rows) =>
      resolvers = rows.map(@_parse_row)
      Promise.all(resolvers)

  # @return the project {name, description, url} promises
  _row_finders: (row) ->
    link: row.find('a')
    name: row.text('a')
    description: row.text('span')
    info: row.find('button')

  # @return a promise which resolves to the project
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

    Promise.all(resolvers).then (resolved) ->
      resolved.reduce(accumulate, {})

###*
 * The Project List E2E validator.
 *
 * @module projects
 * @class ProjectListSpec
###
describe 'E2E Testing Project List', ->
  page = null

  before ->
    page = new ProjectListPage

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
        .to.eventually.equal('Projects')

    it 'should have a home button', ->
      expect(page.home, 'The home URL is incorrect')
        .to.eventually.match(page.url_pattern())

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

  describe 'Projects', ->
    rows = null

    before ->
      page.projects().then (colls) ->
        rows = colls

    it 'should display the QIN_Test project', ->
      names = _.map(rows, 'name')
      expect('QIN_Test', 'The project names are incorrect')
        .to.be.oneOf(names)

    it 'should link to the Collections List page', ->
      for row, i in rows
        expect(row.link, "The #{ row.name } collection #{ i }" +
                         " is missing a hyperlink")
          .to.exist
        # The Collection List page URL is
        # .../qiprofile/<project>
        matcher = page.url_pattern("#{ page.url }#{ row.name }")
        actual = row.link.visit()
        expect(actual, "The visited #{ row.name } Collection List" +
                       " page URL is incorrect")
          .to.eventually.match(matcher)
