exports.config =
  # Note: the debug and logLevel options are set in the grunt
  # protractor task based on whether the grunt command is
  # executed with the --debug option.

  # Run under the mocha framework rather than the default jasmine.
  framework: 'mocha'

  # Although protractor can run CoffeeScript tests, stack trace line
  # numbers are for the compiled Javascript rather than the source
  # CoffeeScript. StackOverflow has some posts on this, but as of
  # 9/10/2014 no solution was forthcoming. Work-around is to compile
  # the error test spec and go to the line number in that file.
  # The coding standard that all expectations include a string
  # failure message facilitates tracing the error without resorting
  # to a compile.
  plugins: [package: 'protractor-coffee-preprocessor']

  # If the selenium address is not specified, then protractor
  # issues the following error message:
  #    Could not find chromedriver
  seleniumAddress: 'http://localhost:4444/wd/hub'

  # The test server is on port 3001, not 3000.
  baseUrl: 'http://localhost:3001/quip/'

  # Run all e2e specs. The command line --specs option overrides
  # this setting.
  specs: ['../e2e/**Spec.coffee']

  # Run the qirest seed and link the test fixtures into _public,
  # if necessary.
  onPrepare: '../e2e/helpers/seed'

  # Pass options into mocha.
  mochaOpts:
    # Allow four seconds per test rather than the default two seconds.
    timeout: 4000

    # The spec reporter has nice checkmarks.
    reporter: 'spec'

    # Raise the threshold for showing slow tests in red to 1.2 seconds.
    slow: 1200
