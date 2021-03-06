exports.config =
  # Note: unlike the karma config, protractor config files
  # are relative to the config file location.
  #
  # Note: the debug and logLevel options are set in the grunt
  # protractor task based on whether the grunt command is
  # executed with the --debug option.

  # Run under the mocha framework rather than the default jasmine.
  framework: 'mocha'

  # If the selenium address is not specified, then protractor
  # issues the following error message:
  #    Could not find chromedriver
  seleniumAddress: 'http://localhost:4444/wd/hub'

  # The test server is on port 3001, not 3000.
  baseUrl: 'http://localhost:3001/qiprofile/'

  # Run all e2e specs. The command line --specs option overrides
  # this setting.
  #
  # Note: When the volume E2E test is run last, it doesn't load
  # in any reasonable time. Bumping the time-out from 11 to 20
  # seconds doesn't help. The work-around is to run it first.
  specs: ['src/**/volume.e2e-spec.*', 'src/**/!(volume).e2e-spec.*']

  # Flag which directs Protractor to wait for the app to be
  # stable before each action.
  useAllAngular2AppRoots: true

  # Run the qirest seed and link the test fixtures into public,
  # if necessary.
  onPrepare: 'src/testing/seed'

  # Increase time-out from the default 11 seconds to 20 seconds.
  allScriptsTimeout: 20000

  # Pass options into mocha.
  mochaOpts:
    # Allow 20 seconds per test rather than the default two seconds.
    timeout: 20000

    # The spec reporter has nice checkmarks.
    reporter: 'spec'

    # Raise the threshold for showing slow tests in red to 1.2 seconds.
    slow: 1200
