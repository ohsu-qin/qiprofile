###*
 * The Treatment REST data object extension utility.
 *
 * @module clinical
 * @class Treatment
 * @static
###
Treatment =
  ###*
   * @method extend
   * @param treatment the subject treatment
   * @param subject the parent subject REST object
   * @return the augmented treatment object
  ###
  extend: (treatment, subject) ->
    return treatment unless treatment?

    # The treatment start date is required.
    unless treatment.startDate
      throw new Error("Treatment is missing the start date")

    ###*
     * The parent {{#crossLink "Subject"}}{{/crossLink}} REST object.
     *
     * @property subject
    ###
    treatment.subject = subject

    # Add the virtual properties.
    Object.defineProperties treatment,
      ###*
       * The treatment [start, end] span.
       *
       * @property span
      ###
      span:
        get: ->
          [@startDate, @endDate]

      ###*
       * The treatment duration in days, if there is both a start
       * and an end date, otherwise undefined.
       *
       * @property duration
      ###
      duration:
        get: ->
          if @startDate and @endDate
            @endDate.diff(@startDate, 'days')

    # Return the augmented treatment object.
    treatment

`export { Treatment as default }`
