
/**
 * The Session module.
 *
 * @module session
 */

(function() {
  import * as _ from "lodash";
  import ObjectHelper from "../object/object-helper.coffee";
  import Scan from "./scan.data.coffee";
  import Modeling from "./modeling.data.coffee";

  /**
   * @method getOverlays
   * @protected
   * @param session the session to navigate
   * @return the session {modeling protocol: overlays}
   *   associative object, or null if there are no overlays
   */
  var Session, getOverlays;

  getOverlays = function(session) {

    /**
     * @method associate
     * @param accum the {modeling protocol: overlays} associative
     *   accumulator object
     * @param modeling the modeling object to check
     * @return the augmented accumulator
     */
    var associate, mdl, overlayed;
    associate = function(accum, modeling) {
      return accum[modeling.protocol] = modeling.overlays;
    };
    overlayed = (function() {
      var i, len, ref, results;
      ref = session.modelings;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        mdl = ref[i];
        if (mdl.overlays.length != null) {
          results.push(mdl);
        }
      }
      return results;
    })();
    if (overlayed.length != null) {
      return _.reduce(overlayed, associate, {});
    } else {
      return null;
    }
  };


  /**
   * The Session REST data object extension utility.
   *
   * @module session
   * @class Session
   * @static
   */

  Session = {

    /**
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
     */
    extend: function(session, subject, number) {

      /**
       * The one-based subject session index in date order.
       *
       * @property number {number}
       */
      var extent, i, j, len, len1, modeling, ref, ref1;
      session.number = number;
      if (session.preview != null) {
        if (!session.preview.image) {
          throw new Error("The " + this.title + " preview is missing an image");
        }
        session.preview.image.resource = session.preview.name;
        session.preview.image.session = session;
      }
      if (session.modelings == null) {
        session.modelings = [];
      }
      ref = session.modelings;
      for (i = 0, len = ref.length; i < len; i++) {
        modeling = ref[i];
        Modeling.extend(modeling, session);
      }
      if (session.tumorExtents == null) {
        session.tumorExtents = [];
      }
      ref1 = session.tumorExtents;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        extent = ref1[j];

        /**
         * The measured scan tumor length, width and depth.
         *
         * @module session
         * @class SessionTumorExtent
         */
        Object.defineProperties(extent, {

          /**
           * The extent length x width x depth in cubic
           * centimeters.
           *
           * @property volume
           */
          volume: {
            get: function() {
              if (this.length && this.width && this.depth) {
                return (this.length * this.width * this.depth) / 1000;
              }
            }
          }
        });
      }
      session.overlays = getOverlays(session);

      /**
       * Fetches the session detail REST object for the given session.
       * The session object is extended with the detail properties.
       *
       * @method extendDetail
       * @param detail the detail object fetched from the database
       * @return a promise which resolves to the extended session
       *   object
       * @throws ReferenceError if the detail was not found
       */
      session.extendDetail = function(detail) {
        var k, len2, ref2, scan;
        if (detail == null) {
          throw new ReferenceError("The " + this.title + " detail object is missing");
        }
        if (detail.scans == null) {
          detail.scans = [];
        }
        ObjectHelper.aliasPublicDataProperties(detail, session);
        ref2 = session.scans;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          scan = ref2[k];
          Scan.extend(scan, session);
        }
        return session;
      };
      Object.defineProperties(session, {

        /**
         * The display title.
         *
         * @property title
         */
        title: {
          get: function() {
            return this.subject.title + " Session " + this.number;
          }
        },

        /**
         * The inclusive one-based number of days from the first
         * session date to this session date.
         *
         * @property day
         */
        day: {
          get: function() {
            return this.date.diff(this.subject.sessions[0].date, 'days') + 1;
          }
        },

        /**
         * The [_parent_, {session: _session_}] path, where:
         * * _parent_ is the parent subject path items
         * * _session_ is the session number
         *
         * @property path
         */
        path: {
          get: function() {
            return this.subject.path.concat([
              {
                session: this.number
              }
            ]);
          }
        },

        /**
         * The first modeling with a scan source.
         *
         * @property scanModeling
         */
        scanModeling: {
          get: function() {
            return _.find(this.modelings, 'source.scan');
          }
        },

        /**
         * The first modeling with a registration source.
         *
         * @property registrationModeling
         */
        registrationModeling: {
          get: function() {
            return _.find(this.modelings, 'source.registration');
          }
        },

        /**
         * The sum of all tumor volumes.
         *
         * @property tumorVolume
         */
        tumorVolume: {
          get: function() {
            return _.sumBy(this.tumorExtents, 'volume');
          }
        }
      });

      /**
       * @method hasDetailProperties
       * @return whether this session is extended with the session
       *   detail REST database object
       */
      session.hasDetailProperties = function() {
        return this.scans != null;
      };
      return session;
    }
  };

  export { Session as default };

}).call(this);
