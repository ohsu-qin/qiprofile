# The REST resources.
#
# The resource *find* function fetches the REST JSON object by
# database id.
#
# The resource *query* function fetches the array of REST JSON
# objects which match the request query parameter properties.
# The query request implicitly accepts an HTML request query
# parameter that includes the selection and/or projection
# criterion. See the rest.coffee REST service for helper
# methods.
#
# The asynchronous $resource call should reference the $promise
# variable.
#
# Examples:
#
#   Subject.find(condition).$promise
#
#   REST = require('rest')
#   cond = REST.where({project: 'QIN', collection: 'Breast'})
#   Subject.query(cond).$promise
#
define ['angular', 'ngresource', 'helpers'], (ng) ->
  rscs = ng.module 'qiprofile.resources', ['ngResource']

  rscs.factory 'ImagingCollection', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/imaging-collection/:id', null,
        query:
          method: 'GET'
          isArray: true
          transformResponse: (data) -> ObjectHelper.fromJson(data)
        find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  rscs.factory 'Subject', [
    '$q', '$resource', 'ObjectHelper',
    ($q, $resource, ObjectHelper) ->
      $resource '/api/subject/:id', null,
        # The *query* function returns an array of selected JSON objects.
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
      $resource '/api/session-detail/:id', null,
        detail:
          method: 'GET'
          url: '/api/session-detail/:id'
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  rscs.factory 'ScanProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/scan-protocol/:id', null,
        find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  rscs.factory 'RegistrationProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/registration-protocol/:id', null,
        find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  rscs.factory 'ModelingProtocol', [
    '$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/modeling-protocol/:id', null,
        find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]
