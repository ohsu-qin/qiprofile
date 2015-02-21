define ['angular', 'ngresource', 'helpers'], (ng) ->
  rscs = ng.module 'qiprofile.resources', ['ngResource']

  rscs.factory 'Subject', [
    '$q', '$resource', 'ObjectHelper',
    ($q, $resource, ObjectHelper) ->
      # The Subject resource has two functions:
      # * *query*: fetch the REST Subject JSON objects which match
      #   the request query parameter properties
      # * *detail*: fetch the single REST Subject JSON object
      #   which matches the request *id* property
      #
      # The asynchronous $resource call should reference the $promise
      # variable, e.g.:
      #
      #  Subject.find(condition).$promise
      $resource '/api/subject/:id', null,
        # The *query* function returns an array of selected JSON objects.
        # The query request implicitly accepts an HTML request query
        # parameter (not to be confused with the query method defined here)
        # that includes the selection and/or projection criterion. 
        # See the rest.coffee REST service for helper methods.
        #
        # Examples:
        #   Subject.query(project: project).$promise
        #
        #   REST = require('rest')
        #   cond = REST.where({project: 'QIN', collection: 'Breast'})
        #   Subject.query(cond).$promise
        query:
          method: 'GET'
          isArray: true
          transformResponse: (data) -> ObjectHelper.fromJson(data)
        find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  # Since the REST Session objects are embedded in Subject,
  # this Session factory only operates on the session-detail
  # REST objects. The preferred access method is detail, which
  # is a SessionDetail get. The query and delete methods are not
  # meaningful. Session delete is accomplished by the parent
  # Subject delete, which cascades to its embedded sessions.
  rscs.factory 'Session', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/session-detail/:id/', null,
        detail:
          method: 'GET'
          url: '/api/session-detail/:id/'
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  rscs.factory 'ScanProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/scan-protocol/:id/'
  ]


  rscs.factory 'RegistrationProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/registration-protocol/:id/'
  ]


  rscs.factory 'ModelingProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/modeling-protocol/:id/'
  ]
