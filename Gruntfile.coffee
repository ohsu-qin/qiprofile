module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    env:
      dev:
        NODE_ENV: 'development'
      prod:
        NODE_ENV: 'production'
    
    preprocess:
      scripts:
        src: 'app/layout/scripts.jade'
        dest: '_build/layout/scripts.jade'
    
    clean: ['_build', '_public/*']
    
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
        options:
          separator: ';'
        src: [
          'bower_components/lodash/dist/lodash.underscore.js'
          'bower_components/underscore.string/lib/*.js'
          'bower_components/angular-bootstrap/*-tpls.js'
          'bower_components/angular-ui-router/release/*.js'
          'bower_components/dat.gui/dat.gui.js'
          'bower_components/moment/*.js'
          'bower_components/spin.js/spin.js'
          'bower_components/d3/*.js'
          'bower_components/nvd3/nv.d3.js'
          'bower_components/angularjs-nvd3-directives/dist/*.js'
          'bower_components/xtk/xtk_edge.js'
          '!bower_components/**/*.min.js'
        ]
        dest: '_public/javascripts/vendor.js'
      
      # The karma unit test libraries. These are not used for the
      # protractor end-to-end tests. The Google hosted CDN angular
      # libraries loaded in the layout/scripts.jade are included
      # in the package.json dev dependencies and listed below. The
      # angular version in package.json should match the version
      # in layout/scripts.jade.
      test_js:
        options:
          separator: ';'
        src: [
          'node_modules/path/path.js'
          'node_modules/angular/lib/angular.js'
          'node_modules/angular-resource/lib/angular-resource.js'
          'node_modules/angular-mocks/angular-mocks.js'
          'node_modules/chai-as-promised/lib/chai-as-promised.js'
        ]
        dest: '_public/javascripts/test.js'
    
    coffee:
      compile:
        files:
          '_public/javascripts/app.js': ['app/**/*.coffee']

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
      unit:
        configFile: 'test/conf/karma-conf.coffee'

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
        compress: false
      compile:
        paths: ['_public/stylesheets']
        files:
          '_public/stylesheets/app.css': ['app/stylesheets/**/*.styl']
      
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
        tasks: ['coffee']
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
        tasks: ['coffee:compile', 'jade:compile', 'markdown', 'stylus']

    ngAnnotate:
      src: ['_public/javascripts/app.js']
      dest: '_build/javascripts/app.min.js'

    min:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['_build/javascripts/app.min.js']
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

  grunt.registerTask 'default', ['dev']

  grunt.registerTask 'copy:app', ['copy:css', 'copy:fonts', 'copy:static']

  grunt.registerTask 'concat:app', ['concat:css', 'concat:js']

  grunt.registerTask 'vendor:app', ['copy:app', 'concat:app']

  grunt.registerTask 'vendor:test', ['concat:test_js']

  grunt.registerTask 'compile', ['concurrent:compile']

  grunt.registerTask 'build:app', ['clean', 'preprocess:scripts', 'vendor:app', 'compile']

  grunt.registerTask 'build:test', ['vendor:test']

  grunt.registerTask 'build:dev', ['build:app', 'build:test']

  grunt.registerTask 'build:prod', ['build:app']

  grunt.registerTask 'dev', ['env:dev', 'build:dev']

  grunt.registerTask 'prod', ['env:prod', 'build:prod']

  grunt.registerTask 'start:dev', ['express:dev', 'watch']

  grunt.registerTask 'start:test', ['express:test', 'watch']

  grunt.registerTask 'start:prod', ['express:prod', 'watch']

  grunt.registerTask 'start', ['start:dev']

  grunt.registerTask 'test:unit', ['karma:unit']

  grunt.registerTask 'test:e2e', ['express:test', 'protractor:e2e']

  grunt.registerTask 'test', ['express:test', 'test:unit', 'test:e2e']

  grunt.registerTask 'jsmin', ['ngAnnotate', 'min']

  grunt.registerTask 'release', ['build', 'jsmin', 'cssmin']
