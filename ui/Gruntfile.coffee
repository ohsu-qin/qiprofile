module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    clean:
      build: ['public/*/', 'include/*', 'assets/stylesheets/*', 'assets/javascripts/*']
      dist: ['public/stylesheets/*', 'public/javascripts/*'
             '!public/*/<%= pkg.name %>.min.*']

    copy:
      css:
        expand: true
        flatten: true
        cwd: 'bower_components/'
        src: ['bootstrap/dist/stylesheets/bootstrap.css', 'bootstrap/dist/stylesheets/bootstrap-theme.css']
        dest: 'assets/stylesheets'
      fonts:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: ['bootstrap/dist/fonts/glyphicons*.eot']
        dest: 'assets/fonts/'
      js:
        expand: true
        flatten: true
        cwd: 'bower_components'
        src: ['angular/angular.js', 'bootstrap/dist/javascripts/bootstrap.js']
        dest: 'assets/javascripts/'
      assets:
        expand: true
        cwd: 'assets/'
        src: ['**/*']
        dest: 'public/'

    coffee:
      files:
        expand: true
        flatten: true
        ext: '.js'
        src: ['src/javascripts/*.coffee']
        dest: 'assets/javascripts/'

    jade:
      options:
        pretty: true
      files:
        expand: true
        flatten: true
        ext: '.html'
        src: ['src/partials/*.jade']
        dest: 'public/'

    sass:
      options:
        includePaths: ['include/stylesheets']
      files:
        expand: true
        flatten: true
        ext: '.css'
        src: ['src/stylesheets/*.scss']
        dest: 'public/stylesheets/'

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['assets/stylesheets/*.css']
        dest: 'public/<%= pkg.name %>.min.css'

    jsmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        src: ['assets/javascripts/*.js']
        dest: 'public/<%= pkg.name %>.min.js'

    watch:
      files: ['src/**']
      tasks: ['coffee', 'jade', 'sass']
  )
  
  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['build'])

  grunt.registerTask('build', ['copy', 'coffee', 'jade', 'sass'])

  grunt.registerTask('release', ['clean:build', 'build', 'yuicompressor', 'clean:dist'])
