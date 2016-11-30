`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

`import ObjectHelper from "../object/object-helper.coffee"`

###*
 * @method associate
 * @protected
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
      throw new ReferenceError('The modeling object does not reference' +
                               ' a source')
    pairs = _.toPairs(modeling.source)
    if pairs.length > 1
      throw new ReferenceError('The modeling source references more' +
                               ' than one source type:' +
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

###*
 * @method flattenBySource
 * @protected
 * @param protocolId protocol database id
 * @param srcAssoc {Object} the `[[{source type: {source id: results}}`
 *   object
 * @return {Object[]} the `[[{protocol, source, results}, ...], ...]`
 *   array
###
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

###*
 * The modeling LabelMap REST data object extension utility.
 *
 * @module session
 * @class LabelMap
 * @static
###
LabelMap =
  ###*
   * Adds the following modeling label map properties:
   * * parameterResult - the parent parameter result object
   * * key - the parent parameterResult key
   *
   * @method extend
   * @protected
   * @param labelMap the object to extend
   * @param paramResult the parent parameter result
  ###
  extend: (labelMap, paramResult) ->
    return labelMap unless labelMap?
    # Set the parent reference.
    labelMap.parameterResult = paramResult
    # Define the virtual properties.
    Object.defineProperties labelMap,
      key:
        get: ->
          @parameterResult.key

###*
 * The modeling ParameterResult REST data object extension utility.
 *
 * @module session
 * @class ParameterResult
 * @static
###
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
   * @protected
   * @param paramResult the object to extend
   * @param modelingResult the parent modeling result object
   * @param key the parameter result access property name
  ###
  extend: (paramResult, modelingResult, key) ->
    return paramResult unless paramResult?
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

###*
 * The ModelingResult REST data object extension utility.
 *
 * @module session
 * @class ModelingResult
 * @static
###
ModelingResult =
  ###*
   * Adds the modeling result parent modeling object
   * reference property and extends the parameter result
   * objects as described in extendParameterResult.
   *
   * @method extend
   * @protected
   * @param modelingResult the modeling result object to extend
   * @param modeling the parent modeling object
  ###
  extend: (modelingResult, modeling) ->
    return modelingResult unless modelingResult?
    # Set the modeling result parent reference.
    modelingResult.modeling = modeling

    # Extend each modeling parameter result object.
    for key, paramResult of modelingResult
      ParameterResult.extend(paramResult, modelingResult, key)

###*
 * The Modeling REST data object extension utility.
 *
 * @module session
 * @class Modeling
 * @static
###
Modeling =
  ###*
   * Extends the modeling results as described in
   * {{#crossLink "ModelingResult/extend"}}{{/crossLink}}
   * and adds the following modeling object properties:
   * * session - the parent session object reference
   * * overlays - the modeling result overlays
   * * intensities - the modeling result {param: intensity}
   *   object
   * * title - the parent session title followed by the
   *   modeling resource name
   *
   * @method extend
   * @param modeling the modeling object to extend
   * @param session the parent session object
  ###
  extend: (modeling, session) ->
    return modeling unless modeling?
    # Set the modeling parent session reference.
    modeling.session = session
    # Extend the modeling result object.
    ModelingResult.extend(modeling.result, modeling)
    # Add the virtual properties.
    Object.defineProperties modeling,
      ###*
       * @method intensities
       * @return the modeling result parameter {name: intensity}
       *   object
      ###
      intensities:
        get: ->
          _.mapValues(@result, 'image.metadata.averageIntensity')
    
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

`export { Modeling as default }`
