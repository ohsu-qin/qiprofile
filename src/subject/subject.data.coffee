`import * as _ from "lodash"`
`import * as _s from "underscore.string"`

`import DateHelper from "../date/date-helper.coffee"`
`import Session from "../session/session.data.coffee"`
`import Modeling from "../session/modeling.data.coffee"`
`import ClinicalEncounter from "../clinical/encounter.data.coffee"`

isSession = (encounter) -> encounter._cls == 'Session'

isClinical = (encounter) -> not isSession(encounter)

# Fixes the subject date properties.
fixDates = (subject)  ->
  # Fix the birth date.
  if subject.birthDate?
    date = DateHelper.asMoment(subject.birthDate)
    # Anonymize the birth date.
    subject.birthDate = DateHelper.anonymize(date)

  # Fix the encounter dates.
  for enc in subject.encounters
    if enc.date?
      enc.date = DateHelper.asMoment(enc.date)

  # Fix the treatment dates.
  for trt in subject.treatments
    trt.startDate = DateHelper.asMoment(trt.startDate)
    trt.endDate = DateHelper.asMoment(trt.endDate)
    for dosage in trt.dosages
      dosage.startDate = DateHelper.asMoment(trt.startDate)

# Makes the changes to the subject session objects
# described in Session.extend.
extendSessions = (subject)  ->
  # Extend each session.
  for session, i in subject.sessions
    Session.extend(session, subject, i+1)

# Adds the clinical encounter title virtual property.
extendClincalEncounters = (subject) ->
  for enc in subject.clinicalEncounters
    ClinicalEncounter.extend(enc, subject)

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
       * @method title
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
       * @method clinicalEncounters
       * @return the clinical encounters
      ###
      clinicalEncounters:
        get: ->
          (enc for enc in @encounters when isClinical(enc))

      ###*
       * @method sessions
       * @return the session encounters
      ###
      sessions:
        get: ->
          (enc for enc in @encounters when isSession(enc))

      ###*
       * @method modelings
       * @return the modelings array
      ###
      modelings:
        get: ->
          # Create on demand.
          if not @_modelings?
            @_modelings = Modeling.collect(this)
          @_modelings

    # Add the default empty encounters array, if necessary.
    if not subject.encounters?
      subject.encounters = []
    # Add the default empty treatments arrays, if necessary.
    if not subject.treatments?
      subject.treatments = []

    # Add the isMultiSession method.
    subject.isMultiSession = -> @sessions.length > 1

    # Fix the subject dates.
    fixDates(subject)
    # Doctor the encounters.
    extendSessions(subject)
    extendClincalEncounters(subject)

    # Return the extended subject.
    subject

`export { Subject as default }`

