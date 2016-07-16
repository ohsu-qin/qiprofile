module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')

    clean:
      derived: ['public', 'build']
      options:
        force: true

    ts:
      options:
        module: "commonjs"
        emitDecoratorMetadata: true
        sourceMap: true
        sourceRoot: 'src'
        removeComments: false
        verbose: true
      app:
        expand: true
        cwd: 'src/'
        src: ['**/*.ts']
        out: 'public/app.ts'
      tslint:
        options:
          sourceMap: false
          sourceRoot: false
        src: ['tslint/src/rules/*.ts', 'node_modules/tslint/lib/tslint.d.ts']
        dest: 'tslint/dist/rules'

    tslint:
      files:
        src: ['src/**/*.ts']
    
    typings:
      install: {}

    pug:
      options:
        pretty: true
      index:
        src: 'index.pug'
        dest: 'index.html'
      partials:
        expand: true
        cwd: 'src/'
        ext: '.html'
        src: ['*.pug', '*/**.pug', '!layout/*.pug', '!**include/*.pug']
        dest: 'public/html'

    stylus:
      options:
        use: [
          require('autoprefixer-stylus')
          require('csso-stylus')
        ]
      default:
        src: ['stylesheets/app.styl']
        dest: 'public/stylesheets/app.css'

    copy:
      static:
        expand: true
        cwd: 'static/'
        src: '**/*'
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
      
      doc:
        expand: true
        src: ['src/**/*.ts']
        dest: 'build'
    
    coffee:
      doc:
        expand: true
        ext: '.js'
        extDot: 'last'
        src: ['src/**/*.coffee']
        dest: 'build'

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
        tasks: ['typings', 'pug', 'stylus']

    yuidoc:
      compile:
        name: '<%= pkg.name %> API',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        configfile: 'doc/yuidoc.json'
        options:
          paths: 'build/src'
          outdir: 'build/doc/api'
          themedir: "node_modules/yuidoc-ember-cli-theme"
          helpers: ['node_modules/yuidoc-ember-cli-theme/helpers.js']
          extension: ".ts,.js"

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
          'html/**'
    
    jspm:
      dist:
        files:
          "public/app.js": "build/app.js"

    karma:
      options:
        singleRun: not grunt.option('debug')
        browsers: [if grunt.option('debug') then 'Chrome' else 'PhantomJS']
        logLevel: [if grunt.option('debug') then 'DEBUG' else 'ERROR']
      unit:
        configFile: 'test/conf/karma-conf.coffee'

    exec:
      # Clean all installation artifacts, including the qirest Anaconda
      # environment.
      cleanall:
        command:
          'rm -rf node_modules/ jspm_packages/ build/ public/ typings/; ' +
          'source deactivate 2>/dev/null; ' +
          'conda env remove -n qirest 2>/dev/null'

      # Build the qirest Anaconda environment and install the application.
      buildall:
        command:
          'conda env create -n qirest pip 2>/dev/null; ' +
          'source activate qirest; ' +
          'pip install -r requirements.txt; ' +
          'npm install'
      
      # Kill any existing selenium server and install the drivers.
      installselenium:
        command: 'pkill -f selenium-standalone >/dev/null 2>&1;' +
                 './node_modules/selenium-standalone/bin/selenium-standalone' +
                 '   install --silent'

      # If selenium is not already running, then start it. Suppress all
      # output, since there are no documented options to tailor the
      # selenium log level or log file at the command line. The selenium
      # server is spawned as a background process that survives the grunt
      # session.
      #
      # The pgrep command checks the selenium processes are already running.
      # The server can be killed by the following command:
      #
      #   pkill -f selenium-standalone
      #
      # The sleep command pauses half a second to allow the server to start.
      # Otherwise, grunt might exit and kill the process aborning.
      #
      # This task is used in preference to grunt-selenium-standalone to
      # suppress extraneous console messages and wait for the server to
      # start.
      startselenium:
        command: 'pgrep -f selenium-standalone >/dev/null 2>&1 || ' +
                 '((./node_modules/selenium-standalone/bin/selenium-standalone' +
                 '  start >/dev/null 2>&1 &) && sleep .5)'

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
  )

  # Load all grunt-* tasks.
  require('load-grunt-tasks')(grunt)

  # Build for development is the default.
  grunt.registerTask 'default', ['build']

  # Compile the app bits concurrently.
  grunt.registerTask 'compile', ['tslint', 'concurrent:compile']

  # Build the application from scratch.
  grunt.registerTask 'copy:dev', ['copy:static', 'copy:cssmap', 'copy:fonts']

  # Build the application from scratch.
  grunt.registerTask 'build:dev', ['copy:dev', 'concat:css', 'compile']

  # Build the application from scratch.
  grunt.registerTask 'doc', ['copy:doc', 'coffee:doc', 'yuidoc']

  # Build the application from scratch.
  grunt.registerTask 'build', ['clean', 'build:dev', 'doc']

  # Build the application release.
  grunt.registerTask 'bundle', ['build:dev', 'ts:app', 'jspm']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['ts:tslint', 'exec:installselenium',
                                     'exec:updatewebdriver', 'build']

  # Reinstall from scratch.
  grunt.registerTask 'reinstall', ['exec:cleanall', 'exec:buildall']

  # Start the server with debug turned on.
  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  # Start the server with debug turned on.
  grunt.registerTask 'start:test', ['express:test', 'watch']

  # Start the server in production mode.
  grunt.registerTask 'start:prod', ['express:prod']

  # Start the server with debug by default.
  grunt.registerTask 'start', ['start:dev']

  # Run the Karma unit tests.
  grunt.registerTask 'test:unit', ['karma:unit']

  # Run the Protractor end-to-end tests.
  grunt.registerTask 'test:e2e', ['exec:startselenium', 'express:test',
                                  'protractor:e2e']

  # Run all tests.
  grunt.registerTask 'test', ['test:unit', 'test:e2e']

  # Build the application as a RequireJS AMD module.
  grunt.registerTask 'release', ['build']
