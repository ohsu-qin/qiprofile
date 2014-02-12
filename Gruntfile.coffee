module.exports = (grunt) ->
  grunt.config.init(
    pkg: grunt.file.readJSON('package.json')
    
    clean:
      build: ['<%= pkg.name %>/assets/*.css', '<%= pkg.name %>/assets/*.js']
      dist: ['<%= pkg.name %>/assets/*.css', '<%= pkg.name %>/assets/*.js',
             '!<%= pkg.name %>/assets/<%= pkg.name %>.min.*']

    copy:
      bower:
        cwd: 'bower_components/'
        src: ['angular/angular.js', 'bootstrap-sass/**/bootstrap.*',
              'bootstrap-sass/**/glyphicons*.*']
        dest: '<%= pkg.name %>/assets/'

    coffee:
      files:
        expand: true
        flatten: true
        ext: '.js'
        src: ['<%= pkg.name %>/src/js/*.coffee']
        dest: '<%= pkg.name %>/assets/'

    sass:
      files:
        expand: true
        flatten: true
        ext: '.css'
        src: ['<%= pkg.name %>/src/css/**/*.scss']
        dest: '<%= pkg.name %>/assets/'

    cssmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        cwd: '<%= pkg.name %>/assets/'
        src: '!(<%= pkg.name %>).css'
        dest: '<%= pkg.name %>.min.css'
  
    jsmin:
      options:
        'nomunge': true
        'line-break': 80
      files:
        cwd: '<%= pkg.name %>/assets/'
        src: '!(<%= pkg.name %>).js'
        dest: '<%= pkg.name %>.min.js'

    watch:
      files: ['<%= pkg.name %>/src/**/*']
      tasks: ['coffee', 'sass']
  )
  
  require('load-grunt-tasks')(grunt)

  grunt.registerTask('default', ['copy:bower', 'coffee', 'sass'])

  grunt.registerTask('release', ['clean:build', 'default', 'yuicompressor', 'clean:dist'])
