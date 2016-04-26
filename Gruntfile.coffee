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
      # target is contained in the cwd. Work-around is the force option.
      derived: ['_build', '_public/*']
      options:
        force: true

    copy:
      bower:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: [
          'angular/angular.js'
          'angular-animate/angular-animate.js'
          'angular-bootstrap/ui-bootstrap-tpls.js'
          'angular-dc/dist/angular-dc.js'
          'angular-resource/angular-resource.js'
          'angular-route/angular-route.js'
          'angular-sanitize/angular-sanitize.js'
          'angular-touch/angular-touch.js'
          'angular-ui-router/release/angular-ui-router.js'
          'angular-nvd3/dist/angular-nvd3.js'
          'cornerstone/dist/cornerstone.js'
          'crossfilter/crossfilter.js'
          'd3/d3.js'
          'dcjs/dc.js'
          'domready/ready.js'
          'error-stack-parser/dist/error-stack-parser.js'
          'eventEmitter/EventEmitter.js'
          'lodash/lodash.js'
          'moment/moment.js'
          'nvd3/build/nv.d3.js'
          'pako/dist/pako_inflate.js'
          'requirejs/require.js'
          'source-map/dist/source-map.js'
          'spin.js/spin.js'
          'sprintf/src/sprintf.js'
          'stackframe/dist/stackframe.js'
          'stack-generator/dist/stack-generator.js'
          'stacktrace-gps/dist/stacktrace-gps.js'
          'stacktrace-js/stacktrace.js'
          'underscore.string/dist/underscore.string.js'
          'venturocket-angular-slider/build/angular-slider.js'
        ]
        dest: '_public/javascripts/lib'

      # The non-coffee app javascript files.
      appjs:
        expand: true
        cwd: 'app/'
        src: ['javascripts/*.js']
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
        cwd: 'bower_components/'
        src: ['bootstrap/dist/css/bootstrap.css.map']
        dest: '_public/stylesheets/'

      fonts:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: ['bootstrap/dist/fonts/*', 'font-awesome/fonts/*']
        dest: '_public/fonts/'

      # The images and icons.
      static:
        expand: true
        cwd: 'static/'
        src: ['**']
        dest: '_public/'

    concat:
      css:
        src: [
          'bower_components/bootstrap/dist/css/bootstrap.css'
          'bower_components/cornerstone/dist/cornerstone.css'
          'bower_components/dcjs/dc.css'
          'bower_components/font-awesome/css/font-awesome.css'
          'bower_components/nvd3/build/nv.d3.css'
        ]
        dest: '_public/stylesheets/vendor.css'

    coffee:
      compile:
        expand: true
        ext: '.js'
        cwd: 'app/'
        src: ['javascripts/*.coffee']
        dest: '_public/'

    jade:
      options:
        pretty: true
      compile:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['index.jade', 'partials/**/*.jade', '!**/include/**']
        dest: '_public/'

    browserify:
      ndarray:
        src: []
        dest: '_build/commonjs/ndarray.js'
        options:
          require: ['ndarray']

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

      bowerinstall:
        command: './node_modules/.bin/bower update'
        
      bowerprune:
        command: './node_modules/.bin/bower prune'
      
      updatewebdriver:
        command: './node_modules/protractor/bin/webdriver-manager update'

    protractor:
      e2e:
        configFile: 'test/conf/protractor-conf.coffee'

    markdown:
      compile:
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
      compile:
        src: ['app/stylesheets/app.styl']
        dest: '_public/stylesheets/app.css'

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
      stylus:
        files: ['app/**/*.styl']
        tasks: ['stylus']
      coffee:
        files: ['app/**/*.coffee']
        tasks: ['compile:js']
      javascript:
        files: ['app/**/*.js']
        tasks: ['copy:appjs']
      jade:
        files: ['app/**/*.jade', 'test/**/*.jade']
        tasks: ['jade']
      markdown:
        files: ['app/partials/**/*.md']
        tasks: ['markdown']

    concurrent:
      options:
        logConcurrentOutput: true
      compile:
        tasks: ['compile:js', 'jade:compile', 'markdown', 'stylus']

    # TODO - try this.
    requirejs:
      compile:
        options:
          appDir: "_public"
          baseUrl: "javascripts"
          dir: "_build"
          mainConfigFile:'_public/javascripts/config.js'
          # Skip the CDN modules.
          paths:
            angular: 'empty:'
            domReady: 'empty:'
            nganimate: 'empty:'
            ngresource: 'empty:'
            ngroute: 'empty:'
            ngsanitize: 'empty:'
          modules: [ name:'qiprofile' ]
          findNestedDependencies: true

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

  # Copy the vendor javascript.
  grunt.registerTask 'copy:js', ['copy:bower', 'copy:appjs']

  # Assemble the app.
  grunt.registerTask 'copy:app', ['copy:js', 'copy:cssmap', 'copy:fonts',
                                  'copy:static']

  # Concatenate the app stylesheets.
  grunt.registerTask 'concat:app', ['concat:css']

  # Convert vendor modules to AMD as necessary.
  grunt.registerTask 'amdify', ['browserify', 'exec:convert']

  # Collect the vendor libraries.
  grunt.registerTask 'vendor:app', ['amdify', 'copy:app', 'concat:app']

  # Compile the app javascript.
  grunt.registerTask 'compile:js', ['coffee:compile', 'preprocess']

  # Compile the app bits concurrently.
  grunt.registerTask 'compile', ['concurrent:compile']

  # Build the application from scratch.
  grunt.registerTask 'build:app', ['clean', 'vendor:app', 'compile']

  # Build the app and test environment.
  grunt.registerTask 'build:dev', ['env:dev', 'build:app',
                                   'exec:updatewebdriver']

  # Build the app for deployment.
  grunt.registerTask 'build:prod', ['env:prod', 'build:app']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['exec:bowerinstall', 'exec:bowerprune',
                                     'build:prod']

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
  grunt.registerTask 'release', ['build:prod', 'requirejs', 'cssmin']
