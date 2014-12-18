define ['angular', 'ngresource', 'helpers'], (ng) ->
  rscs = ng.module 'qiprofile.resources', ['ngResource']

  rscs.factory 'Subject', ['$q', '$resource', 'ObjectHelper',
    ($q, $resource, ObjectHelper) ->
      # The Subject resource recognizes a 'get' query method on the
      # subject id, but qiprofile does not call this in practice.
      # Fetching a Subject is done by a query on the subject project,
      # collection and number, which returns a singleton or empty
      # array.
      #
      # The asynchronous $resource call should reference the $promise
      # variable, e.g.:
      #  Subject.query(id: id).$promise
      # When called from a ui-route state resolve, the promise is
      # automatically resolved to the database JSON result.
      $resource '/api/subjects/:id', null,
        # The query request does not use the id parameter and returns
        # an array of selected MongoDB documents. The request implicitly
        # accepts an HTML request query parameter (not to be confused
        # with the query method defined here) that includes the selection 
        # and/or projection criterion. See the rest.coffee REST service
        # for helper methods.
        #
        # Examples:
        #   Subject.query(project: project).$promise
        #
        #   cond = REST.where({project: project, number: number})
        #   Subject.query(cond).$promise
        #
        # TODO - when the REST detail object is embedded in subject,
        # then:
        # * the caller is responsible for adding the select
        #   criterion for non-detail fields
        # * detail restricts the select to the detail field and
        #   returns the fetched detail object, i.e.:
        #     detail:
        #       method: 'GET'
        #       url: '/api/subject/:id{select=...}'
        #
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
