`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

`import DateHelper from "../date/date-helper.coffee"`
`import Session from "../session/session.data.coffee"`
`import Modeling from "../session/modeling.data.coffee"`
`import Treatment from "../clinical/treatment.data.coffee"`
`import ClinicalEncounter from "../clinical/encounter.data.coffee"`
`import Encounter from "./encounter.data.coffee"`

# Fixes the subject date properties.
fixDates = (subject)  ->
  # Fix the birth date.
  if subject.birthDate?
    date = DateHelper.toMoment(subject.birthDate)
    # Anonymize the birth date.
    subject.birthDate = DateHelper.anonymize(date)

  # Fix the diagnosis date.
  if subject.diagnosisDate?
    date = DateHelper.toMoment(subject.diagnosisDate)
    subject.diagnosisDate = date

  # Fix the encounter dates.
  for enc in subject.encounters
    if enc.date?
      enc.date = DateHelper.toMoment(enc.date)

  # Fix the treatment dates.
  for trt in subject.treatments
    trt.startDate = DateHelper.toMoment(trt.startDate)
    if trt.endDate?
      trt.endDate = DateHelper.toMoment(trt.endDate)
    for dosage in trt.dosages
      dosage.startDate = DateHelper.toMoment(trt.startDate)
    Treatment.extend(trt, subject)

# Makes the changes to the subject session objects
# described in Session.extend.
extendEncounters = (subject) ->
  # Extend the base encounters.
  for enc in subject.encounters
    Encounter.extend(enc, subject)
  # Further extend each session.
  for session, i in subject.sessions
    Session.extend(session, subject, i+1)
  # Further extend each clinical encounter.
  for enc in subject.clinicalEncounters
    ClinicalEncounter.extend(enc, subject)


###*
 * The Subject modeling results.
 *
 * @module subject
 * @class ModelingResults
 * @static
###
ModelingResults =
  ###*
   * Collects the modeling results into a [_modelings_] array,
   * where _modelings_ is a {{source, protocol, results}},
   * the ``source`` value is a {source type, source protocol}
   * object, ``protocol`` is the modeling protocol, and
   * ``results`` is an array of modeling results in session
   * number order.
   * @method collect
   * @param subject {Object} the parent subject
   * @return {Object} the
   *   {_sourceType_: {_sourceProtocol_: {_modelingProtocol_: _results_}}}
   *   associative object,
   *   where the results are an array in session number order
  ###
  collect: (subject) ->
    # The modeling result intensity value property path.
    intensityPath = 'image.metadata.average_intensity'
    # The grouped modelings.
    grouped = {}
    # Collect each session modeling result.
    for session, i in subject.sessions
      for modeling in session.modelings
        # Convert the modeling source from {_type_: _protocol_}
        # to [_type_, _protocol_].
        source = _.toPairs(modeling.source)[0]
        # The property path to the modeling result is the
        # source followed by the modeling protocol followed
        # by the session index.
        path = _.flatten([source, modeling.protocol, i])
        result = _.mapValues(modeling.result, intensityPath)
        _.set(grouped, path, result)

    # Regroup by the modeling source and protocol.
    regrouped = []
    for sourceType, rest of grouped
      for sourceProtocol, rest2 of rest
        for modelingProtocol, results of rest2
          item =
            source:
              type: sourceType
              protocol: sourceProtocol
            protocol: modelingProtocol
            results: results
          regrouped.push(item)

    # Return the regrouped array.
    regrouped


###*
 * The Subject REST data object extension utility.
 *
 * @module subject
 * @class Subject
 * @static
###
Subject =
  ###*
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
  ###
  extend: (subject) ->
    return subject unless subject?
    # Add the virtual properties.
    Object.defineProperties subject,
      ###*
       * @property title
       * @return the subject display title
      ###
      title:
        get: ->
          # TODO - get the Subject label from a labels.cfg
          # entry:
          #   [Subject]
          #   label=Patient
          # and include the label in the format below.
          # See also the session.data.coffee title TODO.
          "#{ @collection } Patient #{ @number }"

      ###*
       * Determines this subject's age relative to the preferred
       * reference date, determined as follows:
       * * the diagnosis date, if available
       * * otherwise, the first encounter date, if any
       * * otherwise, today if there are no encounters
       *
       * @method age
      ###
      age:
        get: ->
          if @birthDate
            # The reference date.
            ref = @diagnosisDate or @_firstEncounterDate or moment()
            # The year difference from the birth date.
            ref.diff(@birthDate, 'years')

      _firstEncounterDate:
        get: ->
          _.minBy(@encounters, 'date').date if @encounters

      ###*
       * @property clinicalEncounters
       * @return the clinical encounters
      ###
      clinicalEncounters:
        get: ->
          (enc for enc in @encounters when enc.isClinical())

      ###*
       * @property sessions
       * @return the session encounters
      ###
      sessions:
        get: ->
          (enc for enc in @encounters when enc.isSession())

      ###*
       * @property biopsies
       * @return the biopsy encounters
      ###
      biopsies:
        get: ->
          (enc for enc in @clinicalEncounters when enc.isBiopsy())

      ###*
       * @property biopsy
       * @return the unique biopsy encounter, if there is exactly
       *   one, otherwise null
      ###
      biopsy:
        get: ->
          biopsies = @biopsies
          if biopsies.length is 1 then biopsies[0] else null

      ###*
       * @property surgeries
       * @return the surgery encounters
      ###
      surgeries:
        get: ->
          (enc for enc in @clinicalEncounters when enc.isSurgery())

      ###*
       * @property surgery
       * @return the unique surgery encounter, if there is exactly
       *   one, otherwise null
      ###
      surgery:
        get: ->
          surgeries = @surgeries
          if surgeries.length is 1 then surgeries[0] else null

      ###*
       * The {{#crossLink "ModelingResults"}}{{/crossLink}}
       * array.
       *
       * @property modelings {Object[]}
      ###
      modelings:
        get: ->
          # Create on demand.
          if not @_modelings?
            @_modelings = ModelingResults.collect(this)
          @_modelings

    # Add the default empty encounters array, if necessary.
    if not subject.encounters?
      subject.encounters = []
    # Add the default empty treatments arrays, if necessary.
    if not subject.treatments?
      subject.treatments = []

    ###*
     * @method isMultiSession
     * @return whether this subject has more than one session
    ###
    subject.isMultiSession = -> @sessions.length > 1

    ###*
     * @method hasPreviews
     * @return whether this subject has at least one scan preview
    ###
    subject.hasPreviews = ->
      hasPreview = (session) -> session.preview?
      _.some(@sessions, hasPreview)

    # Fix the subject dates.
    fixDates(subject)
    # Doctor the encounters.
    extendEncounters(subject)

    # Return the extended subject.
    subject

`export { Subject as default }`
