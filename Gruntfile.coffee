module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    clean:
      build: ['_public/*']
    
    copy:
      css:
        # Bootstrap references the CSS map, even though it is not minimized.
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

      js:
        src: [
          'bower_components/lodash/dist/lodash.underscore.js'
          'bower_components/underscore.string/lib/*.js'
          'bower_components/jquery/dist/*.js'
          'bower_components/angular/*.js'
          'bower_components/angular-bootstrap/*-tpls.js'
          'bower_components/angular-resource/*.js'
          'bower_components/angular-route/*.js'
          'bower_components/moment/*.js'
          'bower_components/spin.js/spin.js'
          'bower_components/d3/*.js'
          'bower_components/nvd3/nv.d3.js'
          'bower_components/angularjs-nvd3-directives/dist/*.js'
          '!bower_components/**/*.min.js'
        ]
        dest: '_public/javascripts/vendor.js'
      
      test_js:
        src: [
          'node_modules/chai/chai.js'
          'node_modules/mocha/mocha.js'
          'node_modules/ng-midway-tester/src/ngMidwayTester.js'
        ]
        dest: '_public/javascripts/test.js'
    
    coffee:
      compile:
        files:
          '_public/javascripts/app.js': ['app/**/*.coffee']
      test:
        expand: true
        ext: '.js'
        src: ['test/**/*.coffee']
        dest: '_public'
      
    jade:
      options:
        pretty: true
      compile:
        expand: true
        ext: '.html'
        cwd: 'app/'
        src: ['index.jade', 'partials/**/*.jade', 'templates/**/*.jade', '!**/include/**']
        dest: '_public/'
      test:
        expand: true
        ext: '.html'
        cwd: 'test/jade'
        src: ['**/*.jade']
        dest: '_public/test/'

    karma:
      options:
        singleRun: true
      unit:
        configFile: 'test/conf/karma_unit.conf.coffee'
      midway:
        configFile: 'test/conf/karma_midway.conf.coffee'
      e2e:
        configFile: 'test/conf/karma_e2e.conf.coffee'
      continuous:
        configFile: 'test/conf/karma_continuous.conf.coffee'
        browsers: ['PhantomJS']

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
        paths: ['_public/stylesheets']
        files:
          '_public/stylesheets/app.css': ['app/stylesheets/*.styl']
      
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
        files: ['app/stylesheets/*.styl']
        tasks: ['stylus']
      coffee:
        files: ['app/javascripts/*.coffee', 'test/**/*.coffee']
        tasks: ['coffee']
      jade:
        files: ['app/**/*.jade', 'test/**/*.jade']
        tasks: ['jade']
      markdown:
        files: ['app/partials/**/*.md']
        tasks: ['markdown']

    nodemon:
      dev:
        script: 'server.js'
        options:
          nodeArgs: ['--debug']
          watch: ['app']
    
    concurrent:
      compile:
        tasks: ['coffee:compile', 'jade:compile', 'markdown', 'stylus']
      dev:
        options:
          logConcurrentOutput: true
        tasks: ['nodemon:dev', 'watch']

    ngmin:
      src: ['_public/javascripts/app.js']
      dest: '._public/javascripts/app.ngmin.js'

    min:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['_public/stylesheets/app.ngmin.js']
        dest: '_public/stylesheets/app.min.js'

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['_public/stylesheets/app.css']
        dest: '_public/stylesheets/app.min.css'
  )

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['build'])

  grunt.registerTask('copy:app', ['copy:css', 'copy:fonts', 'copy:static'])

  grunt.registerTask('concat:app', ['concat:css', 'concat:js'])

  grunt.registerTask('vendor:app', ['copy:app', 'concat:app'])

  grunt.registerTask('vendor:test', ['concat:test_js'])

  grunt.registerTask('compile', ['concurrent:compile'])

  grunt.registerTask('build:app', ['vendor:app', 'compile'])

  grunt.registerTask('build:test', ['vendor:test', 'jade:test', 'coffee:test'])

  grunt.registerTask('build', ['clean', 'build:app', 'build:test'])

  grunt.registerTask('start:prod', ['nodemon:prod'])

  grunt.registerTask('start:dev', ['concurrent:dev'])

  grunt.registerTask('start', ['start:dev'])

  grunt.registerTask('test:unit', ['karma:unit'])

  grunt.registerTask('test:midway', ['express:test', 'karma:midway'])

  grunt.registerTask('test:e2e', ['express:test', 'karma:e2e'])

  grunt.registerTask('test', ['express:test', 'karma:unit', 'karma:midway', 'karma:e2e'])

  grunt.registerTask('jsmin', ['ngmin', 'min'])

  grunt.registerTask('release', ['build', 'jsmin', 'cssmin'])
