define ['angular', 'lodash', 'resources'], (ng, _) ->
  imagingCollection = ng.module 'qiprofile.scan', ['qiprofile.resources'] 

  imagingCollection.factory 'ImagingCollection', ['Resources', (Resources) ->
      # Fetches the ImagingCollection REST object which matches
      # the given search condition.
      # @throws ValueError if the template does not have a searchable
      #  key, either the id or the complete secondary key
      # @throws ReferenceError if no such ImagingCollection was found
      find: (condition) ->
        # Fetch the subject REST object.
        findOne(condition).then(extend)
        
      # Fetches the subject REST objects which matches the given search
      # condition. Each subject object is extended as described in
      # find_one.
      #
      # When this function is called from a ui-route state resolve,
      # the promise is automatically resolved to the extended subject
      # REST objects.
      #
      # @param condition the primary or secondary key search
      #   condition
      # @returns a promise which resolves to the (possibly empty)
      #   extended subject REST objects array
      query: (condition) ->
        # Fetch the subjects which match the criteria.
        Resources.Subject.query(condition).then (result) ->
          # Extend the result objects.
          result.map(extend)
  ]
