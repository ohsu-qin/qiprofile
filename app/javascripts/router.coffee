define ['angular', 'lodash', 'underscore.string', 'helpers', 'image', 'resources'],
  (ng, _, _s) ->
    router = ng.module 'qiprofile.router', ['qiprofile.resources',
                                            'qiprofile.helpers', 'qiprofile.image']

    router.factory 'Router', ['$q', 'Subject', 'Session', 'Image', 'Helpers',
      ($q, Subject, Session, Image, Helpers) ->
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

        # Makes a subject from the given search parameters. This method
        # returns a promise which resolves to a subject object as follows:
        # * If the search parameters contain a fetch flag which is truthy,
        #   then the resolved value is the Subject resource object fetched
        #   with the search parameters.
        # * Otherwise, the return promise resolves to a new object with
        #   the project, collection and subject number copied from the 
        #   search parameters.
        #
        # @param params the search parameters
        # @returns a promise which resolves to the Subject resource
        #   object
        getSubject: (params) ->
          # The subject is built from the search parameters.
          subject =
            project: params.project
            collection: _s.capitalize(params.collection)
            number: params.number
          # If the fetch flag is set, then query the Subject resource
          # with the subject as the query condition.
          if params.fetch
            Subject.query(where(subject)).$promise.then (subjects) ->
              if subjects.length > 1
                throw "Subject query returned more than one subject:" +
                      " #{ _.pairs(subject) }"
              subjects[0]
          else
            # Make a promise which immediately resolves to the subject.
            deferred = $q.defer()
            deferred.resolve(subject)
            deferred.promise

        # Fetches the subject detail and fixes it up as follows:
        # * converts the session and encounter dates into moments
        # * copies the detail properties into the subject
        # * sets the subject isMultiSession flag
        #
        # If the search object contains a detail property ObjectID
        # reference value, then that id is used to fetch the subject
        # detail. Otherwise, getSubject is called on the search object
        # to obtain the detail property value.
        #
        # Note: this function modifies the input subject argument
        # content as described above. 
        #
        # @param subject the parent subject
        # @param params the request query parameters
        # @returns a promise which resolves to the subject detail
        getSubjectDetail: (subject, params) ->
          if subject.detail
            Subject.detail(id: subject.detail).$promise.then (detail) ->
              for sess in detail.sessions
                # Set the session subject property.
                sess.subject = subject
                # Fix the acquisition date.
                Helpers.fixDate(sess, 'acquisition_date')
                # Calculate the delta Ktrans property.
                for mdl in sess.modeling
                  delta_k_trans = mdl.fxr_k_trans - mdl.fxl_k_trans
                  _.extend mdl, delta_k_trans: delta_k_trans
        
                ### FIXME - Only one modeling per session is supported. ###
                # Work-around is to reset modeling to the first modeling
                # array item.  
                # TODO - Support multiple modeling results and remove this
                # work-around.
                if sess.modeling.length > 1
                  throw "Multiple modeling results per session are not yet" +
                        " supported."
                sess.modeling = sess.modeling[0]
      
              # Fix the encounter dates.
              Helpers.fixDate(enc, 'date') for enc in detail.encounters
              # Copy the detail content into the subject.
              Helpers.copyDetail(detail, subject)
              # Set a flag indicating whether there is more than one
              # session.
              subject.isMultiSession = subject.sessions.length > 1
              # Resolve to the detail.
              detail
          else if params.detail
            # Set the subject detail property.
            subject.detail = params.detail
            # Recurse.
            this.getSubjectDetail(subject, params)
          else
            # The subject search condition includes the fetch flag.
            search = _.extend({fetch: true}, subject)
            # Fetch the subject.
            this.getSubject(search).then (fetched) =>
              # If the fetched subject has no detail, then complain.
              if not fetched.detail
                throw "Subject #{ subject.number } does not reference a" +
                      " detail object"
              subject.detail = fetched.detail
              # Recurse.
              this.getSubjectDetail(subject, params)

        # Fetches the session detail for the given session object as
        # follows:
        # * If the session object contains a detail property ObjectID
        #   reference value, then the detail is fetched using that
        #   value. 
        # * Otherwise, if the request query parameters contain a
        #   detail property value, then the detail is fetched using 
        #   that value.
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
        # @param params the request query parameters
        # @returns a promise which resolves to the session detail
        getSessionDetail: (session, params) ->
          # Adds the session, container type and images properties to
          # the given parent image container.
          #
          # @param parent the image container
          # @param session the session holding the image container
          addImageContainerContent = (parent, session, container_type) ->
            # @param parent the image container
            # @returns the display title
            titleFor = (parent) ->
              if container_type == 'scan'
                'Scan'
              else if container_type == 'registration'
                if session.registrations.length == 1
                  'Realigned'
                else
                  'Registration' + parent.name.replace('reg_', '')
              else
                throw "Unrecognized image container type: #{ container_type }"
    
            # The unique container id for cacheing.
            parent.id = "#{ session.detail }.#{ parent.name }"
            # The container session property.
            parent.session = session
            # The container type property.
            parent.container_type = container_type
            # The display title.
            parent.title = titleFor(parent)
            # Encapsulate the image files.
            parent.images = Image.imagesFor(parent)
  
          if session.detail
            Session.detail(id: session.detail).$promise.then (detail) =>
              # Copy the fetched detail into the session.
              Helpers.copyDetail(detail, session)
              addImageContainerContent(session.scan, session, 'scan')
              for reg in session.registrations
                addImageContainerContent(reg, session, 'registration')
              # Resolve to the detail object.
              detail
          else if params.detail
            # Set the session detail property from the URL detail parameter.
            session.detail = params.detail
            # Recurse.
            this.getSessionDetail(session, params)
          else if session.subject
            this.getSubjectDetail(session.subject, params).then (detail) =>
              # Find the session in the session list.
              sbj_session = _.find detail.sessions, (other) ->
                other.number == session.number
              # If the session was not found, then complain.
              if not sbj_session
                throw "Subject #{ subject.number } Session #{ session.number }" +
                      " does not reference a detail object"
              # Recurse.
              session.detail = sbj_session.detail
              this.getSessionDetail(session, params)
          else
            throw "The session detail cannot be fetched, since the session " +
                  " searchg object does not referennce a subject."

        # @param session the session to search
        # @param name the container name
        # @return the container object with the given name, if it exists,
        #   otherwise undefined
        getImageContainer: (session, params) ->
          # If the session has a scan, then the session detail was
          # loaded and its contents, including the scan and registrations,
          # were copied into the session object. In that case, find the
          # scan or registration container based on the name parameter,
          # which is 'scan' or the registration name. Then add a unique
          # id to the container so that it can be cached.
          if session.scan
            # The container name.
            name = params.container
            # Look for the scan or registration container.
            if name == 'scan'
              ctr = session.scan
            else
              ctr = _.find session.registrations, (reg) -> reg.name == name
            # If no such container, then complain.
            if not ctr
              throw "#{ session.subject.collection }" +
                     " Subject #{ session.subject.number }" +
                     " Session #{ session.number }" +
                     " does not have a #{ params.container } image."
            # Resolve to the container.
            ctr
          else
            # Load the session detail and recurse.
            promise = this.getSessionDetail(session, params)
            promise.then (detail) =>
              if not detail.scan and not detail.registrations.length
                throw "#{ session.subject.collection } Subject" +
                       " #{ session.subject.number } Session #{ session.number }" +
                       " does not have any image containers."
              this.getImageContainer(session, params)

        # @param parent the image parent container object
        # @param time_point the one-based series time point
        # @returns the image, if the image data is already loaded,
        #   otherwise a promise which resolves to the image object
        #   when the image content is loaded into the data property
        getImageDetail: (parent, time_point) ->
          image = parent.images[time_point - 1]
          if not image
            throw "Subject #{ subject.number } session #{ session.number }" +
                   " does not have an image at #{ parent.container_type }" +
                   " #{ parent.name } time point #{ time_point }"
          if image.data
            image
          else
            image.load()
    ]
