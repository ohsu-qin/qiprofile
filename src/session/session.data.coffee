###*
 * The Session module.
 *
 * @module session
###

`import * as _ from "lodash"`

`import ObjectHelper from "../object/object-helper.coffee"`
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
    return session if not session?
    # Set the session subject property.
    session.subject = subject
    # Set the session number property.
    session.number = number
    # Add the default empty modeling array, if necessary.
    if not session.modelings?
      session.modelings = []
    # Augment the modeling objects.
    for modeling in session.modelings
      Modeling.extend(modeling, session)
    # Add the overlays property.
    session.overlays = getOverlays(session)

    ###*
     * Fetches the session detail REST object for the given session.
     * The session object is extended with the detail properties.
     *
     * @method extendDetail
     * @param detail the detail object fetched from the database
     * @return a promise which resolves to the extended session
     *   object
     * @throws ReferenceError if the detail was not found
    ###
    session.extendDetail = (detail) ->
      # The session object must have a detail reference.
      if not detail?
        throw new ReferenceError(
          "The #{ @title } detail object is missing"
        )
      # The detail scans are an empty array by default.
      if not detail.scans?
        detail.scans = []
      # Copy the fetched detail into the session object.
      ObjectHelper.aliasPublicDataProperties(detail, session)
      # Extend the scans.
      for scan in session.scans
        Scan.extend(scan, session)

      # Resolve to the extended session object.
      session

    # Add the virtual properties.
    Object.defineProperties session,
      ###*
       * The display title.
       *
       * @property title
      ###
      title:
        # TODO - get the Session title template from a labels.cfg
        # entry:
        #   [Session]
        #   label=Session
        # and include the label in the format below. Thus, the
        # title could be externally configurable to include, say,
        # 'Visit', rather than 'Session'. See also the subject.data.coffee
        # title TODO.
        get: ->
          "#{ @subject.title } Session #{ @number }"

      ###*
       * The <parent>/session path, where:
       * * <parent> is the parent subject path
       * * *session* is the session number
       *
       * @property path
      ###
      path:
        get: ->
          "#{ @subject.path }/#{ @number }"

    ###*
     * @method hasDetailProperties
     * @return whether this session is extended with the session
     *   detail REST database object
    ###
    session.hasDetailProperties = ->
      # scans is the extended session signature property
      @scans?

    # Return the augmented session object.
    session

`export { Session as default }`

