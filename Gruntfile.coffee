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
          'angular-slider/slider.js'
          'angular-ui-router/release/*.js'
          'angularjs-nvd3-directives/dist/*.js'
          'd3/*.js'
          'lodash/dist/lodash.underscore.js'
          'moment/*.js'
          'nvd3/nv.d3.js'
          'requirejs/require.js'
          'spin.js/spin.js'
          'underscore.string/lib/*.js'
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
          'bower_components/angular-slider/slider.css'
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

    protractor:
      options:
        debug: not not grunt.option('debug')
        keepAlive: not not grunt.option('debug')
        mochaOpts:
          debug: true
          timeout: 4000
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
        compress: false
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

  grunt.registerTask 'default', ['dev']

  grunt.registerTask 'copy:app', ['copy:js', 'copy:css', 'copy:fonts', 'copy:static']

  grunt.registerTask 'concat:app', ['concat:css']

  grunt.registerTask 'vendor:app', ['copy:app', 'concat:app']

  grunt.registerTask 'compile:js', ['coffee:compile', 'preprocess']
  
  grunt.registerTask 'compile', ['concurrent:compile']

  grunt.registerTask 'build:app', ['clean', 'vendor:app', 'compile']

  grunt.registerTask 'dev', ['env:dev', 'build:app']

  grunt.registerTask 'prod', ['env:prod', 'build:app']

  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  grunt.registerTask 'start:test', ['express:test', 'watch']

  grunt.registerTask 'start:prod', ['express:prod', 'watch']

  grunt.registerTask 'start', ['start:dev']

  grunt.registerTask 'test:unit', ['karma:unit']

  grunt.registerTask 'test:e2e', ['express:test', 'protractor:e2e']

  grunt.registerTask 'test', ['express:test', 'test:unit', 'test:e2e']

  grunt.registerTask 'release', ['build', 'requirejs', 'cssmin']
