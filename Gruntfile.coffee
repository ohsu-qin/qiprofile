module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')

    env:
      dev:
        NODE_ENV: 'development'
      prod:
        NODE_ENV: 'production'

    clean:
      derived: ['javascripts', 'stylesheets', 'fonts', 'html']
      options:
        force: true

    ts:
      options:
        module: "commonjs"
        emitDecoratorMetadata: true
        sourceMap: true
        sourceRoot: 'app'
        removeComments: false
        verbose: true
      default:
        expand: true
        cwd: 'src/'
        src: ['**/*.ts']
        dest: 'public'
        # See the pug extDot comment.
        extDot: 'last'

    tslint:
      files:
        src: ['src/**/*.ts']
    
    typings:
      install: {}

    coffee:
      default:
        expand: true
        ext: '.js'
        cwd: 'coffeescripts/'
        src: ['**/*.coffee']
        dest: 'javascripts'

    pug:
      options:
        pretty: true
      default:
        expand: true
        ext: '.html'
        cwd: 'src/'
        src: ['**.pug', '!include/**']
        dest: 'html'
        # The default extDot chops off more than the trailing .pug, e.g.:
        #   src/collections.view.pug -> public/collections.html
        # We want to preserve the filename up to .pug, e.g.:
        #   src/collections.view.pug -> public/collections.view.html
        extDot: 'last'

    markdown:
      default:
        expand: true
        ext: '.html'
        cwd: 'src/'
        src: ['**/*.md']
        dest: 'html'

    stylus:
      options:
        use: [
          require('autoprefixer-stylus')
          require('csso-stylus')
        ]
      default:
        src: ['stylus/app.styl']
        dest: 'stylesheets/app.css'

    copy:
      # The native applicaton JavaScript files.
      js:
        expand: true
        cwd: 'coffeescripts/'
        src: ['**/*.js']
        dest: 'javascripts/'

      # Note: this task is only used to copy CSS map files. The
      # CSS style files themselves are copied to the destination
      # in the concat:css task.
      #
      # This task is only used to copy the Bootstrap map file. 
      # Since the non-minimized Bootstrap module references the
      # CSS map, the map must be colocated with the stylesheets.
      cssmap:
        expand: true
        flatten: true
        cwd: 'node_modules/'
        src: ['bootstrap/dist/css/bootstrap.css.map']
        dest: 'stylesheets/'

      fonts:
        expand: true
        flatten: true
        cwd: 'node_modules/'
        # Note: Due to a grunt bug, the font-awesome example subdirectory,
        #   e.g. 4.0.4/index.html, can't be excluded
        #   (cf. https://github.com/gruntjs/grunt-contrib-copy/issues/13).
        src: ['bootstrap/dist/fonts/*', 'font-awesome/fonts/*']
        dest: 'fonts/'

    concat:
      css:
        src: [
          'node_modules/bootstrap/dist/css/bootstrap.css'
          'node_modules/font-awesome/css/font-awesome.css'
        ]
        dest: 'stylesheets/vendor.css'

    concurrent:
      options:
        logConcurrentOutput: true
      compile:
        tasks: ['typings', 'coffee', 'pug', 'markdown', 'stylus']

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['stylesheets/app.css']
        dest: 'stylesheets/app.min.css'

    browserSync:
      options:
        watchTask: true
        proxy: 'http:3000'
      bsFiles:
        src:
          'html/**'

    karma:
      options:
        singleRun: not grunt.option('debug')
        browsers: [if grunt.option('debug') then 'Chrome' else 'PhantomJS']
        logLevel: [if grunt.option('debug') then 'DEBUG' else 'ERROR']
      unit:
        configFile: 'test/conf/karma-conf.coffee'

    exec:
      # This task is used in preference to grunt-selenium-standalone to
      # suppress extraneous console messages and wait for the server to
      # start.
      selenium:
        # If selenium is not already running, then start it. Suppress all
        # output, since there are no documented options to tailor the
        # selenium log level or log file at the command line. The selenium
        # server is spawned as a background process that survives the grunt
        # session. The command pseudo-code is as follows:
        # * Check for a process which listens on port 4444
        # * Start the selenium server as a background process
        # * Suppress non-error output
        #
        # The lsof command checks whether a process (hopefully the selenium
        # server) is already running on port 4444. The server can be killed
        # by the following command:
        #
        #   pkill -f selenium-standalone
        #
        # The sleep command pauses half a second to allow the server to start.
        # Otherwise, grunt might exit and kill the process aborning.
        command: 'lsof -i :4444 >/dev/null 2>&1 || ' +
                 '(./node_modules/selenium-standalone/bin/selenium-standalone' +
                 '   install --silent && ' +
                 ' ((./node_modules/selenium-standalone/bin/selenium-standalone' +
                 '   start >/dev/null 2>&1 &) && sleep .5))'

      updatewebdriver:
        command: './node_modules/protractor/bin/webdriver-manager update'

    protractor:
      e2e:
        configFile: 'test/conf/protractor-conf.coffee'

    express:
      options:
        script: 'server.js'
        output: 'The qiprofile server is listening'
      dev:
        options:
          debug: true
      prod:
        options:
          node_env: 'production'
      test:
        options:
          node_env: 'test'

    watch:
      options:
        livereload: true
      coffee:
        files: ['coffeescripts/**/*.coffee']
        tasks: ['coffee']
      pug:
        files: ['*.pug', '**/*.pug']
        tasks: ['pug']
      stylus:
        files: ['stylus/**/*.styl']
        tasks: ['stylus']
      markdown:
        files: ['partials/**/*.md']
        tasks: ['markdown']
  )

  # Load all grunt-* tasks.
  require('load-grunt-tasks')(grunt)

  # Build for development is the default.
  grunt.registerTask 'default', ['build:dev']

  # Compile the app bits concurrently.
  grunt.registerTask 'compile', ['concurrent:compile']

  # Build the application from scratch.
  grunt.registerTask 'build:app', ['clean', 'copy', 'concat:css', 'compile']

  # Build the app and test environment.
  grunt.registerTask 'build:dev', ['env:dev', 'tslint', 'build:app',
                                   'exec:updatewebdriver']

  # Build the app for deployment.
  grunt.registerTask 'build:prod', ['env:prod', 'build:app']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['build:prod']

  # Start the server with debug turned on.
  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  # Start the server in production mode.
  grunt.registerTask 'start:prod', ['express:prod']

  # Start the server with debug by default.
  grunt.registerTask 'start', ['start:dev']

  # Run the Karma unit tests.
  grunt.registerTask 'test:unit', ['karma:unit']

  # Run the Protractor end-to-end tests.
  grunt.registerTask 'test:e2e', ['exec:selenium', 'express:test', 'protractor:e2e']

  # Run all tests.
  grunt.registerTask 'test', ['test:unit', 'test:e2e']

  # Build the application as a RequireJS AMD module.
  grunt.registerTask 'release', ['build:prod']
