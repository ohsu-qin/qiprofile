`import * as _ from "lodash"`

`import ObjectHelper from "../common/object-helper.coffee"`
`import Scan from "./scan.data.coffee"`
`import Modeling from "./modeling.data.coffee"`

###*
 * @method getOverlays
 * @protected
 * @param session the session to navigate
 * @return the session {modeling protocol: overlays}
 *   associative object, or null if there are no overlays
###
getOverlays = (session) ->
  ###*
   * @method associate
   * @param accum the {modeling protocol: overlays} associative
   *   accumulator object
   * @param modeling the modeling object to check
   * @return the augmented accumulator
  ###
  associate = (accum, modeling) ->
    accum[modeling.protocol] = modeling.overlays

  # The modeling objects with at least one overlay.
  overlayed = (
    mdl for mdl in session.modelings when mdl.overlays.length?
  )

  # Return the {modeling protocol: overlays} associative object,
  # or null if no overlay.
  if overlayed.length?
    _.reduce(overlayed, associate, {})
  else
    null

###*
 * The Session REST data object extension utility.
 *
 * @module session
 * @class Session
 * @static
###
Session =
  ###*
   * Fixes the session acquisition date and adds the following
   * session properties:
   * * number - the one-based session number in acquisition order
   * * subject - the session parent subject reference
   * * overlays - the {modeling protocol id: [label map objects]}
   *   for those label maps which have a color table
   *
   * @method extend
   * @param session the REST session object to extend
   * @param subject the parent REST subject object
   * @param number the session number
   * @return the extended session object
  ###
  extend: (session, subject, number) ->
    # Set the session subject property.
    session.subject = subject
    # Set the session number property.
    session.number = number
    # Augment the modeling objects.
    for modeling in session.modelings
      Modeling.extend(modeling, session)
    # Add the overlays property.
    session.overlays = getOverlays(session)
    # Add the virtual properties.
    Object.defineProperties session,
      ###*
       * @method title
       * @return the display title
      ###
      title:
        # TODO - get the Session display text from a config,
        #   e.g.:
        #     label = config.session.label
        #     "#{ @collection } #{ label } #{ @number }"
        #   Thus, the label could be, say, 'Visit', rather than
        #   'Session', and externally configurable. See also
        #   the subject.coffee title TODO.
        #
        get: -> "#{ @subject.title } Session #{ @number }"

    ###*
     * Returns the <parent>/session path, where:
     * * <parent> is the parent subject path
     * * *session* is the session number
     *
     * @method path
     * @return the session path
    ###
    path:
      get: ->
        "#{ @subject.path }/#{ @number }"

    # Return the augmented session object.
    session

  ###*
   * Fetches the session detail REST object for the given session.
   * The session object is extended with the detail properties.
   *
   * @method detail
   * @param session the session object with a detail database id
   * @return a promise which resolves to the extended session
   *   object
   * @throws ReferenceError if the detail was not found
  ###
  detail: (session) ->
    # The session object must have a detail reference.
    if not session.detail?
      throw new ReferenceError(
        "#{ session.title } does not reference a detail object"
      )

    # Return a promise to fetch the session detail.
    Resources.Session.detail(id: session.detail).then (detail) ->
      # Copy the fetched detail into the session.
      ObjectHelper.aliasPublicDataProperties(detail, session)
      # Add properties to the scans and their registration.
      for scan in session.scans
        # Add properties.
        Scan.extend(scan, session)
      # Resolve to the extended session object.
      session

  ###*
   * @method hyperlink
   * @param session the session object
   * @return the href to the session detail page
  ###
  hyperlink: (session) ->
    subject = session.subject
    sbjRefUrl = "/quip/#{ subject.collection }/subject/#{ subject.number }"

    "#{ sbjRefUrl }/session/#{ session.number }?project=#{ subject.project }"

`export { Session as default }`

