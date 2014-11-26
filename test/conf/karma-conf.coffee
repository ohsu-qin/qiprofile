module.exports = (config) ->
  config.set
    # The base path to resolve files is the top-level qiprofile
    # directory.
    basePath: '../..'

    # The karma adapter frameworks to use.
    frameworks: ['mocha', 'requirejs', 'chai']

    # The test specs can be written in coffescript.
    preprocessors: '**/*.coffee': 'coffee'

    # The files to load. The included flag defers loading in deference
    # to the requirejs loader. _public/javascripts/main.js is excluded
    # below, since that is the web app requirejs config. Testing uses
    # its own main config, which is the last file specified and is
    # loaded immediately.
    files: [
      # The web app libraries.
      {pattern: '_public/javascripts/**/*.js', included: false}
      # The test libraries.
      {pattern: 'node_modules/angular-mocks/angular-mocks.js', included: false}
      {pattern: 'node_modules/chai-as-promised/lib/chai-as-promised.js', included: false}
      {pattern: 'node_modules/pako/dist/pako.js', included: false}
      {pattern: 'node_modules/text-encoding/**/*.js', included: false}
      # The test specs.
      {pattern: 'test/unit/*Spec.coffee', included: false}
      # The chai eventually assertion helper.
      {pattern: 'test/unit/helpers/expect.coffee', included: false}
      # Lastly, the requirejs main config.
      'test/unit/main.coffee'
    ]

    # The requirejs configuration is given by test/unit/main.coffee,
    # not the application _public/javascripts/main.js file.
    exclude: [
      '_public/javascripts/main.js'
    ]

    # The test results reporter.
    # Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    # and (thanks to karma-spec-reporter") 'spec'.
    reporters: ['spec']

    # Flag indicating whether to display colors in the reporter and log output.
    colors: true

    # The logging level. Possible values:
    # config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN, config.LOG_INFO, config.LOG_DEBUG
    # The log level is set in the Grunt karma task.
    logLevel : config.LOG_DEBUG

    # Flag indicating whether to execute the tests whenever any file changes.
    autoWatch: false

    # The browsers to start.
    # 
    # Possible values:
    # - Chrome
    # - ChromeCanary
    # - Firefox
    # - Opera (requires karma-opera-launcher)
    # - Safari (Mac only; requires karma-safari-launcher)
    # - PhantomJS
    # - IE (Windows only; requires karma-ie-launcher)
    #
    # The Grunt karma task overrides this setting to Chrome in order to debug a
    # test case. See the Developer Guide for details.
    browsers: ['PhantomJS']

    # If the browser does not capture output in the given number of milliseconds,
    # then kill it.
    captureTimeout: 5000

    # The Continuous Integration mode.
    # If true, then karma will capture the browsers, run the tests and exit.
    # This value is set in the grunt config file.
    # singleRun: true
