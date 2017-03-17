(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";
  import DateHelper from "../common/date-helper.coffee";
  import Session from "../session/session.data.coffee";
  import Treatment from "../clinical/treatment.data.coffee";
  import ClinicalEncounter from "../clinical/encounter.data.coffee";
  import Encounter from "./encounter.data.coffee";
  var ModelingResults, Subject, extendEncounters, fixDates;

  fixDates = function(subject) {
    var date, dosage, enc, j, k, l, len, len1, len2, ref1, ref2, ref3, results1, trt;
    if (subject.birthDate != null) {
      date = DateHelper.toMoment(subject.birthDate);
      subject.birthDate = DateHelper.anonymize(date);
    }
    if (subject.diagnosisDate != null) {
      date = DateHelper.toMoment(subject.diagnosisDate);
      subject.diagnosisDate = date;
    }
    ref1 = subject.encounters;
    for (j = 0, len = ref1.length; j < len; j++) {
      enc = ref1[j];
      if (enc.date != null) {
        enc.date = DateHelper.toMoment(enc.date);
      }
    }
    ref2 = subject.treatments;
    results1 = [];
    for (k = 0, len1 = ref2.length; k < len1; k++) {
      trt = ref2[k];
      trt.startDate = DateHelper.toMoment(trt.startDate);
      if (trt.endDate != null) {
        trt.endDate = DateHelper.toMoment(trt.endDate);
      }
      ref3 = trt.dosages;
      for (l = 0, len2 = ref3.length; l < len2; l++) {
        dosage = ref3[l];
        dosage.startDate = DateHelper.toMoment(trt.startDate);
      }
      results1.push(Treatment.extend(trt, subject));
    }
    return results1;
  };

  extendEncounters = function(subject) {
    var enc, i, j, k, l, len, len1, len2, ref1, ref2, ref3, results1, session;
    ref1 = subject.encounters;
    for (j = 0, len = ref1.length; j < len; j++) {
      enc = ref1[j];
      Encounter.extend(enc, subject);
    }
    ref2 = subject.sessions;
    for (i = k = 0, len1 = ref2.length; k < len1; i = ++k) {
      session = ref2[i];
      Session.extend(session, subject, i + 1);
    }
    ref3 = subject.clinicalEncounters;
    results1 = [];
    for (l = 0, len2 = ref3.length; l < len2; l++) {
      enc = ref3[l];
      results1.push(ClinicalEncounter.extend(enc, subject));
    }
    return results1;
  };


  /**
   * The Subject modeling results.
   *
   * @module subject
   * @class ModelingResults
   * @static
   */

  ModelingResults = {

    /**
     * Collects the modeling results into a [_modelings_] array,
     * where:
     * * _modelings_ is a {{source, protocol, results}} object,
     * * the`source` value is a {type, protocol} object,
     * * the`protocol` value is the modeling protocol
     * * the`results` value is an array of modeling results
     *   in session number order.
     *
     * @method collect
     * @param subject {Object} the parent subject
     * @return {Object} the
     *   {_sourceType_: {_sourceProtocol_: {_modelingProtocol_: _results_}}}
     *   associative object,
     *   where the results are an array in session number order
     */
    collect: function(subject) {
      var INTENSITY_PROP_PATH, grouped, i, item, j, k, len, len1, modeling, modelingProtocol, path, ref1, ref2, regrouped, rest, rest2, result, results, session, source, sourceProtocol, sourceType;
      INTENSITY_PROP_PATH = 'image.metadata.average_intensity';
      grouped = {};
      ref1 = subject.sessions;
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        session = ref1[i];
        ref2 = session.modelings;
        for (k = 0, len1 = ref2.length; k < len1; k++) {
          modeling = ref2[k];
          source = _.toPairs(modeling.source)[0];
          path = _.flatten([source, modeling.protocol, i]);
          result = _.mapValues(modeling.result, INTENSITY_PROP_PATH);
          _.set(grouped, path, result);
        }
      }
      regrouped = [];
      for (sourceType in grouped) {
        rest = grouped[sourceType];
        for (sourceProtocol in rest) {
          rest2 = rest[sourceProtocol];
          for (modelingProtocol in rest2) {
            results = rest2[modelingProtocol];
            item = {
              source: {
                type: sourceType,
                protocol: sourceProtocol
              },
              protocol: modelingProtocol,
              results: results
            };
            regrouped.push(item);
          }
        }
      }
      return regrouped;
    }
  };


  /**
   * The Subject REST data object extension utility.
   *
   * @module subject
   * @class Subject
   * @static
   */

  Subject = {

    /**
     * Makes the following changes to the given subject object:
     * * add parent references
     * * add the subject modeling property
     * * add the age property
     * * anonymize the birth date by setting it to July 7
     * * convert the session and encounter dates into moments
     * * set the subject isMultiSession method
     *
     * @method extend
     * @param subject the REST Subject object to extend
     * @return the extended Subject
     */
    extend: function(subject) {
      if (subject == null) {
        return subject;
      }
      Object.defineProperties(subject, {

        /**
         * @property title
         * @return the subject display title
         */
        title: {
          get: function() {
            return this.collection + " Patient " + this.number;
          }
        },

        /**
         * Determines this subject's age relative to the preferred
         * reference date, determined as follows:
         * * the diagnosis date, if available
         * * otherwise, the first encounter date, if any
         * * otherwise, today if there are no encounters
         *
         * @method age
         */
        age: {
          get: function() {
            var ref;
            if (this.birthDate) {
              ref = this.diagnosisDate || this._firstEncounterDate || moment();
              return ref.diff(this.birthDate, 'years');
            }
          }
        },
        _firstEncounterDate: {
          get: function() {
            if (this.encounters) {
              return _.minBy(this.encounters, 'date').date;
            }
          }
        },

        /**
         * @property clinicalEncounters
         * @return the clinical encounters
         */
        clinicalEncounters: {
          get: function() {
            var enc, j, len, ref1, results1;
            ref1 = this.encounters;
            results1 = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              enc = ref1[j];
              if (enc.isClinical()) {
                results1.push(enc);
              }
            }
            return results1;
          }
        },

        /**
         * @property sessions
         * @return the session encounters
         */
        sessions: {
          get: function() {
            var enc, j, len, ref1, results1;
            ref1 = this.encounters;
            results1 = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              enc = ref1[j];
              if (enc.isSession()) {
                results1.push(enc);
              }
            }
            return results1;
          }
        },

        /**
         * @property biopsies
         * @return the biopsy encounters
         */
        biopsies: {
          get: function() {
            var enc, j, len, ref1, results1;
            ref1 = this.clinicalEncounters;
            results1 = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              enc = ref1[j];
              if (enc.isBiopsy()) {
                results1.push(enc);
              }
            }
            return results1;
          }
        },

        /**
         * @property biopsy
         * @return the unique biopsy encounter, if there is exactly
         *   one, otherwise null
         */
        biopsy: {
          get: function() {
            var biopsies;
            biopsies = this.biopsies;
            if (biopsies.length === 1) {
              return biopsies[0];
            } else {
              return null;
            }
          }
        },

        /**
         * @property surgeries
         * @return the surgery encounters
         */
        surgeries: {
          get: function() {
            var enc, j, len, ref1, results1;
            ref1 = this.clinicalEncounters;
            results1 = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              enc = ref1[j];
              if (enc.isSurgery()) {
                results1.push(enc);
              }
            }
            return results1;
          }
        },

        /**
         * @property surgery
         * @return the unique surgery encounter, if there is exactly
         *   one, otherwise null
         */
        surgery: {
          get: function() {
            var surgeries;
            surgeries = this.surgeries;
            if (surgeries.length === 1) {
              return surgeries[0];
            } else {
              return null;
            }
          }
        },

        /**
         * The {{#crossLink "ModelingResults"}}{{/crossLink}}
         * array.
         *
         * @property modelings {Object[]}
         */
        modelings: {
          get: function() {
            if (this._modelings == null) {
              this._modelings = ModelingResults.collect(this);
            }
            return this._modelings;
          }
        }
      });
      if (subject.encounters == null) {
        subject.encounters = [];
      }
      if (subject.treatments == null) {
        subject.treatments = [];
      }

      /**
       * @method isMultiSession
       * @return whether this subject has more than one session
       */
      subject.isMultiSession = function() {
        return this.sessions.length > 1;
      };

      /**
       * @method hasPreviews
       * @return whether this subject has at least one scan preview
       */
      subject.hasPreviews = function() {
        var hasPreview;
        hasPreview = function(session) {
          return session.preview != null;
        };
        return _.some(this.sessions, hasPreview);
      };
      fixDates(subject);
      extendEncounters(subject);
      return subject;
    }
  };

  export { Subject as default };

}).call(this);
