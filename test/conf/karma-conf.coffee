module.exports = (config) ->
  config.set
    # The base path to resolve files is the top-level qiprofile directory.
    basePath: '../..'
    
    # The karma adapter frameworks to use.
    frameworks: ['jspm', 'mocha', 'chai']

    # The files to load consist solely of the polyfill since karma-jspm
    # is responsible for loading the test and app files.
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js'
    ]

    # The proxies map the file paths to the karma root url /base.
    # Each directory referenced by a test file must be mapped as
    # a proxy.
    #
    # Note: /app is mapped to /src by jspm, so we don't need a separate
    #   /app/ mapping here.
    proxies:
      '/src/': '/base/src/'
      '/jspm_packages/': '/base/jspm_packages/'
      '/tsconfig.json': '/base/tsconfig.json'
      '/typings/': '/base/typings/'

    # By default, karma loads node_modules sibling karma-* plug-ins.
    # However, note that the plug-ins must be installed as siblings
    # of the launched karma node context. In particular, a globally
    # installed karma will not find locally installed karma plugins.
    # For both this reason and to ensure version consistency, it is
    # recommended that karma be installed locally in the project and
    # executed on the command line using the following command:
    #   ./node_modules/karam/bin/karma start
    #plugins: ['karma-jspm', 'karma-mocha', 'karma-chai', 'karma-phantomjs-launcher']

    # The jspm option specifies the files that karma-jspm loads
    # dynamically via SystemJS. loadFiles are loaded unconditionally
    # on start-up, and constitute the test suites. serveFiles are
    # loaded on demand when referenced.
    jspm:
      config: 'jspm.config.js'
      loadFiles: ['src/**/*.spec.*']
      #serveFiles: ['src/**/!(*.spec).*']
      # Include config and typings for TypeScript?
      serveFiles: ['src/**/*!(.spec).*', 'tsconfig.json', 'typings/**/*.d.ts']

    # The test results reporter.
    # Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    # and (thanks to karma-spec-reporter) 'spec'.
    reporters: ['spec']

    # Flag indicating whether to display colors in the reporter and log output.
    colors: true

    # The logging level. Possible values:
    # config.LOG_DISABLE .LOG_ERROR .LOG_WARN .LOG_INFO .LOG_DEBUG
    # The log level is set in the Grunt karma task.
    # logLevel : config.LOG_DEBUG

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
    # The Grunt karma task overrides this setting to Chrome in order to debug
    # a test case. See the Developer Guide for details.
    browsers: ['PhantomJS']

    # Print messages.
    client:
      captureConsole: true

    # If the browser does not capture output in the given number of 
    # milliseconds, then kill it.
    # Note: timeout doesn't necessarily mean the test fails, but guards
    # against hanging test cases. Chances are if it takes more than 2
    # seconds to run the test, the test either hangs or needs to be
    # refactored. 
    captureTimeout: 2000
    
    # Allowing empty test suites is useful when commenting out tests. The
    # default is true.
    # failOnEmptyTestSuite: false

    # The Continuous Integration mode.
    # If true, then karma will capture the browsers, run the tests and exit.
    # This value is overridden in the Gruntfile as follows:
    # * false if grunt is run with the --debug flag, true otherwise
    # The default is false.
    singleRun: true
