module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')

    env:
      dev:
        NODE_ENV: 'development'
      prod:
        NODE_ENV: 'production'

    preprocess:
      # Note: This 'preprocess' task is actually used to post-process
      # the Javascript in place after it is compiled from CoffeeScript.
      js:
        src: '_public/javascripts/config.js'
      options:
        inline: true

    clean:
      # Note: Grunt 0.4.5 file.js has an invalid test for whether the
      #   target is contained in the cwd. Work-around is the force option.
      # Note: the odd _public patterns are the most concise way to delete
      #   all of the _public tree except for the data directory and the
      #   jspm package directory _public/javascripts/lib defined in
      #   package.json. The entries:
      #     '_public/**', '!_public/javascripts/lib'
      #   deletes the entire _public tree. Given
      #   https://github.com/cbas/grunt-rev/issues/16, this is probably
      #   a grunt bug, although it is unclear how the force option is
      #   intended to modify the behavior in this case.
      derived: ['_build', '_public/*.*', '_public/*/*', '!_public/data',
                '!_public/javascripts/lib']
      options:
        force: true

    ts:
      options:
        module: "commonjs"
        emitDecoratorMetadata: true
        sourceMap: true
        removeComments: false
        verbose: true
      default:
        expand: true
        cwd: 'app/'
        src: ['javascripts/*.ts']
        dest: '_public/'

    coffee:
      default:
        expand: true
        ext: '.js'
        cwd: 'app/'
        src: ['javascripts/*.coffee']
        dest: '_public/'

    jade:
      options:
        pretty: true
      default:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['index.jade', 'partials/**/*.jade', '!**/include/**']
        dest: '_public/'

    markdown:
      default:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['partials/**/*.md']
        dest: '_public/'

    stylus:
      options:
        use: [
          require('autoprefixer-stylus')
          require('csso-stylus')
        ]
      default:
        src: ['app/stylesheets/app.styl']
        dest: '_public/static/stylesheets/app.css'

    copy:
      # The native applicaton JavaScript files.
      js:
        expand: true
        cwd: 'app/'
        src: ['javascripts/*.js']
        dest: '_public/'

      # The applicaton TypeScript files.
      ts:
        expand: true
        cwd: 'app/'
        src: ['javascripts/*.ts']
        dest: '_public/'

      # The images and icons.
      static:
        expand: true
        src: ['static/**']
        dest: '_public/'

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
        dest: '_public/static/stylesheets/'

      fonts:
        expand: true
        flatten: true
        cwd: 'node_modules/'
        # Note: Due to a grunt bug, the font-awesome example subdirectory,
        #   e.g. 4.0.4/index.html, can't be excluded
        #   (cf. https://github.com/gruntjs/grunt-contrib-copy/issues/13).
        src: ['bootstrap/dist/fonts/*', 'font-awesome/fonts/*']
        dest: '_public/fonts/'

    concat:
      css:
        src: [
          'node_modules/bootstrap/dist/css/bootstrap.css'
          'node_modules/font-awesome/css/font-awesome.css'
        ]
        dest: '_public/static/stylesheets/vendor.css'

    karma:
      options:
        singleRun: not grunt.option('debug')
        browsers: [if grunt.option('debug') then 'Chrome' else 'PhantomJS']
        logLevel: [if grunt.option('debug') then 'DEBUG' else 'ERROR']
      unit:
        configFile: 'test/conf/karma-conf.coffee'

    exec:
      # Convert CommonJS modules to AMD.
      convert:
        command:
          './node_modules/.bin/r.js -convert _build/commonjs _public/javascripts/lib'

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
        # The sleep command pauses one second to allow the server to start.
        command: 'lsof -i :4444 >/dev/null 2>&1 || ' +
                 '(./node_modules/selenium-standalone/bin/selenium-standalone' +
                 '   install --silent && ' +
                 ' ((./node_modules/selenium-standalone/bin/selenium-standalone' +
                 '   start >/dev/null 2>&1 &) && sleep 1))'
      
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
      typescript:
        files: ['app/**/*.ts']
        tasks: ['copy:ts']
      coffee:
        files: ['app/**/*.coffee']
        tasks: ['coffee']
      javascript:
        files: ['app/**/*.js']
        tasks: ['copy:js']
      jade:
        files: ['app/**/*.jade', 'test/**/*.jade']
        tasks: ['jade']
      stylus:
        files: ['app/**/*.styl']
        tasks: ['stylus']
      markdown:
        files: ['app/partials/**/*.md']
        tasks: ['markdown']

    concurrent:
      options:
        logConcurrentOutput: true
      compile:
        tasks: ['compile:coffee', 'jade', 'markdown', 'stylus']

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['_public/stylesheets/app.css']
        dest: '_public/stylesheets/app.min.css'
  )

  # Load all grunt-* tasks.
  require('load-grunt-tasks')(grunt)

  # Build for development is the default.
  grunt.registerTask 'default', ['build:dev']

  # Assemble the app.
  grunt.registerTask 'copy:app', ['copy:js', 'copy:ts', 'copy:cssmap',
                                  'copy:fonts', 'copy:static']

  # Compile the app CoffeeScript.
  grunt.registerTask 'compile:coffee', ['coffee', 'preprocess']

  # Compile the app bits concurrently.
  grunt.registerTask 'compile', ['concurrent:compile']

  # Build the application from scratch.
  grunt.registerTask 'build:app', ['clean', 'copy:app', 'concat:css',
                                   'compile']

  # Build the app and test environment.
  grunt.registerTask 'build:dev', ['env:dev', 'build:app',
                                   'exec:updatewebdriver']

  # Build the app for deployment.
  grunt.registerTask 'build:prod', ['env:prod', 'build:app']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['build:prod']

  # Start the server with debug turned on.
  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  # Start the server in test mode.
  grunt.registerTask 'start:test', ['express:test', 'watch']

  # Start the server in production mode.
  grunt.registerTask 'start:prod', ['express:prod']

  # Start the server with debug by default.
  grunt.registerTask 'start', ['start:dev']

  # Run the Karma unit tests.
  grunt.registerTask 'test:unit', ['karma:unit']

  # Run the Protractor end-to-end tests.
  grunt.registerTask 'test:e2e', ['exec:selenium', 'express:test',
                                  'protractor:e2e']

  # Run all tests.
  grunt.registerTask 'test', ['test:unit', 'test:e2e']

  # Build the application as a RequireJS AMD module.
  grunt.registerTask 'release', ['build:prod']
