# The Require.js config
# (cf. http://karma-runner.github.io/0.8/plus/RequireJS.html).

# @param str the search input string
# @param target the search target string
# @returns whether the input string ends with the target string
ends_with = (str, target) ->
  str.slice(-target.length) == target

# The tests are the files included in Karma which end in Spec.js.
tests =
  f for own f, _ of window.__karma__.files when ends_with(f, 'Spec.js')

requirejs.config
  # Karma serves files from '/base'.
  baseUrl: '/base/_public',
  
  paths:
    test: 'javascripts/test.js'

  # Enable Require.js to load the tests.
  deps: tests

  # Start the test run when the tests are loaded.
  callback: window.__karma__.start
