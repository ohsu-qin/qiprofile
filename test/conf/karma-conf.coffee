module.exports = (config) ->
  config.set
    # The base path to resolve files is the top-level qiprofile
    # directory.
    basePath: '../..'
    
    # The karma adapter frameworks to use.
    frameworks: ['jspm', 'traceur', 'mocha', 'chai']

    # By default, karma loads node_modules sibling karma-* plug-ins.
    # However, note that the plug-ins must be installed as siblings
    # of the launched karma node context. In particular, a globally
    # installed karma will not find locally installed karma plugins.
    # For both this reason and to ensure version consistency, it is
    # recommended that karma be installed locally in the project and
    # executed on the command line using the following command:
    #   ./node_modules/karam/bin/karma start
    #plugins: ['karma-jspm', 'karma-mocha', 'karma-chai', 'karma-phantomjs-launcher']

    # The karma-jspm option specifying the files to dynamically
    # load via SystemJS.
    jspm:
      loadFiles: ['test/unit/**/*.spec.*'],
      serveFiles: ['src/**/*.*'],
      stripExtension: false

    # Print messages.
    client:
      captureConsole: true

    # The test specs can be written in CoffeeScript or TypeScript. 
    preprocessors:
      '**/*.coffee': 'coffee'
      '**/*.ts': 'typescript'

    # The files to load is empty since karma-jspm assumes that responsibility.
    files: ['node_modules/traceur/bin/traceur.js']

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
    
    # Allowing empty test suites is useful when commenting out tests. The
    # default is true.
    failOnEmptyTestSuite: false

    # The Continuous Integration mode.
    # If true, then karma will capture the browsers, run the tests and exit.
    # This value is overridden in the Gruntfile as follows:
    # * false if grunt is run with the --debug flag, true otherwise
    # The default is false.
    singleRun: true
