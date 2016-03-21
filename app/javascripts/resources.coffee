define ['angular', 'lodash', 'rest', 'ngresource', 'helpers'], (ng, _, REST) ->
  # The Resources module.
  resources = ng.module 'qiprofile.resources', ['ngResource', 'qiprofile.helpers']

  # Make the Resources singleton.
  resources.factory 'Resources', ['$resource', 'ObjectHelper', ($resource, ObjectHelper) ->
    # Adds the following properties to the given resource:
    # * secondaryKey - the secondary key field array
    # * find - _find wrapper
    # * query - _query wrapper
    #
    # @param resource the resource object to extend
    # @param secondaryKey the secondary key field array
    # @returns the augmented resource object
    extend = (resource, secondaryKey) ->
      # Set the secondary key property.
      resource.secondaryKey = secondaryKey
      # @param condition the search condition
      # @returns a promise which resolves to the REST database object
      # @throws ValueError if the condition does not have a
      #  searchable key, either the id or the complete
      #  secondary key
      # @throws ReferenceError if no such object was found
      resource.find = (condition) ->
        # The id search criterion is either the id or the _id
        # property.
        id = condition.id or condition._id
        # If the search condition includes the id, then find
        # the unique subject with that id. Otherwise, query
        # the subjects on the secondary key.
        if id?
          # Reference the asynchronous $resource call $promise property.
          resource._find(id: id).$promise
        else if resource.secondaryKey.length == 0
          throw new ReferenceError(
            "The search condition does not contain the id field:" +
            " #{ _.toPairs(condition) }"
          )
        else
          # The secondary key search criteria.
          criterion = _.pick(condition, secondaryKey)
          # The criteria can only be on the primary or secondary
          # key fields. Any other field will show up as an empty
          # criteria _.pick value.
          if not _.every(_.values(criterion))
            throw new ValueError(
              "The search condition is missing both an id" +
              " value and a complete secondary key: #{ condition }"
            )
          # Fetch the REST objects which match the criteria.
          resource.query(criterion).then (result) ->
            if not result.length
              # No match.
              throw new ReferenceError(
                "Object was not found matching: { _.toPairs(condition) }"
              )
            else if result.length > 1
              # Unambiguous match.
              throw new ReferenceError(
                "The query on the secondary key returned more than" +
                " one subject: #{ _.toPairs(condition) }"
              )
            # Resolve to the unique object that matches the query condition.
            result[0]
      
      # @param condition the search condition
      # @param fields the optional fields to return (default all fields)
      # @returns a promise which resolves to the (possibly empty)
      #   result object array
      resource.query = (condition, fields) ->
        # The select clause.
        select = REST.where(condition)
        # Format the HTML query parameter.
        if fields?
          projection = REST.map(['project', 'collection', 'number'])
          param = _.extend(select, projection)
        else
          param = select
        # Reference the asynchronous $resource call $promise property.
        resource._query(param).$promise
      
      # Return the extended resource object.
      resource

    # @param url the REST access URL
    # @param secondaryKey the optional secondary key field
    #   name array
    # @returns the resource service
    create = (url, secondaryKey=[]) ->
      # Make the resource object.
      #
      # The *_find* method fetches the REST JSON object by database id.
      #
      # The *_query* method fetches the array of REST JSON
      # objects which match the request query parameter properties.
      # The query request implicitly accepts an HTML request query
      # parameter that includes the selection and/or projection
      # criterion. See the rest.coffee REST service for helper
      # methods.
      #
      # The resource methods return a bare JSON response which is
      # then converted to an object. The methods are then wrapped
      # by the ResourceMixin convenience methods.
      resource = $resource url, null,
        _find:
          method: 'GET'
          isArray: false
          transformResponse: (data) -> ObjectHelper.fromJson(data)
        _query:
          method: 'GET'
          isArray: true
          transformResponse: (data) -> ObjectHelper.fromJson(data)
      # Wrap the resource methods.
      extend(resource, secondaryKey)
    
    # Since the REST Session objects are embedded in Subject,
    # this Session factory only operates on the session-detail
    # REST objects. The preferred access method is *detail*, which
    # is a SessionDetail *get*. The query and delete methods are not
    # meaningful. Session delete is accomplished by the parent
    # Subject delete, which cascades to its embedded sessions.
    # Thus, the Session wrapper below only as a *detail* method
    # which delegates to sessionDetail.find.
    sessionDetail = create('/api/session-detail/:id')

    ImagingCollection:
      create('/api/imaging-collection/:id')
    Subject:
      create('/api/subject/:id', ['project', 'collection', 'number'])
    ScanProtocol:
      create('/api/scan-protocol/:id')
    RegistrationProtocol:
      create('/api/registration-protocol/:id')
    ModelingProtocol:
      create('/api/modeling-protocol/:id')
    Session:
      detail: sessionDetail.find
  ]
