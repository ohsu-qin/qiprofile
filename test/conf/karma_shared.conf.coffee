module.exports = (config) ->
  # The base path to resolve files.
  basePath: '../..'

  # The karma adapter frameworks to use.
  frameworks: ['mocha', 'chai']

  # The test specs can be written in coffescript.
  preprocessors: '**/*.coffee': 'coffee'

  # The files or patterns to load in the browser.
  files: [
    '_public/javascripts/vendor.js'
    '_public/javascripts/app.js'
    '_public/javascripts/test.js'
    'test/conf/mocha.conf.coffee'
  ]

  # The test results reporter.
  # Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'.
  reporters: ['progress']

  # Flag indicating whether to display colors in the reporter and log output.
  colors: true

  # The logging level.
  # Possible values: config.LOG_DISABLE, config.LOG_ERROR, config.LOG_WARN,
  # config.LOG_INFO, config.LOG_DEBUG.

  # Flag indicating whether to execute the tests whenever any file changes.
  autoWatch: false

  # The browsers to start.
  # Possible values:
  # - Chrome
  # - ChromeCanary
  # - Firefox
  # - Opera (has to be installed with `npm install karma-opera-launcher`)
  # - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
  # - PhantomJS
  # - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
  browsers: ['Chrome']

  # If the browser does not capture in given timeout (ms), then kill it.
  captureTimeout: 10000

  # The Continuous Integration mode.
  # If true, then karma will capture the browsers, run the tests and exit.
  # This value is set in the grunt config file.
  # singleRun: true
