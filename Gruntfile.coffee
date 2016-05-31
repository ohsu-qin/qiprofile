module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')

    env:
      dev:
        NODE_ENV: 'development'
      prod:
        NODE_ENV: 'production'

    clean:
      # Note: Grunt 0.4.5 file.js has an invalid test for whether the
      #   target is contained in the cwd. Work-around is the force option.
      # Note: the odd public patterns are the most concise way to delete
      #   all of the public tree except for the data and jspm_packages
      #   subdirectories. The entries:
      #     'public/**', '!public/jspm_packages/**'
      #   deletes the entire public tree. Given
      #   https://github.com/cbas/grunt-rev/issues/16, this is probably
      #   a grunt bug, although it is unclear how the force option is
      #   intended to modify the behavior in this case.
      derived: ['_build', 'public/*', 'public/*/**', '!public/data/**',
                '!public/jspm_packages/**']
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
        cwd: 'app/'
        src: ['**/*.ts']
        dest: 'public/'
        # See the pug extDot comment.
        extDot: 'last'

    tslint:
      files:
        src: ['app/**/*.ts']

    coffee:
      default:
        expand: true
        ext: '.js'
        cwd: 'app/'
        src: ['**/*.coffee']
        dest: 'public/'

    pug:
      options:
        pretty: true
      default:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['**/*.pug', '!**/include/**']
        dest: 'public/'
        # The default extDot chops off more than the trailing .pug, e.g.:
        #   src/collections.view.pug -> public/collections.html
        # We want to preserve the filename up to .pug, e.g.:
        #   src/collections.view.pug -> public/collections.view.html
        extDot: 'last'

    markdown:
      default:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['**/*.md']
        dest: 'public/'

    stylus:
      options:
        use: [
          require('autoprefixer-stylus')
          require('csso-stylus')
        ]
      default:
        src: ['app/stylesheets/app.styl']
        dest: 'public/stylesheets/app.css'

    copy:
      # The native applicaton JavaScript files.
      js:
        expand: true
        cwd: 'app/'
        src: ['**/*.js']
        dest: 'public/'

      # The applicaton TypeScript files.
      ts:
        expand: true
        cwd: 'app/'
        src: ['**/*.ts']
        dest: 'public/'

      # The applicaton JSON files.
      json:
        expand: true
        cwd: 'app/'
        src: ['**/*.json']
        dest: 'public/'

      # The images and icons.
      static:
        expand: true
        src: ['static/**']
        dest: 'public/'

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
        dest: 'public/stylesheets/'

      fonts:
        expand: true
        flatten: true
        cwd: 'node_modules/'
        # Note: Due to a grunt bug, the font-awesome example subdirectory,
        #   e.g. 4.0.4/index.html, can't be excluded
        #   (cf. https://github.com/gruntjs/grunt-contrib-copy/issues/13).
        src: ['bootstrap/dist/fonts/*', 'font-awesome/fonts/*']
        dest: 'public/fonts/'

    # Copy only changed app files.
    sync:
      ts:
        expand: true
        cwd: 'app/'
        src: ['**/*.ts']
        dest: 'public/'

      js:
        expand: true
        cwd: 'app/'
        src: ['**/*.js']
        dest: 'public/'

    concat:
      css:
        src: [
          'node_modules/bootstrap/dist/css/bootstrap.css'
          'node_modules/font-awesome/css/font-awesome.css'
        ]
        dest: 'public/stylesheets/vendor.css'

    concurrent:
      options:
        logConcurrentOutput: true
      compile:
        tasks: ['coffee', 'pug', 'markdown', 'stylus']

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['public/stylesheets/app.css']
        dest: 'public/stylesheets/app.min.css'

    browserSync:
      options:
        watchTask: true
        proxy: 'http:3000'
      bsFiles:
        src:
          'public/**'

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
        command: './node_modules/.bin/r.js -convert _build/commonjs public/lib'

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
      ts:
        files: ['app/**/*.ts']
        tasks: ['sync:ts']
      js:
        files: ['app/**/*.js']
        tasks: ['sync:js']
      json:
        files: ['app/**/*.json']
        tasks: ['copy:json']
      coffee:
        files: ['app/**/*.coffee']
        tasks: ['coffee']
      pug:
        files: ['app/**/*.pug', 'test/**/*.pug']
        tasks: ['pug']
      stylus:
        files: ['app/**/*.styl']
        tasks: ['stylus']
      markdown:
        files: ['app/partials/**/*.md']
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
