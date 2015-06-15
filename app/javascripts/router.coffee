define ['angular', 'lodash', 'underscore.string', 'moment', 'rest',
        'helpers', 'image', 'resources'],
  (ng, _, _s, moment, REST) ->
    router = ng.module 'qiprofile.router', ['qiprofile.resources',
                                            'qiprofile.helpers',
                                            'qiprofile.image']

    router.factory 'Router', [
      'Subject', 'Session', 'Image', 'ObjectHelper', 'DateHelper',
      (Subject, Session, Image, ObjectHelper, DateHelper) ->
        # The Subject search fields.
        SUBJECT_SECONDARY_KEY_FIELDS = ['project', 'collection', 'number']

        # @param session the session object
        # @returns the session subject title string in the format
        #   *collection* Subject *number* Session *number*, e.g.
        #   'Breast Subject 1 Session 2'
        subjectTitle = (session) ->
          "#{ session.subject.collection }" +
          " Subject #{ session.subject.number }" +
          " Session #{ session.number }"

        # Returns a promise which resolves to the subject database JSON
        # object for the given search condition.
        #
        # The subject object is fixed up as follows:
        #
        # * anonymize the birth date by setting it to July 7
        #
        # * add the age property
        #
        # * convert the session and encounter dates into moments
        #
        # * copy the detail properties into the subject
        #
        # * set the subject isMultiSession flag
        #
        # When this function is called from a ui-route state resolve,
        # the promise is automatically resolved to the extended subject
        # object.
        #
        # @param condition the primary or secondary key search
        #   condition
        # @returns a promise which resolves to the subject with detail
        # @throws ValueError if the subject contains a null value
        #   for both the id and the secondary key properties
        getSubject: (condition) ->
          # Makes the following changes to the given subject object:
          # * adds parent references
          # * fixes dates
          # * adds the subject modeling property
          #
          # @param subject the subject object to augment
          extendSubject = (subject) ->
            # Adds the modeling property to the fetched subject.
            addModeling = ->
              # @returns the subject [{source, results}] array, where
              #   each source value is a {source type: source id}
              #   object and the results are the modeling results in
              #   session number order.
              subjectModelings = ->
                # @param session the session object
                # @returns the session {source type: {source id: result}}
                #   object
                associate = (accum, session) ->
                  collect = (accum, modeling) ->
                    assocPcl = accum[modeling.protocol]
                    if not assocPcl?
                      assocPcl = accum[modeling.protocol] = {}
                    pairs = _.pairs(modeling.source)
                    if pairs.length > 1
                      throw ReferenceError("Modeling source cannot reference" +
                                           "more than one source type:" +
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
                
                create = (protocolId, sourceType, sourceId, results) ->
                  protocol: protocolId
                  source: ObjectHelper.associate(sourceType, sourceId)
                  results: results
                
                flattenBySource = (protocolId, srcAssoc) ->
                  flattenBySourceId = (srcType) ->
                    sortCriterion = (modeling) ->
                      modeling.source[srcType]
                    
                    modelings = []
                    # Make the [{protocol, source, results}] array from
                    # the {source type: {source id: results}} object.
                    for srcId, results of srcAssoc[srcType]
                      obj = create(protocolId, srcType, srcId, results)
                      modelings.push(obj)
                    # Return the modeling objects sorted by source id.
                    _.sortBy(modelings, sortCriterion)
                  
                  srcTypes = ['scan', 'registration']
                  modelingArrays = (
                    flattenBySourceId(srcType) for srcType in srcTypes
                  )
                  _.flatten(modelingArrays)
                
                # Make the {protocol id: {source type: {source id: results}}}
                # object.
                assoc = subject.sessions.reduce(associate, {})
                # Flatten into a [[{protocol, source, results}]]
                # array of arrays partitioned by protocol id.
                modelingArrays = (
                  flattenBySource(pclId, srcAssoc) for pclId, srcAssoc of assoc
                )
                # Flatten into a [{protocol, source, results}] array.
                _.flatten(modelingArrays)

              # Add the subject modelings property.
              Object.defineProperty subject, 'modelings',
                enumerable: true
                get: ->
                  subjectModelings()

            # Fixes the subject date properties.
            fixDates = ->
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

            # Makes the changes to the subject session objects
            # described in the extendModeling and extendSession
            # functions below.
            extendSessions = ->
              # Adds the following modeling label map properties:
              # * parameterResult - the parent parameter result object
              # * key - the parent parameterResult key
              #
              # @param labelMap the object to extend
              # @param paramResult the parent parameter result
              extendLabelMap = (labelMap, paramResult) ->
                labelMap.parameterResult = paramResult
                Object.defineProperty labelMap, 'key',
                  get: ->
                    @parameterResult.key
              # Adds the following modeling parameter result properties:
              # * key - the parameter result access property name
              # * modelingResult - the parent modeling result
              #   reference 
              # * overlay - the label map, if it exists and has a
              #   color table
              #  
              # If there is a label map, then this function sets the
              # label map parent modeling parameter reference.
              #
              # @param paramResult the object to extend
              # @param modelingResult the parent modeling result object
              # @param key the parameter result access property name
              extendParameterResult = (paramResult, modelingResult, key) ->
                # The parameter key property identifies the
                # parameter, e.g. ktrans.
                paramResult.key = key
                # Set the parent modeling result reference.
                paramResult.modelingResult = modelingResult
                if paramResult.labelMap?
                  # Set the label map parent reference.
                  paramResult.labelMap.parameterResult = paramResult
                  # If the label map has a color table, then set
                  # the overlay property.
                  if paramResult.labelMap.colorTable?
                    Object.defineProperty paramResult, 'overlay',
                      get: ->
                        @labelMap
              
              # Adds the modeling result parent modeling object
              # reference property and extends the parameter result
              # objects as described in extendParameterResult.
              #
              # @param modelingResult the modeling result object to extend
              # @param modeling the parent modeling object
              extendModelingResult = (modelingResult, modeling) ->
                # Set the modeling result parent reference.
                modelingResult.modeling = modeling
                # Extend each modeling parameter result object.
                for key, paramResult of modelingResult
                  extendParameterResult(paramResult, modelingResult, key)
              
              # Extends the modeling result as described in
              # extendModelingResult and adds the following
              # modeling object properties:
              # * session - the parent session object reference
              # * overlays - the modeling result overlays
              #
              # @param modeling the modeling object to extend
              # @param session the parent session object
              extendModeling = (modeling, session) ->
                # Set the modeling parent session reference.
                modeling.session = session
                # Extend the modeling result object.
                extendModelingResult(modeling.result, modeling)
                # The modeling overlays property returns the label maps
                # which have a color table. The overlays array is sorted
                # in modeling parameter name order.
                Object.defineProperty modeling, 'overlays',
                  get: ->
                    overlayed = (
                      res for res in _.values(@result) when res.overlay?
                    )
                    sorted = _.sortBy(overlayed, 'key')
                    _.pluck(sorted, 'overlay')
                
              # Fixes the session acquisition date and adds the following
              # session properties:
              # * number - the one-based session number in acquisition order
              # * subject - the session parent subject reference
              # * overlays - the {modeling protocol id: [label map objects]}
              #   for those label maps which have a color table
              extendSession = (session, number) ->
                # Set the session subject property.
                session.subject = subject
                # Set the session number property.
                session.number = number
                # Add the modeling properties.
                for modeling in session.modelings
                  extendModeling(modeling, session)
                # The session overlays property.
                Object.defineProperty session, 'overlays',
                  get: ->
                    associate = (accum, modeling) ->
                      accum[modeling.protocol] = modeling.overlays
                    modelings = (mdl for mdl in @modelings when mdl.overlays.length?)
                    if modelings.length?
                      _.reduce(modelings, associate, {})
              
              # Extend each session.
              for session, i in subject.sessions
                extendSession(session, i+1)
            
            # Fucntion which returns whether the given encounter is
            # a session.
            is_session = (encounter) -> encounter._cls == 'Session'
            # Partition the encounters as imaging or clinical.
            [sessions, clnEncs] = _.partition(subject.encounters, is_session)
            # The sessions property.
            subject.sessions = sessions
            # The clinicalEncounters property.
            subject.clinicalEncounters = clnEncs
            # Fix the subject dates.
            fixDates()
            # Doctor the sessions.
            extendSessions()
            # Add the subject modeling property.
            addModeling()
            # The isMultiSession property.
            Object.defineProperties subject,
              # @returns whether there is more than one session
              isMultiSession:
                get: ->
                  this.sessions.length > 1
            
            # End of extendSubject.
          
          # @param condition the subject search condition
          # @returns the subject database object
          # @throws ValueError if the template does not have a
          #  searchable key, either the id or the complete
          #  secondary key
          # @throws ReferenceError if no such subject was found
          findSubject = ->
            # The id search criterion is either the id or the _id
            # property.
            id = condition.id or condition._id
            # If the search condition includes the id, then find
            # the unique subject with that id. Otherwise, query
            # the subjects on the secondary key.
            if id?
              Subject.find(id: id).$promise
            else
              criteria = _.pick(condition, SUBJECT_SECONDARY_KEY_FIELDS)
              if not _.all(_.values(criteria))
                throw new ValueError("The subject search condition is" +
                                     " missing both an id value and a" +
                                     " complete secondary key:" +
                                     " #{ condition }")
              select = REST.where(criteria)
              Subject.query(select).$promise.then (subjects) ->
                if not subjects.length
                  throw new ReferenceError("Subject was not found:" +
                                           " { _.pairs(template) }")
                else if subjects.length > 1
                  throw new ReferenceError("Subject query on the secondary" +
                                           " key returned more than one" +
                                           " subject: #{ _.pairs(template) }")
                # The unique subject that matches the query condition.
                subjects[0]
          
          # Fetch the detail object.
          findSubject().then (subject) ->
            # Doctor the subject properties.
            extendSubject(subject)
            # Resolve to the subject.
            subject

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
          # Adds the following properties to the given volume object:
          # * container - the volume parent scan or registration
          # * image - the volume image object
          #
          # The image property creates and caches an image object
          # on demand when it is first accessed. 
          #
          # @param volume the volume object to extend
          # @param number the one-based volume number
          # @param container the image scan or registration object
          extendVolume = (volume, number, container) ->
            # The parent reference.
            if container._cls is 'Scan'
              volume.scan = container
            else if container._cls is 'Registration'
              volume.registration = container
            else
              throw TypeError("The image container type is not recognized")
            # The container alias.
            Object.defineProperty volume, 'container',
              get: ->
                @scan or @registration
            # Set the volume number property.
            volume.number = number
            # The volume image object is created and cached on demand.
            Object.defineProperty volume, 'image',
              get: ->
                if not @_image?
                  @_image = Image.forVolume(volume)
                @_image
          
          # Extends the container volumes as described in extendVolume
          # and adds the following properties to the given container:
          # * session - the container parent session reference
          #
          # @param container the image scan or registration object
          extendImageContainer = (container) ->
            # Set the session property required by the image factory.
            # Image containers present a uniform interface, which
            # includes a session reference.
            container.session = session
            # Add the volume images.
            for volume, index in container.volumes
              extendVolume(volume, index + 1, container)
          
          # Extends the given registration object as described in
          # extendImageContainer and adds the following properties:
          # * scan - the registration source scan
          #
          # @param registration the registration to extend
          # @param number the one-based registration index within the scan
          # @param scan the source scan
          extendRegistration = (registration, number, scan) ->
            # Set the source scan reference.
            registration.scan = scan
            # Format the title.
            registration.title = "Scan #{ scan.number } Registration" +
                                 " #{ registration.number }"
            # Add the registration volume properties.
            extendImageContainer(registration)

          # * Extends the scan registrations as described in
          #   extendRegistration
          # * Converts the scan number to an integer
          # * Extends the scan object as described in extendImageContainer
          # * Adds the following properties:
          #   * session - the source scan parent session
          #
          # @param scan the scan to extend
          extendScan = (scan) ->
            # The number is read as a string, as with all JSON values.
            # Convert it to an integer.
            scan.number = parseInt(scan.number)
            # The scan title.
            scan.title = "Scan #{ scan.number }"
            # Set the session reference.
            scan.session = session
            # Add the scan volume properties.
            extendImageContainer(scan)
            # Add the scan registration properties.
            for reg, regNbr in scan.registrations
              extendRegistration(reg, regNbr + 1, scan)
          
          # The session object must have a detail reference.
          if not session.detail?
            throw new ReferenceError "Subject #{ session.subject.number }" +
                                     " Session #{ session.number }" +
                                     " does not reference a detail object"
          # Fetch the session detail.
          Session.detail(id: session.detail).$promise.then (detail) ->
            # Copy the fetched detail into the session.
            ObjectHelper.aliasPublicDataProperties(detail, session)
            # Add properties to the scans and their registration.
            for scan in session.scans
              # Add properties.
              extendScan(scan)
            # Resolve to the augmented session object.
            session

        # @param session the session to search
        # @param scan the scan number
        # @returns the scan object
        # @throws ReferenceError if the session does not have the scan
        getScan: (session, scanNumber) ->
          # The matching scan (there is at most one).
          scan = _.find(session.scans,
                        (scan) -> scan.number is scanNumber)
          # If no such scan, then complain.
          if not scan?
            throw new ReferenceError "#{ subjectTitle(session) } does not have" +
                                     " a scan with number #{ scanNumber }"
          # Return the scan.
          scan

        # @param scan the scan to search
        # @param resource the registration resource name
        # @returns the registration object
        # @throws ReferenceError if the scan does not have the registration
        getRegistration: (scan, resource) ->
          # The matching scan (there is at most one).
          reg = _.find(scan.registrations,
                       (reg) -> reg.resource is resource)
          # If no such registration, then complain.
          if not reg?
            throw new ReferenceError "#{ subjectTitle(session) }" +
                                     " Scan #{ scan.number } does not have" +
                                     " a registration with resource" +
                                     " #{ resource }"
          # Return the registration.
          reg

        # @param container the image parent container object
        # @param number the one-based volume number
        # @returns the image object, if its data is loaded,
        #   otherwise a promise which resolves to the image object
        #   after the image content is loaded
        # @throws ReferenceError if the parent container does not have
        #   the image
        getVolume: (container, number) ->
          # The volume number is one-based.
          volume = container.volumes[number - 1]
          if not volume?
            throw new ReferenceError "Subject #{ subject.number }" +
                                     " Session #{ session.number }" +
                                     " #{ container._cls }" +
                                     " Volume #{ number } was not found"
          # Return the volume.
          volume
    ]
