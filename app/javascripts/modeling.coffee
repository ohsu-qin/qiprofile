define ['angular', 'lodash', 'resources', 'session'], (ng, _) ->
  modeling = ng.module 'qiprofile.modeling', ['qiprofile.resources']

  modeling.factory 'Modeling', [ 'ObjectHelper', (ObjectHelper) ->
    ###*
     * @method associate
     * @param accum the object in which to place the
     *   source type: {source id: result} associations
     * @param session the session object
     * @return the accumulator object
    ###
    associate = (accum, session) ->
      collect = (accum, modeling) ->
        assocPcl = accum[modeling.protocol]
        if not assocPcl?
          assocPcl = accum[modeling.protocol] = {}
        if not modeling.source?
          throw new ReferenceError("The modeling object does not reference" +
                                   " a source")
        pairs = _.toPairs(modeling.source)
        if pairs.length > 1
          throw new ReferenceError("The modeling source references more" +
                                   " than one source type:" +
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

    # A label map micro-service.
    LabelMap =
      ###*
       * Adds the following modeling label map properties:
       * * parameterResult - the parent parameter result object
       * * key - the parent parameterResult key
       *
       * @method extend
       * @param labelMap the object to extend
       * @param paramResult the parent parameter result
      ###
      extend: (labelMap, paramResult) ->
        # Set the parent reference.
        labelMap.parameterResult = paramResult
        # Define the virtual properties.
        Object.defineProperties labelMap,
          key:
            get: ->
              @parameterResult.key

    # A modeling parameter result micro-service.
    ParameterResult =
      ###*
       * Adds the following modeling parameter result properties:
       * * key - the parameter result access property name
       * * modelingResult - the parent modeling result
       *   reference
       * * overlay - the label map, if it exists and has a
       *   color table
       *
       * In addition, if there is a label map, then this function
       * sets the label map parent modeling parameter reference.
       *
       * @method extend
       * @param paramResult the object to extend
       * @param modelingResult the parent modeling result object
       * @param key the parameter result access property name
      ###
      extend: (paramResult, modelingResult, key) ->
        # The parameter key property identifies the
        # parameter, e.g. ktrans.
        paramResult.key = key
        # Set the parent modeling result reference.
        paramResult.modelingResult = modelingResult
        if paramResult.labelMap?
          # Set the label map parent reference.
          LabelMap.extend(paramResult.labelMap, paramResult)
          # If the label map has a color table, then set
          # the overlay property.
          Object.defineProperties paramResult,
            ###*
             * @method overlay
             * @return the parameter result label map
            ###
            overlay:
              get: ->
                @labelMap

            ###*
             * @method title
             * @return the parameter result title
            ###
            title:
              get: ->
                "#{ @modelingResult.modeling.title } #{ @key }"

          # Set the overlay parent reference.
          paramResult.labelMap.parameterResult = paramResult

    # A modeling result micro-service.
    ModelingResult =
      ###*
       * Adds the modeling result parent modeling object
       * reference property and extends the parameter result
       * objects as described in extendParameterResult.
       *
       * @method extend
       * @param modelingResult the modeling result object to extend
       * @param modeling the parent modeling object
      ###
      extend: (modelingResult, modeling) ->
        # Set the modeling result parent reference.
        modelingResult.modeling = modeling

        # Extend each modeling parameter result object.
        for key, paramResult of modelingResult
          ParameterResult.extend(paramResult, modelingResult, key)

    ###*
     * @method collect
     * @param subject the parent subject
     * @return the modeling [{source, results}] array, where
     *   each source value is a {source type: source id}
     *   object and the results are the modeling results in
     *   session number order.
    ###
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

    ###*
     * Extends the modeling result as described in
     * extendModelingResult and adds the following
     * modeling object properties:
     * * session - the parent session object reference
     * * overlays - the modeling result overlays
     *
     * @method extend
     * @param modeling the modeling object to extend
     * @param session the parent session object
    ###
    extend: (modeling, session) ->
      # Set the modeling parent session reference.
      modeling.session = session
      # Extend the modeling result object.
      ModelingResult.extend(modeling.result, modeling)
      # Add the virtual properties.
      Object.defineProperties modeling,
        ###*
         * @method overlays
         * @return the modeling results which have an overlay,
         *   sorted by modeling parameter name
        ###
        overlays:
          get: ->
            # Filter the modeling results for files with an overlay.
            overlayed = (
              res for res in _.values(@result) when res.overlay?
            )
            # Sort the overlayed results.
            sorted = _.sortBy(overlayed, 'key')
            # Pluck the overlay from the overlayed results.
            overlays = _.map(sorted, 'overlay')

        ###*
         * @method title
         * @return the modeling title
        ###
        title:
          get: ->
            "#{ @session.title } #{ @resource }"

      # Return the extended object.
      modeling

    # The property metadata, as follows:
    # * text - plaintext label
    # * html - HTML label
    # * color - recommended HTML color
    properties:
      fxlKTrans:
        text: 'FXL Ktrans'
        html: 'FXL K<sub>trans</sub>'
        color: 'BurlyWood'
      fxrKTrans:
        text: 'FXR Ktrans'
        html: 'FXR K<sub>trans</sub>'
        color: 'OliveDrab'
      deltaKTrans:
        text: 'Delta Ktrans'
        html: '&Delta;K<sub>trans</sub>'
        color: 'DarkGoldenRod'
      tauI:
        text: 'tau_i'
        html: '&tau;<sub>i</sub>'
        color: 'PaleVioletRed'
      vE:
        text: 'v_e'
        html: 'v<sub>e</sub>'
        color: 'MediumSeaGreen'
  ]
