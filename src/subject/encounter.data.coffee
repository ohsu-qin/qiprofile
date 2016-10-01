###*
 * The Encounter REST data object extension utility.
 *
 * @module subject
 * @class Encounter
 * @static
###
Encounter =
  ###*
   * @method extend
   * @param encounter the subject encounter
   * @param subject the parent subject REST object
   * @return the augmented encounter object
  ###
  extend: (encounter, subject) ->
    return encounter unless encounter?

    # The encounter date is required.
    unless encounter.date
      throw new Error("Encounter is missing a date")

    ###*
     * The parent {{#crossLink "Subject"}}{{/crossLink}} REST object.
     *
     * @property subject
    ###
    encounter.subject = subject

    ###*
     * @method isSession
     * @return whether the encounter class is `Session`
    ###
    encounter.isSession = -> @_cls is 'Session'

    ###*
     * @method isClinical
     * @return whether the encounter is not a session
    ###
    encounter.isClinical = -> not @isSession()

    # Add the virtual properties.
    Object.defineProperties encounter,
      ###*
       * The patient age at the time of the encounter.
       *
       * @property age
      ###
      age:
        get: ->
          if @date and @subject.birthDate
            @date.diff(@subject.birthDate, 'years')

    # Return the augmented encounter object.
    encounter

`export { Encounter as default }`
