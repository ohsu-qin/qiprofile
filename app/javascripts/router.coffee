define ['angular', 'lodash', 'underscore.string', 'moment', 'helpers', 'image', 'resources'],
  (ng, _, _s, moment) ->
    router = ng.module 'qiprofile.router', ['qiprofile.resources',
                                            'qiprofile.helpers', 'qiprofile.image']

    router.factory 'Router', ['Subject', 'Session', 'Image', 'ObjectHelper', 'DateHelper',
      (Subject, Session, Image, ObjectHelper, DateHelper) ->
        # The Subject search fields.
        SUBJECT_SECONDARY_KEY_FIELDS = ['project', 'collection', 'number']
        
        # Formats the {where: condition} Eve REST query parameter.
        # Each key in the condition parameters is quoted.
        # The condition value is unquoted for numbers, quoted otherwise.
        # This function is called for every REST request.
        # @param params the input parameters
        # @returns the REST condition query parameter
        where = (params) ->
          # @param key the request key
          # @param value the request value
          # @returns the formatted Eve parameter string
          format_pair = (key, value) ->
            if typeof value is 'number'
               "\"#{ key }\":#{ value }"
            else
               "\"#{ key }\":\"#{ value }\""

          # Quote keys and values.
          paramStrs = (format_pair(pair...) for pair in _.pairs(params))
          cond = paramStrs.join(',')
          # Return the {where: condition} object.
          where: "{#{ cond }}"
        
        # @returns a collection/subject/session title string
        subjectTitle = (session) ->
          "#{ session.subject.collection }" +
          " Subject #{ session.subject.number }" +
          " Session #{ session.number }"

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
        # @param subject the parent subject
        # @returns a promise which resolves to the subject detail
        getSubjectDetail: (subject) ->
          # @returns a promise which resolves to the fetched subject
          fetchSubject = (subject) ->
            # Filter out the null properties.
            search = _.pick(subject, SUBJECT_SECONDARY_KEY_FIELDS)
            Subject.query(where(search)).$promise.then (subjects) ->
              if subjects.length > 1
                throw new ReferenceError "Subject query returned more than" +
                                         " one subject: #{ _.pairs(subject) }"
              subjects[0]
          
          if subject.detail
            Subject.detail(id: subject.detail).$promise.then (detail) ->
              # Add the subject age property, if necessary.
              if detail.birthDate? and
                 not subject.hasOwnProperty('age')
                # Fix the birth date.
                date = DateHelper.asMoment(detail.birthDate)
                # Anonymize the birth date.
                detail.birthDate = DateHelper.anonymize(date)
              
              for sess in detail.sessions
                # Set the session subject property.
                sess.subject = subject
                # Fix the acquisition date.
                sess.acquisitionDate = DateHelper.asMoment(sess.acquisitionDate)
        
                ### FIXME - Only one modeling per session is supported. ###
                # Work-around is to reset modeling to the first modeling
                # array item.  
                # TODO - Support multiple modeling results and remove this
                # work-around.
                if sess.modeling.length > 1
                  throw new Error "Multiple modeling results per session" +
                                  " are not yet supported."
                sess.modeling = sess.modeling[0]
              
              # Fix the encounter dates.
              for enc in detail.encounters
                if enc.date?
                  enc.date = DateHelper.asMoment(enc.date)
              # Fix the treatment dates.
              for trt in detail.treatments
                trt.begin_date = DateHelper.asMoment(trt.begin_date)
                trt.end_date = DateHelper.asMoment(trt.end_date)
              # Copy the detail content into the subject.
              ObjectHelper.aliasPublicDataProperties(detail, subject)
              # Set a flag indicating whether there is more than one
              # session.
              subject.isMultiSession = subject.sessions.length > 1
              # Resolve to the detail.
              detail
          else
            # Fetch the subject.
            fetchSubject(subject).then (fetched) =>
              # If the fetched subject has no detail, then complain.
              if not fetched
                throw new Error "#{ subject.collection } Subject #{ subject.number }" +
                                " was not found"
              if not fetched.detail
                throw new Error "#{ subject.collection } Subject #{ subject.number }" +
                                " does not reference a detail object"
              # Copy the fetched id and detail reference.
              subject._id = fetched._id
              subject.detail = fetched.detail
              # Recurse.
              this.getSubjectDetail(subject)

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
          addImageContainerContent = (container) ->
            # The unique container id for cacheing.
            container.id = "#{ session.detail }.#{ container._cls }#{ container.name }"
            # The container session property.
            container.session = session
            # Encapsulate the image files.
            container.images = Image.imagesFor(container)
  
          if session.detail
            Session.detail(id: session.detail).$promise.then (detail) =>
              # Copy the fetched detail into the session.
              ObjectHelper.aliasPublicDataProperties(detail, session)
              for scan in _.values(session.scans)
                addImageContainerContent(scan, session)
                for reg in scan.registrations
                  addImageContainerContent(reg, session)
              # Resolve to the detail object.
              detail
          else if session.subject
            subject = session.subject
            # Get the subject detail.
            this.getSubjectDetail(subject).then (detail) =>
              # Find the session in the session list.
              fetched = _.find detail.sessions, (other) ->
                other.number == session.number
              # If the session was not found, then complain.
              if not fetched
                throw new ReferenceError "Subject #{ subject.number }" +
                                         " Session #{ session.number }" +
                                         " does not reference a detail object"
              # Copy the fetched id and detail reference.
              session._id = fetched._id
              session.detail = fetched.detail
              # Recurse.
              this.getSessionDetail(session)
          else
            throw new Error "The session detail cannot be fetched," +
                            " since the session search object does" +
                            " not reference a subject."

        # @param session the session to search
        # @param name the scan name
        # @return the scan object or a promise which resolves
        #   to the scan object
        getScan: (session, name) ->
          # Every session detail has a scan property. When the detail
          # is fetched, the detail properties are copied into the session
          # object. Therefore, the presence of the session scan
          # determines whether the session detail was loaded.
          #
          # @returns whether the session detail is loaded
          isSessionDetailLoaded = ->
            session.scans?

          # If the session detail is loaded, then find the scan or
          # registration container based on the name parameter,
          # which is 'scan' or the registration name.
          if isSessionDetailLoaded()
            scan = session.scans[name]
            # If no such scan, then complain.
            if not scan
              throw new ReferenceError "#{ subjectTitle(session) }" +
                                       " does not have a #{ name } scan."
            scan
          else
            # Load the session detail...
            this.getSessionDetail(session).then =>
              if not session.scans
                throw new ReferenceError "#{ subjectTitle(session) }" +
                                         " does not have any scans."
              # ...and recurse.
              this.getScan(session, name)

        # @param scan the scan to search
        # @param name the registration name
        # @return the registration object or a promise which resolves
        #   to the registration object
        getRegistration: (scan, name) ->
          reg = _.find(scan.registrations, (reg) -> reg.name is name)
          # If no such registrations, then complain.
          if not reg
            throw new ReferenceError "#{ subjectTitle(session) }" +
                                     " scan #{ scan.name } does not have" +
                                     " a #{ name } registration."
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
          if image.data
            image
          else
            # Load the image.
            image.load().then ->
              image
    ]
