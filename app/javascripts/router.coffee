define ['angular', 'lodash', 'underscore.string', 'moment', 'rest', 'helpers',
        'image', 'resources'],
  (ng, _, _s, moment, REST) ->
    router = ng.module 'qiprofile.router', ['qiprofile.resources',
                                            'qiprofile.helpers',
                                            'qiprofile.image']

    router.factory 'Router', ['Subject', 'Session', 'Image', 'ObjectHelper',
      'DateHelper',
      (Subject, Session, Image, ObjectHelper, DateHelper) ->
        # The Subject search fields.
        SUBJECT_SECONDARY_KEY_FIELDS = ['project', 'collection', 'number']

        # @returns a collection/subject/session title string
        subjectTitle = (session) ->
          "#{ session.subject.collection }" +
          " Subject #{ session.subject.number }" +
          " Session #{ session.number }"

        # Fetches the subject detail with the given search
        # condition.
        #
        # @param condition the subject search condition
        # @returns a promise which resolves to the subject
        getSubject: (condition) ->
          # Fetches the subject detail and fixes it up as follows:
          # * anonymizes the birth date by setting it to July 7
          # * adds the age property
          # * converts the session and encounter dates into moments
          # * copies the detail properties into the subject
          # * sets the subject isMultiSession flag
          #
          # If the subject argument contains a detail property ObjectID
          # reference value, then that id is used to fetch the subject
          # detail. Otherwise, getSubject is called on the search object
          # to obtain the detail property value.
          #
          # Note: this function modifies the input subject argument
          # content as described above. 
          #
          # @param subject the subject without detail
          # @returns a promise which resolves to the subject with detail
          getSubjectDetail = (subject) ->
            # Makes the following changes to the given subject detail object:
            # * adds parent references
            # * fixes dates
            # * adds the subject modeling property
            extendDetail = (detail) ->
              addModeling = ->
                # Adds the subject reference to the given scan set or
                # registration configuration modeling container. The modeling
                # objects in the container are also extended with a
                # container reference property.
                #
                # @param modelable the scan set or registration configuration
                # @param key the modelable sort key
                # @returns the modeling results
                extendModelable = (modelable, key) ->
                  extendModeling = (modeling) ->
                    modeling.source = modelable
                    # Add the modeling results session reference.
                    for mdlResult, i in modeling.results
                      mdlResult.session = detail.sessions[i]
                
                  # Set the subject reference.
                  modelable.subject = subject
                  # Set the key.
                  modelable.key = key
                  # Set each modeling object container reference.
                  if modelable.modeling?
                    for mdl in modelable.modeling
                      extendModeling(mdl)

                # @param modelables the modeling parent objects
                # @returns the modeling objects sorted by key
                sortModeling = (modelables) ->
                  # @param array the array to sort
                  # @returns the array items sorted by the key property
                  sortByKey = _.partialRight(_.sortBy, 'key')

                  # The modelables with modeling.
                  modeled = modelables.filter (modelable) ->
                    # Check for both existence and length > 0.
                    modelable.modeling
                  # The modeled modelables sorted by key.
                  modelablesSorted = sortByKey(modeled)
                  # The sorted array of arrays of modeling objects.
                  mdlArrays = (
                    modelable.modeling for modelable in modelablesSorted
                  )
                  # Combine the sorted modeling object arrays.
                  _.reduce(mdlArrays, (a, b) -> a.concat(b))
                
                # Extend the scan sets.
                for scanType, scanSet of detail.scanSets
                  extendModelable(scanSet, scanType)
                
                # Extend the registration configurations.
                for regKey, regCfg of detail.registrationConfigurations
                  extendModelable(regCfg, regKey)
                
                # Add the subject modeling property.
                Object.defineProperty detail, 'modeling',
                  enumerable: true
                  # Returns the subject modeling associative object
                  # {scan: [modeling, ...] registration: [modeling, ...]
                  #  all: scan + registration},
                  # where:
                  # * The scan set modeling objects are sorted by scan type.
                  # * The registration modeling objects are sorted by
                  #   the registration configuration key.
                  # * all is the concatenation of scan and registration
                  #   modeling objects
                  # @returns the {scan, registration, all} object
                  get: ->
                    # Sort the scan modeling objects.
                    scanSets = _.values(detail.scanSets)
                    scanMdlSorted = sortModeling(scanSets)
                    
                    # Sort the registration configurations.
                    regCfgs = _.values(detail.registrationConfigurations)
                    regMdlSorted = sortModeling(regCfgs)
                    
                    # Build the {scan, registration, all} associative
                    # object.
                    sbjMdl = {}
                    if scanMdlSorted
                      sbjMdl.scan = scanMdlSorted
                    if regMdlSorted
                      sbjMdl.registration = regMdlSorted
                    if scanMdlSorted or regMdlSorted
                      sbjMdl.all = scanMdlSorted.concat(regMdlSorted)
                    
                    # Return the {scan, registration, all} associative
                    # object.
                    scan: scanMdlSorted
                    registration: regMdlSorted
                    all: scanMdlSorted.concat(regMdlSorted)

              # Fixes the detail date properties.
              fixDates = ->
                # Fix the birth date.
                if detail.birthDate?
                  date = DateHelper.asMoment(detail.birthDate)
                  # Anonymize the birth date.
                  detail.birthDate = DateHelper.anonymize(date)
                
                # Fix the encounter dates.
                for enc in detail.encounters
                  if enc.date?
                    enc.date = DateHelper.asMoment(enc.date)

                # Fix the treatment dates.
                for trt in detail.treatments
                  trt.beginDate = DateHelper.asMoment(trt.beginDate)
                  trt.endDate = DateHelper.asMoment(trt.endDate)

              # Makes the following changes to the detail session objects:
              # * adds the session subject reference
              # * fixes the session acquisition date
              extendSessions = ->
                for sess in detail.sessions
                  # Set the session subject property.
                  sess.subject = subject
                  # Fix the acquisition date.
                  sess.acquisitionDate = DateHelper.asMoment(sess.acquisitionDate)
                
              # Fix the detail dates.
              fixDates()
              # Doctor the detail sessions.
              extendSessions()
              # Add the detail modeling property.
              addModeling()
              # Add the isMultiSession property.
              Object.defineProperty detail, 'isMultiSession',
                enumerable: true
                # @returns whether there is more than one session
                get: ->
                  isMultiSession = detail.sessions.length > 1
            
            # If the subject does not reference a detail object id,
            # then complain.
            if not subject.detail
              throw new ReferenceError("#{ subject.collection }" +
                                       " Subject #{ subject.number }" +
                                       " does not reference a detail object")

            # Fetch the detail object.
            Subject.detail(id: subject.detail).$promise.then (detail) ->
              # Doctor the detail properties.
              extendDetail(detail)
              
              # Copy the detail content into the subject.
              ObjectHelper.aliasPublicDataProperties(detail, subject)

              # Resolve to the subject.
              subject

          if condition.detail?
            getSubjectDetail(condition)
          else
            cond = REST.where(condition)
            Subject.query(cond).$promise.then (subjects) ->
              if not subjects.length
                throw new ReferenceError("#{ subject.collection }" +
                                         " Subject #{ subject.number }" +
                                         " was not found")
              else if subjects.length > 1
                throw new ReferenceError("Subject query returned more than" +
                                         " one subject: #{ _.pairs(condition) }")
              # The unique subject that matches the query condition.
              subject = subjects[0]
              # Now get the detail.
              getSubjectDetail(subject)

        # Fetches the session detail for the given session object as
        # follows:
        # * If the session object contains a detail property ObjectID
        #   reference value, then the detail is fetched using that
        #   value. 
        # * Otherwise, if the session object references a subject,
        #   then that subject is fetched using getSubject and the
        #   fetched subject session which matches the session
        #   argument contains a detail reference which is used to
        #   fetch the detail. If there is no match, then an error
        #   is thrown.
        # * Otherwise, an error is thrown.
        #
        # The fetched detail properties are copied into the session
        # object.
        #
        # Note: this function modifies the input session argument
        # content as described above. 
        #
        # @param session the parent object
        # @returns a promise which resolves to the session detail
        getSessionDetail: (session) ->
          # Adds the session, container type and images properties to
          # the given image container.
          #
          # @param container the image container
          # @param key the scan type or registration name
          addImageContainerContent = (container, key) ->
            # The unique container id for caching.
            container.id = "#{ session.detail }.#{ container._cls }.#{ key }"
            # The container session property.
            container.session = session
            # Encapsulate the image files.
            container.images = Image.imagesFor(container)

          if not session.detail?
            throw new ReferenceError "Subject #{ session.subject.number }" +
                                     " Session #{ session.number }" +
                                     " does not reference a detail object"
          Session.detail(id: session.detail).$promise.then (detail) =>
            # Copy the fetched detail into the session.
            ObjectHelper.aliasPublicDataProperties(detail, session)
            for key, scan of session.scans
              addImageContainerContent(scan, key)
              for key, reg of scan.registrations
                addImageContainerContent(reg, key)
            # Resolve to the augmented session object.
            session

        # @param session the session to search
        # @param scan_type the scan type, t1 or t2
        # @return the scan object or a promise which resolves
        #   to the scan object
        getScan: (session, scan_type) ->
          # Every session detail has a scan property. When the detail is
          # fetched, the detail properties are copied into the session object.
          # Therefore, the presence of the session scan determines whether
          # the session detail was loaded.
          #
          # @returns whether the session detail is loaded
          isSessionDetailLoaded = ->
            session.scans?

          # If the session detail is loaded, then find the scan or registration
          # container based on the name parameter.
          if isSessionDetailLoaded()
            scan = session.scans[scan_type]
            # If no such scan, then complain.
            if not scan
              throw new ReferenceError "#{ subjectTitle(session) }" +
                                       " does not have a #{ scan_type } scan."
            scan
          else
            # Load the session detail...
            @getSessionDetail(session).then =>
              if not session.scans
                throw new ReferenceError "#{ subjectTitle(session) }" +
                                         " does not have any scans."
              # ...and recurse.
              @getScan(session, scan_type)

        # @param scan the scan to search
        # @param key the registration key
        # @return the registration object or a promise which resolves
        #   to the registration object
        getRegistration: (scan, key) ->
          reg = scan.registrations[key]
          # If no such registrations, then complain.
          if not reg
            throw new ReferenceError "#{ subjectTitle(session) }" +
                                     " #{ scan.scan_type } scan does not have" +
                                     " a #{ key } registration."
          # Set the parent reference.
          reg.scan = scan
          # Return the registration.
          reg

        # @param container the image parent container object
        # @param timePoint the one-based series time point
        # @returns the image object, if its data is loaded,
        #   otherwise a promise which resolves to the image object
        #   when the image content is loaded
        getImageDetail: (container, timePoint) ->
          image = container.images[timePoint - 1]
          if not image
            throw new ReferenceError "Subject #{ subject.number }" + 
                                     " Session #{ session.number }" +
                                     " does not have an image at" +
                                     " #{ container.title } time point" +
                                     " #{ timePoint }"
          if image.data?
            image
          else
            # Load the image.
            image.load().then ->
              image
    ]
