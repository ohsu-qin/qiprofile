module.exports = (config) ->
  config.set
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
      'test/conf/mocha-conf.coffee'
      'test/unit/**/*Spec.coffee'
    ]

    # The test results reporter.
    # Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'.
    reporters: ['progress']

    # Flag indicating whether to display colors in the reporter and log output.
    colors: true

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
    # In addition, custom launchers can be defined with the customLaunchers config.
    browsers: ['PhantomJS']

    # If the browser does not capture in given timeout (ms), then kill it.
    captureTimeout: 20000

    # The Continuous Integration mode.
    # If true, then karma will capture the browsers, run the tests and exit.
    # This value is set in the grunt config file.
    # singleRun: true
