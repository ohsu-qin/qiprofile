# This main-test file sets the Karma testing require.js configuration.

# The test spec pattern.
SPEC_REGEXP = /Spec\.js$/

# Karma serves files under /base. Remove this root
# from the file path to get the module path.
#
# @param path the Karma file path
# @returns the module path
pathToModule = (path) ->
  path.replace(/^\/base\//, '').replace(/\.js$/, '')

# The files specified in the Karma config.
karmaFiles = Object.keys(window.__karma__.files)
# The test specs.
specs =
  pathToModule(file) for file in karmaFiles when SPEC_REGEXP.test(file)

# The require.js configuration.
require.config
  # The Karma root.
  baseUrl: '/base'

  # The module paths.
  paths:
    angular: '/base/node_components/angular/angular'
    angularRoute: '/base/node_components/angular-route/angular-route'
    angularMocks: '/base/node_components/angular-mocks/angular-mocks'
    chaiAsPromised: '/base/node_components/chai-as-promised/chai-as-promised'


  # More obscure require magic.
  shim:
    angular: exports : 'angular'
    angularRoute: ['angular']
    angularMocks:
    	deps: ['angular']
    	exports: 'angular.mock'

  # Dynamically load the test files.
  deps: specs

  # Asynchronously start Karma.
  callback: window.__karma__.start
