define ['angular', 'lodash', 'resources', 'session'], (ng, _) ->
  modeling = ng.module 'qiprofile.modeling', ['qiprofile.resources']

  modeling.factory 'Modeling', [ 'ObjectHelper', (ObjectHelper) ->
    # @param accum the object in which to place the
    #   source type: {source id: result} associations
    # @param session the session object
    # @returns the accumulator object
    associate = (accum, session) ->
      collect = (accum, modeling) ->
        assocPcl = accum[modeling.protocol]
        if not assocPcl?
          assocPcl = accum[modeling.protocol] = {}
        if not modeling.source?
          throw new ReferenceError("Modeling does not have a source" +
                                   " attribute:" +
                                   " #{ Object.keys(modeling) }")
        pairs = _.toPairs(modeling.source)
        if pairs.length > 1
          throw new ReferenceError("Modeling source cannot reference" +
                                   " more than one source type:" +
                                   " #{ Object.keys(modeling.source) }")
        [srcType, srcId] = pairs[0]
        assocSrc = assocPcl[srcType]
        if not assocSrc?
          assocSrc = assocPcl[srcType] = {}
        results = assocSrc[srcId]
        if not results?
          results = assocSrc[srcId] = []
        results[session.number - 1] = modeling.result
        accum

      session.modelings.reduce(collect, accum)

    flattenBySource = (protocolId, srcAssoc) ->
      create = (protocolId, sourceType, sourceId, results) ->
        protocol: protocolId
        source: ObjectHelper.associate(sourceType, sourceId)
        results: results

      sortCriterion = (modeling) ->
        modeling.source[srcType]

      flattenBySourceId = (srcType) ->
        modelings = []
        # Make the [{protocol, source, results}] array from
        # the {source type: {source id: results}} object.
        for srcId, results of srcAssoc[srcType]
          mdl = create(protocolId, srcType, srcId, results)
          modelings.push(mdl)
        # Return the modeling objects sorted by source id.
        _.sortBy(modelings, sortCriterion)

      srcTypes = ['scan', 'registration']
      modelingArrays = (
        flattenBySourceId(srcType) for srcType in srcTypes
      )
      # Return the [[{protocol, source, results}, ...], ...] array.
      _.flatten(modelingArrays)

    # @param subject the parent subject
    # @returns the modeling [{source, results}] array, where
    #   each source value is a {source type: source id}
    #   object and the results are the modeling results in
    #   session number order.
    collect: (subject) ->
      # Make the {protocol id: {source type: {source id: results}}}
      # object.
      assoc = subject.sessions.reduce(associate, {})
      # Flatten into a [[{protocol, source, results}, ...], ...]
      # array of arrays partitioned by protocol id.
      modelingArrays = (
        flattenBySource(pclId, srcAssoc) for pclId, srcAssoc of assoc
      )
      # Flatten into a [{protocol, source, results}, ...] array.
      _.flatten(modelingArrays)
  ]
