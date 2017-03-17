(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";
  import ObjectHelper from "../common/object-helper.coffee";

  /**
   * @method associate
   * @protected
   * @param accum the object in which to place the
   *   source type: {source id: result} associations
   * @param session the session object
   * @return the accumulator object
   */
  var LabelMap, Modeling, ModelingResult, ParameterResult, associate, flattenBySource;

  associate = function(accum, session) {
    var collect;
    collect = function(accum, modeling) {
      var assocPcl, assocSrc, pairs, ref, results, srcId, srcType;
      assocPcl = accum[modeling.protocol];
      if (assocPcl == null) {
        assocPcl = accum[modeling.protocol] = {};
      }
      if (modeling.source == null) {
        throw new ReferenceError('The modeling object does not reference' + ' a source');
      }
      pairs = _.toPairs(modeling.source);
      if (pairs.length > 1) {
        throw new ReferenceError('The modeling source references more' + ' than one source type:' + (" " + (Object.keys(modeling.source))));
      }
      ref = pairs[0], srcType = ref[0], srcId = ref[1];
      assocSrc = assocPcl[srcType];
      if (assocSrc == null) {
        assocSrc = assocPcl[srcType] = {};
      }
      results = assocSrc[srcId];
      if (results == null) {
        results = assocSrc[srcId] = [];
      }
      results[session.number - 1] = modeling.result;
      return accum;
    };
    return session.modelings.reduce(collect, accum);
  };


  /**
   * @method flattenBySource
   * @protected
   * @param protocolId protocol database id
   * @param srcAssoc {Object} the `[[{source type: {source id: results}}`
   *   object
   * @return {Object[]} the `[[{protocol, source, results}, ...], ...]`
   *   array
   */

  flattenBySource = function(protocolId, srcAssoc) {
    var create, flattenBySourceId, modelingArrays, sortCriterion, srcType, srcTypes;
    create = function(protocolId, sourceType, sourceId, results) {
      return {
        protocol: protocolId,
        source: ObjectHelper.associate(sourceType, sourceId),
        results: results
      };
    };
    sortCriterion = function(modeling) {
      return modeling.source[srcType];
    };
    flattenBySourceId = function(srcType) {
      var mdl, modelings, ref, results, srcId;
      modelings = [];
      ref = srcAssoc[srcType];
      for (srcId in ref) {
        results = ref[srcId];
        mdl = create(protocolId, srcType, srcId, results);
        modelings.push(mdl);
      }
      return _.sortBy(modelings, sortCriterion);
    };
    srcTypes = ['scan', 'registration'];
    modelingArrays = (function() {
      var i, len, results1;
      results1 = [];
      for (i = 0, len = srcTypes.length; i < len; i++) {
        srcType = srcTypes[i];
        results1.push(flattenBySourceId(srcType));
      }
      return results1;
    })();
    return _.flatten(modelingArrays);
  };


  /**
   * The modeling LabelMap REST data object extension utility.
   *
   * @module session
   * @class LabelMap
   * @static
   */

  LabelMap = {

    /**
     * Adds the following modeling label map properties:
     * * parameterResult - the parent parameter result object
     * * key - the parent parameterResult key
     *
     * @method extend
     * @protected
     * @param labelMap the object to extend
     * @param paramResult the parent parameter result
     */
    extend: function(labelMap, paramResult) {
      if (labelMap == null) {
        return labelMap;
      }
      labelMap.parameterResult = paramResult;
      return Object.defineProperties(labelMap, {
        key: {
          get: function() {
            return this.parameterResult.key;
          }
        }
      });
    }
  };


  /**
   * The modeling ParameterResult REST data object extension utility.
   *
   * @module session
   * @class ParameterResult
   * @static
   */

  ParameterResult = {

    /**
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
     */
    extend: function(paramResult, modelingResult, key) {
      if (paramResult == null) {
        return paramResult;
      }
      paramResult.key = key;
      paramResult.modelingResult = modelingResult;
      if (paramResult.labelMap != null) {
        LabelMap.extend(paramResult.labelMap, paramResult);
        Object.defineProperties(paramResult, {

          /**
           * @method overlay
           * @return the parameter result label map
           */
          overlay: {
            get: function() {
              return this.labelMap;
            }
          },

          /**
           * @method title
           * @return the parameter result title
           */
          title: {
            get: function() {
              return this.modelingResult.modeling.title + " " + this.key;
            }
          }
        });
        return paramResult.labelMap.parameterResult = paramResult;
      }
    }
  };


  /**
   * The ModelingResult REST data object extension utility.
   *
   * @module session
   * @class ModelingResult
   * @static
   */

  ModelingResult = {

    /**
     * Extends the parameter result objects as described
     * in
     * {{#crossLink "ParameterResult/extend"}}{{/crossLink}}.
     *
     * @method extend
     * @protected
     * @param modelingResult the modeling result object to extend
     */
    extend: function(modelingResult) {
      var key, paramResult, results1;
      if (modelingResult == null) {
        return modelingResult;
      }
      results1 = [];
      for (key in modelingResult) {
        paramResult = modelingResult[key];
        results1.push(ParameterResult.extend(paramResult, modelingResult, key));
      }
      return results1;
    }
  };


  /**
   * The Modeling REST data object extension utility.
   *
   * @module session
   * @class Modeling
   * @static
   */

  Modeling = {

    /**
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
     */
    extend: function(modeling, session) {
      if (modeling == null) {
        return modeling;
      }
      modeling.session = session;
      ModelingResult.extend(modeling.result);
      Object.defineProperties(modeling, {

        /**
         * @method intensities
         * @return the modeling result parameter {name: intensity}
         *   object
         */
        intensities: {
          get: function() {
            return _.mapValues(this.result, 'image.metadata.averageIntensity');
          }
        },

        /**
         * @method overlays
         * @return the modeling results which have an overlay,
         *   sorted by modeling parameter name
         */
        overlays: {
          get: function() {
            var overlayed, overlays, res, sorted;
            overlayed = (function() {
              var i, len, ref, results1;
              ref = _.values(this.result);
              results1 = [];
              for (i = 0, len = ref.length; i < len; i++) {
                res = ref[i];
                if (res.overlay != null) {
                  results1.push(res);
                }
              }
              return results1;
            }).call(this);
            sorted = _.sortBy(overlayed, 'key');
            return overlays = _.map(sorted, 'overlay');
          }
        },

        /**
         * @method title
         * @return the modeling title
         */
        title: {
          get: function() {
            return this.session.title + " " + this.resource;
          }
        }
      });
      return modeling;
    }
  };

  export { Modeling as default };

}).call(this);
