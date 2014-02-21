module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    clean:
      build: ['public/**', 'vendor/**']
      dist: ['public/stylesheets/**', 'public/javascripts/**'
             '!public/*/<%= pkg.name %>.min.*']

    copy:
      css:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: [
          'bootstrap/dist/css/bootstrap.css',
          'bootstrap/dist/css/bootstrap-theme.css'
        ]
        dest: 'vendor/stylesheets'
      fonts:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: ['*bootstrap/dist/fonts/glyphicons*.eot']
        dest: 'vendor/fonts/'
      js:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: [
          'angular/angular.js',
          '*bootstrap/dist/javascripts/bootstrap.js'
        ]
        dest: 'vendor/javascripts/'
      lib:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: ['*bootstrap/lib/**']
        dest: 'vendor/lib/'
      app:
        expand: true
        cwd: 'app/'
        src: ['media/**', '**/*.js', '**/*.css', '**/*.html']
        dest: 'public/'
      vendor:
        expand: true
        cwd: 'vendor/'
        src: ['**']
        dest: 'public/'

    coffee:
      javascripts:
        expand: true
        cwd: 'app/'
        ext: '.js'
        src: ['javascripts/**/*.coffee']
        dest: 'public/'

    jade:
      options:
        pretty: true
      files:
        expand: true
        flatten: true
        ext: '.html'
        src: ['app/partials/*.jade']
        dest: 'public/partials/'

    sass:
      options:
        includePaths: ['vendor/lib']
      files:
        expand: true
        flatten: true
        ext: '.css'
        src: ['app/stylesheets/*.scss']
        dest: 'public/stylesheets/'

    min:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['public/javascripts/**/*.js',
              '!public/javascripts/<%= pkg.name %>.min.js']
        dest: 'public/javascripts/<%= pkg.name %>.min.js'

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['public/stylesheets/*.css',
              '!public/stylesheets/<%= pkg.name %>.min.css']
        dest: 'public/stylesheets/<%= pkg.name %>.min.css'

    watch:
      files: ['app/**']
      tasks: ['coffee', 'jade', 'sass']
  )

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['build'])

  grunt.registerTask('build', ['copy', 'coffee', 'jade', 'sass'])

  grunt.registerTask('all', ['copy', 'coffee', 'jade', 'sass'])

  grunt.registerTask('release', ['clean:build', 'build', 'min', 'cssmin', 'clean:dist'])
