define ['angular', 'lodash', 'underscore.string', 'moment', 'rest', 'helpers',
        'image', 'resources'],
  (ng, _, _s, moment, REST) ->
    router = ng.module 'qiprofile.router', ['qiprofile.resources',
                                            'qiprofile.helpers',
                                            'qiprofile.image']

    router.factory 'Router', [
      'Subject', 'Session', 'Image', 'ObjectHelper', 'DateHelper',
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
              # Extends the scan sets as follows:
              # * adds the scan set subject reference property
              # * adds the scan set key property
              # * adds each scan set registration's source reference property
              # * 
              extendScanSets = ->
                # Extends the modeling objects in the given modelable as follows:
                # * adds the modeling key property
                # * adds the modeling source reference property
                # * adds the modeling results session reference properties
                #
                # @param modelable the scan set or registration configuration
                # @returns the modeling results
                extendModelable = (modelable) ->
                  extendModeling = (modeling, key) ->
                    modeling.key = key
                    modeling.source = modelable
                    # Add the modeling results session reference.
                    for mdlResult, i in modeling.results
                      mdlResult.session = detail.sessions[i]
                
                  # Extend the modeling objects.
                  if modelable.modeling?
                    for mdlKey, mdl of modelable.modeling
                      extendModeling(mdl, mdlKey)
                
                extendScanSet = (scanSet, scanType) ->
                  # Set the subject reference.
                  scanSet.subject = subject
                  # Set the scan type.
                  scanSet.scanType = scanType
                  # Extend the modeling objects. 
                  extendModelable(scanSet)
                  # Extend the registration configurations
                  for regKey, regCfg of scanSet.registration
                    # Set the registration key.
                    regCfg.key = regKey
                    # Set the registration source.
                    regCfg.source = scanSet
                    # Extend the registration modeling objects.
                    extendModelable(regCfg)
                
                # Extend each scan set.
                for scanType, scanSet of detail.scanSets
                  extendScanSet(scanSet, scanType)
                  
              
              addModeling = ->
                # Returns the subject modeling associative object
                # {
                #   scan: [modeling, ...]
                #   registration: [modeling, ...]
                #   all: scan + registration
                # },
                # where:
                # * The scan set modeling objects are sorted by scan type.
                # * The registration modeling objects are sorted by
                #   the registration configuration key within source
                #   scan type.
                # * all is the concatenation of scan and registration
                #   modeling objects
                #
                # @returns the {scan, registration, all} object
                subjectModeling = (detail) ->
                  # @param scanSets the scan sets
                  # @returns the registration configuration objects
                  collectRegistration = _.partialRight(ObjectHelper.collectValues,
                                                       'registration')

                  # @param modelables the modelable objects
                  # @returns the concatenated modeling objects
                  collectModeling = _.partialRight(ObjectHelper.collectValues,
                                                   'modeling')

                  # The scan sets sorted by key.
                  scanSetsSorted = ObjectHelper.sortValuesByKey(detail.scanSets)
                  # The scan modeling objects.
                  scanModeling = collectModeling(scanSetsSorted)
                  
                  # The registration configurations.
                  regConfigs = collectRegistration(scanSetsSorted)
                  # The registration modeling objects.
                  regModeling = collectModeling(regConfigs)
                  
                  # Return the {scan, registration, all} associative object.
                  scan: scanModeling
                  registration: regModeling
                  all: scanModeling.concat(regModeling)
                
                # Add the subject modeling property.
                Object.defineProperty detail, 'modeling',
                  enumerable: true
                  get: ->
                    subjectModeling(detail)

                # Add the subject registration property.
                Object.defineProperty detail, 'registration',
                  enumerable: true
                  get: ->
                    # @returns an associative object containing the subject
                    #   registration configurations
                    regs = _.map(subject.scanSets, 'registration')
                    _.extend({}, regs...)

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
              # Doctor the scan sets.
              extendScanSets()
              # Doctor the sessions.
              extendSessions()
              # Add the detail modeling property.
              addModeling()
              # Add the isMultiSession property.
              Object.defineProperty detail, 'isMultiSession',
                enumerable: true
                # @returns whether there is more than one session
                get: ->
                  isMultiSession = detail.sessions.length > 1
              # End of extendDetail.
            
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
          extendScan = (scan, scanType) ->
            # Adds the session, container type and images properties to
            # the given image container.
            #
            # @param container the image container
            # @param key the scan type or registration name
            addImageContainerContent = (container, key) ->
              # The unique container id for caching.
              container.id = "#{ session.detail }.#{ container._cls }.#{ key }"
              # Encapsulate the image files.
              container.images = Image.imagesFor(container)

            # Adds the scan, key, configuration and image content
            # properties to the given registration.
            #
            # @param registration the registration to extend
            # @param scan the source scan
            # @param key the registration key
            extendRegistration = (registration, key, scan) ->
              # Set the source scan reference.
              registration.scan = scan
              # Set the key.
              registration.key = key
              # Set the registration configuration.
              registration.configuration = session.subject.registration[key]
              if not registration.configuration?
                throw new ReferenceError "#{ subjectTitle(session) } does not have" +
                                         " a #{ key } registration configuration."
              # Define the session property required by the image factory.
              # Image containers present a uniform interface, which includes
              # a session reference.
              Object.defineProperty registration, 'session',
                get: ->
                  scan.session
              # Add the registration images.
              addImageContainerContent(reg, key)
            
            # Set the session reference.
            scan.session = session
            # Set the scan type property.
            scan.scanType = scanType
            # Add the images.
            addImageContainerContent(scan, scanType)
            # Add registration properties.
            for key, reg of scan.registration
              extendRegistration(reg, key, scan)
            
          if not session.detail?
            throw new ReferenceError "Subject #{ session.subject.number }" +
                                     " Session #{ session.number }" +
                                     " does not reference a detail object"
          
          Session.detail(id: session.detail).$promise.then (detail) =>
            # Copy the fetched detail into the session.
            ObjectHelper.aliasPublicDataProperties(detail, session)
            # Add properties to the scans and their registration.
            for key, scan of detail.scans
              extendScan(scan, key)
            # Resolve to the augmented session object.
            session

        # @param session the session to search
        # @param scanType the scan type, t1 or t2
        # @returna the scan object or a promise which resolves
        #   to the scan object
        # @throws ReferenceError if the session does not have the scan
        getScan: (session, scanType) ->
          scan = session.scans[scanType]
          # If no such scan, then complain.
          if not scan?
            throw new ReferenceError "#{ subjectTitle(session) }" +
                                     " does not have a #{ scanType } scan."
          # Return the scan.
          scan

        # @param scan the scan to search
        # @param key the registration key
        # @returna the registration object or a promise which resolves
        #   to the registration object
        # @throws ReferenceError if the scan does not have the registration
        getRegistration: (scan, key) ->
          reg = scan.registration[key]
          # If no such registration, then complain.
          if not reg?
            throw new ReferenceError "#{ subjectTitle(session) }" +
                                     " #{ scan.scanType } scan does not have" +
                                     " a #{ key } registration."
          # Return the registration.
          reg

        # @param container the image parent container object
        # @param timePoint the one-based series time point
        # @returns the image object, if its data is loaded,
        #   otherwise a promise which resolves to the image object
        #   when the image content is loaded
        # @throws ReferenceError if the parent container does not have
        #   the image
        getImageDetail: (container, timePoint) ->
          # timePoint is one-based.
          image = container.images[timePoint - 1]
          if not image?
            throw new ReferenceError "Subject #{ subject.number }" + 
                                     " Session #{ session.number }" +
                                     " does not have an image at" +
                                     " #{ container.title } time point" +
                                     " #{ timePoint }"
          # If the image has data, then return the image.
          # Otherwise, return a promise to load the image.
          if image.data?
            image
          else
            image.load().then ->
              image
    ]
