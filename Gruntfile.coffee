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

    clean: ['_build', '_public/*']

    copy:
      js:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: [
          'angular/angular.js'
          'angular-animate/angular-animate.js'
          'angular-bootstrap/ui-bootstrap-tpls.js'
          'angular-resource/angular-resource.js'
          'angular-route/angular-route.js'
          'angular-touch/angular-touch.js'
          'angular-ui-router/release/*.js'
          'angularjs-nvd3-directives/dist/*.js'
          'd3/*.js'
          'domready/ready.js'
          'lodash/lodash.js'
          'moment/*.js'
          'nvd3/nv.d3.js'
          'requirejs/require.js'
          'spin.js/spin.js'
          'stacktrace-js/stacktrace.js'
          'underscore.string/lib/*.js'
          'venturocket-angular-slider/build/*.js'
          'xtk/dist/xtk.js'
          # Exclude minimized files.
          '!**/*.min.js'
        ]
        dest: '_public/javascripts/lib'

      css:
        # Note: Since the non-minimized Bootstrap module
        # references the CSS map, the map must be colocated
        # with the stylesheets.
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
          'bower_components/font-awesome/css/font-awesome.css'
          'bower_components/nvd3/nv.d3.css'
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

    karma:
      options:
        singleRun: not grunt.option('debug')
        browsers: [if grunt.option('debug') then 'Chrome' else 'PhantomJS']
        logLevel: [if grunt.option('debug') then 'DEBUG' else 'ERROR']
      unit:
        configFile: 'test/conf/karma-conf.coffee'

    exec:
      selenium:
        # If selenium is not already running, then start it. Suppress all
        # output, since there are no documented options to tailor the
        # selenium log level or log file at the command line. The selenium
        # server is spawned as a background process that survives the grunt
        # session. The command pseudo-code is as follows:
        # * Check for a process which listens on port 4444
        # * Start the selenium server as a background process
        # * Suppress all output
        # The selenium server can be killed by getting the process id
        # using the netstat command and issuing a kill command on that pid.
        # This command runs in Mac and Linux, but not Windows.
        command: 'netstat -lnp tcp 2>/dev/null | grep -q 4444 || ' +
                 './node_modules/selenium-standalone/bin/start-selenium' +
                  ' > /dev/null 2>&1 &'
        
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

  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'default', ['build:dev']

  grunt.registerTask 'copy:app', ['copy:js', 'copy:css', 'copy:fonts', 'copy:static']

  grunt.registerTask 'concat:app', ['concat:css']

  grunt.registerTask 'vendor:app', ['copy:app', 'concat:app']

  grunt.registerTask 'compile:js', ['coffee:compile', 'preprocess']

  grunt.registerTask 'compile', ['concurrent:compile']

  grunt.registerTask 'build:app', ['clean', 'vendor:app', 'compile']

  grunt.registerTask 'build:dev', ['env:dev', 'build:app', 'exec:updatewebdriver']

  grunt.registerTask 'build:prod', ['env:prod', 'build:app']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['exec:bowerinstall', 'exec:bowerprune', 'build:prod']

  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  grunt.registerTask 'start:test', ['express:test', 'watch']

  grunt.registerTask 'start:prod', ['express:prod']

  grunt.registerTask 'start', ['start:dev']

  grunt.registerTask 'test:unit', ['karma:unit']

  grunt.registerTask 'test:e2e', ['exec:selenium', 'express:test', 'protractor:e2e']

  grunt.registerTask 'test', ['test:unit', 'test:e2e']

  grunt.registerTask 'release', ['build:prod', 'requirejs', 'cssmin']
