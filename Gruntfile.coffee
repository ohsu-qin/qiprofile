module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    clean:
      build: ['public/**', 'vendor/**']
      dist: ['public/stylesheets/*', 'public/javascripts/*'
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
        dest: 'vendor/assets/stylesheets'
      fonts:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: ['*bootstrap/dist/fonts/glyphicons*.eot']
        dest: 'vendor/assets/fonts/'
      js:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: [
          'angular/angular.js',
          '*bootstrap/dist/javascripts/bootstrap.js'
        ]
        dest: 'vendor/assets/javascripts/'
      lib:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: ['*bootstrap/lib/**']
        dest: 'vendor/lib/'
      app_assets:
        expand: true
        cwd: 'assets/'
        src: ['media/**', '**/*.js', '**/*.css', '**/*.html']
        dest: 'public/'
      vendor_assets:
        expand: true
        cwd: 'vendor/assets/'
        src: ['**']
        dest: 'public/'

    coffee:
      javascripts:
        expand: true
        flatten: true
        ext: '.js'
        src: ['assets/javascripts/*.coffee']
        dest: 'public/javascripts/'
      routes:
        expand: true
        flatten: true
        ext: '.js'
        src: ['assets/routes/*.coffee']
        dest: 'routes/'

    jade:
      options:
        pretty: true
      files:
        expand: true
        flatten: true
        ext: '.html'
        src: ['assets/partials/*.jade']
        dest: 'public/partials/'

    sass:
      options:
        includePaths: ['include/stylesheets']
      files:
        expand: true
        flatten: true
        ext: '.css'
        src: ['assets/stylesheets/*.scss']
        dest: 'public/stylesheets/'

    min:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['public/javascripts/*.js',
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
      files: ['assets/**']
      tasks: ['coffee', 'jade', 'sass']
  )

  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['build'])

  grunt.registerTask('build', ['copy', 'coffee', 'jade', 'sass'])

  grunt.registerTask('all', ['copy', 'coffee', 'jade', 'sass'])

  grunt.registerTask('release', ['clean:build', 'build', 'min', 'cssmin', 'clean:dist'])
