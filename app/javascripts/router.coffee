router = angular.module 'qiprofile.router', ['qiprofile.resources', 'qiprofile.helpers']

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

    # Make a subject from the given route parameters. If there
    # is not a detail parameter, then fetch the subject from the
    # Subject resource. Otherwise, return a new subject object
    # with the project, collection and number from the query
    # parameters (but not the detail, since this is an abstract
    # state and the detail parameter might be associated with a
    # session rather than a subject).
    #
    # @param project the project
    # @param params the URL query parameters
    # @param Subject the Subject resource
    # @returns the subject
    getSubject: (params) ->
      sbj =
        project: params.project
        collection: _.str.capitalize(params.collection)
        number: parseInt(params.subject)
      if params.detail
        sbj
      else
        Subject.query(where(sbj)).$promise.then (subjects) ->
          if subjects.length > 1
            throw "Subject query returned more than one subject: #{ sbj }"
          subjects[0]

    # Fetches the subject detail and fixes it up as follows:
    # * converts the session and encounter dates into moments
    # * copies the detail properties into the subject
    # * sets the subject isMultiSession flag
    #
    # @param subject the parent object
    # @param params the request query parameters
    # @param Subject the Subject resource
    # @param Helpers the Helpers service
    # @returns a promise which resolves to the detail object
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
          # Resolve to the detail object.
          detail
      else if params.detail
        subject.detail = params.detail
        this.getSubjectDetail(subject, params)
      else
        this.getSubject(subject).then (fetched) =>
          # If the fetched subject has no detail, then complain.
          if not fetched.detail
            throw "Subject #{ subject.number } does not reference a detail" +
                  "object"
          # Recurse.
          this.getSubjectDetail(fetched, params)

    # @param session the parent object
    # @param params the request query parameters
    # @param Session the Session resource
    # @param Subject the Subject resource
    # @param Image the Image service
    # @param Helpers the Helpers service
    # @returns the detail object
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
      else
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

    # @param session the session to search
    # @param name the container name
    # @param Session the Session resource
    # @param Subject the Subject resource
    # @param Image the Image service
    # @param Helpers the Helpers service
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
