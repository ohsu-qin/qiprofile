define ['angular', 'lodash', 'underscore.string', 'resources', 'session', 'modeling', 'clinical'], (ng, _, _s) ->
  subject = ng.module(
    'qiprofile.subject',
    ['qiprofile.resources', 'qiprofile.session', 'qiprofile.modeling', 'qiprofile.clinical']
  )

  subject.factory 'Subject', [
    'Resources', 'Session', 'Modeling', 'Clinical', 'DateHelper',
    (Resources, Session, Modeling, Clinical, DateHelper) ->
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
          Clinical.extend(enc)

      ###*
       * Makes the following changes to the given subject object:
       * * adds parent references
       * * fixes dates
       * * adds the subject modeling property
       *
       * @method extend
       * @param subject the REST Subject object to extend
       * @return the extended Subject
      ###
      extend = (subject) ->
        # Add the virtual properties.
        Object.defineProperties subject,
          ###*
           * @method title
           * @return the subject display title
          ###
          title:
            get: ->
              # TODO - get the Subject display text from a config,
              #   e.g.:
              #     label = config.subject.label
              #     "#{ @collection } #{ label } #{ @number }"
              #   See also the subject.coffee title TODO.
              "#{ @collection } Patient #{ @number }"

          ###*
           * Returns the /project/collection/subject path, where:
           * * *project* is the lower-case project name
           * * *collection* is the lower-case collection name
           * * *subject* is the subject number
           *
           * @method path
           * @return the session path
          ###
          path:
            get: ->
              "#{ @project.toLowerCase() }/#{ @collection.toLowerCase() }/#{ @number }"

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

        # Add the isMultiSession method.
        subject.isMultiSession = -> @sessions.length > 1

        # Fix the subject dates.
        fixDates(subject)
        # Doctor the encounters.
        extendSessions(subject)
        extendClincalEncounters(subject)

        # Return the extended subject.
        subject

      ###*
       * Fetches a subject REST object which matches the given search
       * condition.
       *
       * The subject object is extended as follows:
       * * anonymize the birth date by setting it to July 7
       * * add the age property
       * * convert the session and encounter dates into moments
       * * set the subject isMultiSession method
       *
       * When this function is called from a ui-route state resolve,
       * the promise is automatically resolved to the extended subject
       * REST object.
       *
       * @method find
       * @param condition the primary or secondary key search
       *   condition
       * @return a promise which resolves to the extended subject
       *   REST object
       * @throws ValueError if the template does not have a searchable
       *  key, either the id or the complete secondary key
       * @throws ReferenceError if no such subject was found
      ###
      find: (condition) ->
        # Fetch the subject REST object.
        Resources.Subject.find(condition).then(extend)

      ###*
       * Fetches the subject REST objects which matches the given search
       * condition. Each subject object is extended as described in
       * find_one.
       *
       * When this function is called from a ui-route state resolve,
       * the promise is automatically resolved to the extended subject
       * REST objects.
       *
       * @method query
       * @param condition the primary or secondary key search
       *   condition
       * @return a promise which resolves to the (possibly empty)
       *   extended subject REST objects array
      ###
      query: (condition) ->
        # Fetch the subjects which match the criteria.
        Resources.Subject.query(condition).then (result) ->
          # Extend the result objects.
          result.map(extend)

      ###*
       * @method hyperlink
       * @param session the session object
       * @return the href to the session detail page
      ###
      hyperlink: (subject) ->
        sbjRefUrl = "/quip/#{ subject.collection }/subject/#{ subject.number }"
        "#{ sbjRefUrl }?project=#{ subject.project }"
  ]

