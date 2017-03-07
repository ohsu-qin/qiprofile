path = require 'path'

module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')

    clean:
      derived: ['public', 'build', 'typings']
      options:
        force: true

    ts:
      options:
        module: 'CommonJS'
        target: 'ES6'
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
        src: 'tslint/src/rules/*.ts'
        dest: 'tslint/dist/rules'

    tslint:
      options:
        force: true
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
      default:
        src: ['stylesheets/app.styl']
        dest: 'public/stylesheets/app.css'

    copy:
      static:
        expand: true
        cwd: 'static/'
        src: '**/*'
        dest: 'public/'

      fonts:
        cwd: 'node_modules'
        expand: true
        flatten: true
        src: ['font-awesome/fonts/*']
        dest: 'public/fonts/'

      # This task is only used to copy the Bootstrap map file.
      # Since the unminimized Bootstrap module references the
      # CSS map, the map must be colocated with the stylesheets.
      cssmap:
        src: 'node_modules/bootstrap/dist/css/bootstrap.css.map'
        dest: 'public/stylesheets/'

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
          'lib/papaya.css'
          'jspm_packages/npm/nouislider*/distribute/nouislider.min.css'
          'node_modules/bootstrap/dist/css/bootstrap.css'
          'node_modules/font-awesome/css/font-awesome.css'
        ]
        dest: 'public/stylesheets/vendor.css'

    curl:
      icons:
        src: 'http://glyphicons.com/files/glyphicons_free.zip'
        dest: 'build/glyphicons.zip'

    unzip:
      icons:
        router: (filepath) ->
          # Filter for glyphicons-nnn and get rid of the numeric
          # qualifier in the file name. Files which don't match
          # this pattern are excluded.
          base = path.basename(filepath)
          match = base.match(/^glyphicon(s-\d+).*\.png/)
          if match
            # glyphicons-nnn- becomes glyphicon-.
            base.replace(match[1], '')
        src: 'build/glyphicons.zip'
        dest: 'public/media'

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
        configFile: 'karma-conf.coffee'

    exec:
      # Clean all installation artifacts, including the qirest Anaconda
      # environment.
      cleannpm:
        command:
          'rm -rf node_modules/ jspm_packages/'

      # Build the qirest Anaconda environment and install the application.
      buildqirest:
        command:
          # Note: conda env remove hangs when executed from a script.
          # There is no known mechanism to make this work.
          # '(yes | conda create -n qirest pip) && ' +
          'source activate qirest && ' +
          'pip install --upgrade -r requirements.txt'

      # Install the npm packages.
      buildnpm:
        command:
          # Note: the first install below fails to completely install
          #   secondary lodash dependencies. The second install remedies
          #   this npm bug.
          # TODO - revisit this with a new npm release in 2017. Try deleting
          #   the second install below, running npm run reinstall and then
          #   grunt start. If grunt fails with a missing babel lodash error,
          #   then raise this issue with the npm dev team.
          'npm install && npm install lodash'

      qirest:
        command:
          'pgrep -f qirest || ' +
          '((qirest >/var/log/qirest.log 2>&1 &) && sleep .5)'

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

      # Links the test data, if available.
      lndata:
        command: 'if [ -n "$QI_DATA" ]; then ' +
                 '  (cd ./public/; ' +
                 '   if [ -L data ]; then rm data; fi; ' +
                 '   if [ ! -e data ]; then ' +
                 '     ln -s `cd $QI_DATA; pwd` data; ' +
                 '   fi' +
                 '  ); ' +
                 'fi'

    protractor:
      e2e:
        configFile: 'protractor-conf.coffee'

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
        files: ['*.pug', 'src/**/*.pug']
        tasks: ['pug']
      stylus:
        files: ['stylesheets/**/*.styl']
        tasks: ['stylus']
  )

  # Load all grunt-* tasks.
  require('load-grunt-tasks')(grunt)

  # Build for development is the default.
  grunt.registerTask 'default', ['build']

  # Compile the app bits concurrently.
  grunt.registerTask 'compile', ['tslint', 'concurrent:compile']

  # Build the application from scratch.
  grunt.registerTask 'icons', ['curl:icons', 'unzip:icons']

  # Build the application from scratch.
  grunt.registerTask 'copy:dev', ['copy:static']

  # Build the application server.
  grunt.registerTask 'build:dev', ['icons', 'copy:dev', 'exec:lndata',
                                   'concat:css', 'copy:cssmap',
                                   'compile']

  # Build the application documentation.
  grunt.registerTask 'doc', ['copy:doc', 'coffee:doc', 'yuidoc']

  # Build the application from scratch.
  grunt.registerTask 'build', ['clean', 'build:dev', 'doc']

  # Build the application release.
  grunt.registerTask 'bundle', ['build:dev', 'ts:app', 'jspm']

  # The npm postinstall task.
  grunt.registerTask 'postinstall', ['ts:tslint', 'exec:installselenium',
                                     'exec:updatewebdriver', 'build']

  # Reinstall from scratch.
  grunt.registerTask 'cleanall', ['clean', 'exec:cleannpm']

  # Reinstall from scratch.
  grunt.registerTask 'buildall', ['exec:buildqirest', 'exec:buildnpm']

  # Reinstall from scratch.
  grunt.registerTask 'reinstall', ['cleanall', 'buildall']

  # Start the server with debug turned on.
  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  # Start the server with debug turned on.
  grunt.registerTask 'start:test', ['exec:qirest', 'express:test', 'watch']

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
