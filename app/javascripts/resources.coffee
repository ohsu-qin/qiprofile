define ['angular', 'ngresource', 'helpers'], (ng) ->
  rscs = ng.module 'qiprofile.resources', ['ngResource']

  rscs.factory 'Subject', ['$q', '$resource', 'ObjectHelper',
    ($q, $resource, ObjectHelper) ->
      # The Subject resource recognizes a 'get' query method on the
      # subject id, but qiprofile does not call this in practice.
      # Fetching a Subject is done by a query on the subject project,
      # collection and number, which returns a singleton or empty
      # array.
      $resource '/api/subjects/:id', null,
        query:
          method: 'GET'
          isArray: true
          transformResponse: (data) -> ObjectHelper.fromJson(data)
        detail:
          method: 'GET'
          url: '/api/subject-detail/:id/'
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]


  # Since the REST Session objects are embedded in SubjectDetail,
  # this Session factory only operates on the session-detail
  # REST objects. The preferred access method is detail, which
  # is a SessionDetail get. The query and delete methods are not
  # meaningful. Session delete is accomplished by the parent
  # Subject delete, which cascades to its embedded sessions.
  rscs.factory 'Session', ['$resource', 'ObjectHelper',
    ($resource, ObjectHelper) ->
      $resource '/api/session-detail/:id/', null,
        detail:
          method: 'GET'
          url: '/api/session-detail/:id/'
          transformResponse: (data) -> ObjectHelper.fromJson(data)
  ]
