# This main-test file sets the Karma testing require.js configuration.

# The test spec pattern.
SPEC_REGEXP = /Spec\.js$/

# The files specified in the Karma config.
karmaFiles = Object.keys(window.__karma__.files)

# Karma serves files under /base. Replace this root with
# the unit test spec location and remove the file extension.
# The Karma files are at unit/test and the spec location
# is relative to the base URL (_public/javascripts). Thus,
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
  baseUrl: rootUrl + '/_public/javascripts'
  
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
    angular: './lib/angular'
    d3: './lib/d3'
    domReady: './lib/domReady'
    lodash: './lib/lodash.underscore'
    moment: './lib/moment'
    nganimate: './lib/angular-animate'
    ngresource: './lib/angular-resource'
    ngroute: './lib/angular-route'
    ngnvd3: './lib/angularjs-nvd3-directives'
    nvd3: './lib/nv.d3'
    slider: './lib/angular-slider'
    spin: './lib/spin'
    'underscore.string': './lib/underscore.string'
    touch: './lib/angular-touch'
    uirouter: './lib/angular-ui-router'
    uibootstrap: './lib/ui-bootstrap-tpls'
    xtk: './lib/xtk'
    # The test helpers.
    expect: '../../test/unit/helpers/expect'
    # The test vendor libraries.
    chai: '../../node_modules/chai/chai'
    chaiAsPromised: '../../node_modules/chai-as-promised/lib/chai-as-promised'
    encoding: '../../node_modules/text-encoding/lib/encoding'
    ngmocks: '../../node_modules/angular-mocks/angular-mocks'
    pako: '../../node_modules/pako/dist/pako'

  # The non-AMD module dependencies replicates the web app main
  # shim dependencies, extended with the test modules. See the
  # paths note above.
  shim:
    angular: exports : 'angular'
    slider: deps: ['angular']
    lodash: exports: '_'
    nganimate: deps: ['angular']
    ngnvd3: deps: ['angular', 'nvd3']
    ngresource: deps: ['angular']
    ngroute: deps: ['angular']
    nvd3: deps: ['d3']
    slider: deps: ['touch']
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
