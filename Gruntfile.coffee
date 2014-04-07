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
          'bower_components/spin.js/spin.js'
          'bower_components/d3/*.js'
          'bower_components/nvd3/nv.d3.js'
          'bower_components/angularjs-nvd3-directives/dist/*.js'
          '!bower_components/**/*.min.js'
        ]
        dest: '_public/javascripts/vendor.js'
    
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
        src: ['index.jade', 'partials/**/*.jade', 'templates/**/*.jade', '!**/include/**']
        dest: '_public/'
      
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

    watch:
      options:
        livereload: true
      stylus:
        files: ['app/stylesheets/*.styl']
        tasks: ['stylus']
      coffee:
        files: ['app/javascripts/*.coffee']
        tasks: ['coffee']
      jade:
        files: ['app/**/*.jade']
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
      prod:
        script: 'server.js'
    
    concurrent:
      compile:
        tasks: ['coffee', 'jade', 'markdown', 'stylus']
      dev:
        options:
          logConcurrentOutput: true
        tasks: ['nodemon:dev', 'watch']
    
    mochaTest:
      test:
        options:
          require: ['coffee-script/register', './server', 'should']
          reporter: 'spec'
        src: ['app/test/**']

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

  grunt.registerTask('vendor', ['copy', 'concat'])

  grunt.registerTask('compile', ['concurrent:compile'])

  grunt.registerTask('build', ['clean', 'vendor', 'compile'])

  grunt.registerTask('mocha', ['mochaTest'])

  grunt.registerTask('start', ['concurrent:dev'])

  grunt.registerTask('test', ['mocha'])

  grunt.registerTask('jsmin', ['ngmin', 'min'])

  grunt.registerTask('release', ['build', 'jsmin', 'cssmin'])
