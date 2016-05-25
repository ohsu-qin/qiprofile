# This main-test file sets the Karma testing require.js configuration.

# The test spec pattern.
SPEC_REGEXP = /Spec\.js$/

# The files specified in the Karma config.
karmaFiles = Object.keys(window.__karma__.files)

# Karma serves files under /base. Replace this root with
# the unit test spec location and remove the file extension.
# The Karma files are at unit/test and the spec location
# is relative to the base URL (public). Thus,
# the test spec module paths are '../../test/unit/' followed
# by the test spec file name, minus the extension, e.g.
# '../../test/unit/imageSpec'.
#
# @param path the Karma file path
# @returns the module path
pathToModule = (path) ->
  path.replace(/^\/base/, '../..').replace(/\.js$/, '')

# The test specs.
specs =
  pathToModule(file) for file in karmaFiles when SPEC_REGEXP.test(file)

# Karma serves files from '/base'. Therefore, if the test is invoked
# with karma-runner, then the Karma root is /base. Otherwise, the root
# is empty.
if typeof window is 'undefined' or window.__karma__ is undefined
  rootUrl = ''
  callback = null
else
  rootUrl = 'http://localhost:9876/base';
  callback = window.__karma__.start

# The require.js configuration.
requirejs.config
  # The application Javascript URL.
  baseUrl: rootUrl + '/public'

  # Undocumented karama-requirejs magic added per
  # https://github.com/karma-runner/karma-requirejs/issues/6.
  # client:
  #   requireJsShowNoTimestampsError: false

  # The test module paths replicates the web app main config paths, but
  # points only to the locally installed libraries and includes the test
  # specs.
  #
  # Note: https://github.com/jrburke/requirejs/wiki/Patterns-for-separating-config-from-the-main-module
  # presents patterns for separating the requirejs config from main, but
  # none of them address sharing the config but changing the appDir,
  # baseUrl and deps. This is an open problem with requirejs. The least
  # bad option--which is still very lame--is suggested by the following
  # issue comment cited in the above reference: 'sometimes code
  # duplication isn't as bad as it seems'. Ugh: it is here.
  paths:
    ## Adapted from app/javascripts/main.coffee ##
    angular: './lib/angular' 
    cornerstone: './lib/cornerstone'
    crossfilter: './lib/crossfilter'
    d3: './lib/d3'
    dc: './lib/dc'
    domReady: './lib/domReady'
    'error-stack-parser': './lib/error-stack-parser'
    lodash: './lib/lodash'
    moment: './lib/moment'
    nganimate: './lib/angular-animate'
    ngndc: './lib/angular-dc'
    ngnvd3: './lib/angular-nvd3'
    nvd3: './lib/nv.d3'
    ngresource: './lib/angular-resource'
    ngroute: './lib/angular-route'
    ngsanitize: './lib/angular-sanitize'
    ngsprintf: './lib/angular-sprintf'
    pako: './lib/pako_inflate'
    slider: './lib/angular-slider'
    'source-map': './lib/source-map'
    spin: './lib/spin'
    sprintf: './lib/sprintf'
    'stack-generator': './lib/stack-generator'
    stackframe: './lib/stackframe'
    stackScrollTool: './temp/stackScrollTool'
    stacktrace: './lib/stacktrace'
    'stacktrace-gps': './lib/stacktrace-gps'
    touch: './lib/angular-touch'
    'underscore.string': './lib/underscore.string'
    uirouter: './lib/angular-ui-router'
    uibootstrap: './lib/ui-bootstrap-tpls'
    ## End of copy ##

    # The test helpers.
    expect: '../../test/unit/helpers/expect'
    # The test vendor libraries.
    chai: '../../node_modules/chai/chai'
    chaiAsPromised: '../../node_modules/chai-as-promised/lib/chai-as-promised'
    encoding: '../../node_modules/text-encoding/lib/encoding'
    ngmocks: '../../node_modules/angular-mocks/angular-mocks'
    pako: '../../node_modules/pako/dist/pako'

  # The module configurations.
  config:
    moment:
      noGlobal: true

  # The non-AMD module dependencies replicates the web app main
  # shim dependencies, extended with the test modules. See the
  # paths note above.
  #
  ## Copied from app/javascripts/main.coffee ##
  # The non-AMD module dependencies.
  shim:
    angular: exports : 'angular'
    d3: exports: 'd3'
    lodash: exports: '_'
    nganimate: deps: ['angular']
    ngnvd3: deps: ['angular', 'nvd3']
    ngresource: deps: ['angular']
    ngroute: deps: ['angular']
    ngsanitize: deps: ['angular']
    nvd3: deps: ['d3']
    slider: deps: ['touch']
    touch: deps: ['angular']
    uibootstrap: deps: ['angular']
    uirouter: deps: ['ngroute']

  shim:
    angular: exports: 'angular'
    lodash: exports: '_'
    nganimate: deps: ['angular']
    ngnvd3: deps: ['angular', 'nvd3']
    ngresource: deps: ['angular']
    ngroute: deps: ['angular']
    ngsanitize: deps: ['angular']
    nvd3: deps: ['d3']
    slider: deps: ['angular', 'touch']
    touch: deps: ['angular']
    uibootstrap: deps: ['angular']
    uirouter: deps: ['ngroute']
    # The test vendor dependencies.
    ngmocks:
      deps: ['ngresource']
      exports: 'angular.mock'

  # Dynamically load the test files.
  deps: specs

  # Asynchronously start Karma.
  callback: callback
