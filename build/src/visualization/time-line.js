
/**
 * The time line decorator utility.
 *
 * @module visualization
 */

(function() {
  import * as _ from "lodash";
  import moment from "moment";
  ({

    /**
     * Decorates the time line as follows:
     * * Add the session hyperlinks, encounter dates and treatment
     *   start-end bars.
     * * Rotate the date x-axis tick labels
     *
     * Note: The session hyperlinks are ui-sref attributes. However,
     * D3 mutates the DOM after the Angular digest cycle. Consequently,
     * the callback must call Angular $compile with the current scope
     * on each new hyperlink.ui-sref directive.
     *
     * @method decorate
     * @param svg the timeline svg element
     * @param subject the displayed subject
     * @param min the earliest encounter or treatment date
     * @param max the latest encounter or treatment date
     */
    decorate: function(svg, subject, min, max) {
      var SESSION_DETAIL_STATE, TREATMENT_BAR_HEIGHT, TREATMENT_SYMBOL, addClinicalEncounters, addLegend, addSessionDetailLinks, addTreatmentBars, dy;
      TREATMENT_BAR_HEIGHT = 1;
      TREATMENT_SYMBOL = '\u2207';
      SESSION_DETAIL_STATE = 'quip.collection.subject.session';

      /**
       * Adds the session hyperlinks above the timeline. The template
       * sets the callback attribute to this function. The new anchor
       * elements are positioned dy em units above the timeline,
       * plus a small padding. This allows for displaying the treatment
       * bars and encounter points between the timeline and the
       * hyperlinks.
       *
       * @method addSessionDetailLinks
       * @param sessions the subject sessions
       * @param xAxis the chart SVG X axis D3 selection
       * @param dy the optional y offset in em units
       */
      addSessionDetailLinks = function(sessions, xAxis, dy) {
        var createSessionDetailLink, isSessionDate, session, sessionIndex, sessionMillis, ticks;
        if (dy == null) {
          dy = 0;
        }

        /**
         * Makes a new ui-sref anchor element that hyperlinks to the given
         * session detail page.
         *
         * @method createSessionDetailLink
         * @param session the hyperlink target session
         * @param tick the X axis tick mark
         */
        createSessionDetailLink = function(session, tick) {
          var handler, params, text;
          text = tick.append('text');
          text.attr('dx', '-.2em').attr('dy', "-" + (0.5 + dy) + "em");
          text.style('text-anchor: middle');
          text.text(session.number);
          params = {
            project: subject.project,
            collection: subject.collection,
            subject: subject.number,
            session: session.number
          };
          handler = function() {
            return $state.go(SESSION_DETAIL_STATE, params);
          };
          return Chart.d3Hyperlink(text, handler);
        };
        ticks = xAxis.selectAll('.tick');
        sessionMillis = (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = sessions.length; j < len1; j++) {
            session = sessions[j];
            results.push(session.date.valueOf());
          }
          return results;
        })();

        /**
         * @method isSessionDate
         * @param date the date to check
         * @return whether the date is a session date
         */
        isSessionDate = function(date) {
          return _.includes(sessionMillis, date.valueOf());
        };
        sessionIndex = 0;
        return ticks.each(function(date, i) {
          var tick;
          if (isSessionDate(date)) {
            tick = d3.select(this);
            createSessionDetailLink(sessions[sessionIndex], tick);
            return sessionIndex++;
          }
        });
      };

      /**
       * Inserts an SVG bar for each treatment above the timeline.
       *
       * @method addTreatmentBars
       * @param xAxis the chart SVG x axis element
       */
      addTreatmentBars = function(xAxis) {
        var axisWidth, background, bar, end, factor, j, left, len1, parent, ref, results, spacer, start, trt, width, xAxisNode;
        xAxisNode = xAxis.node();
        parent = d3.select(xAxisNode.parentNode);
        background = parent.select('.nv-background');
        spacer = background.select('rect');
        axisWidth = spacer.attr('width');
        factor = axisWidth / (max - min);
        ref = subject.treatments;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          trt = ref[j];
          start = trt.startDate;
          end = trt.endDate || moment();
          left = (start - min) * factor;
          width = (end - start) * factor;
          if (!width) {
            left = left - 3;
            width = 6;
          }
          bar = parent.insert('svg:rect', function() {
            return xAxisNode;
          });
          bar.attr('height', TREATMENT_BAR_HEIGHT + "em");
          bar.attr('width', width);
          bar.classed("qi-timeline-" + (trt.treatmentType.toLowerCase()), true);
          bar.attr('x', left);
          results.push(bar.attr('y', "-" + TREATMENT_BAR_HEIGHT + "em"));
        }
        return results;
      };

      /**
       * Inserts a marker for each clinical encounter above the
       * timeline.
       *
       * @method addClinicalEncounters
       * @param element the chart X axis D3 selection
       */
      addClinicalEncounters = function(xAxis) {
        var axisWidth, background, date, enc, factor, j, len1, line, lineNode, offset, parent, ref, results, spacer, text, xAxisNode;
        xAxisNode = xAxis.node();
        parent = d3.select(xAxisNode.parentNode);
        background = parent.select('.nv-background');
        spacer = background.select('rect');
        axisWidth = spacer.attr('width');
        line = parent.select('.nv-series-0');
        lineNode = line.node();
        factor = axisWidth / (max - min);
        ref = subject.clinicalEncounters;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          enc = ref[j];
          date = enc.date;
          offset = (date - min) * factor;
          text = parent.insert('svg:text');
          text.attr('x', Math.floor(offset) - 6);
          text.classed("qi-timeline-" + (enc.title.toLowerCase()), true);
          results.push(text.text(TREATMENT_SYMBOL));
        }
        return results;
      };

      /**
       * Adds the treatment and encounter legend directly before the
       * SVG element.
       *
       * @method addLegend
       * @param svg the SVG D3 selection
       */
      addLegend = function() {
        var addEncounterLegend, addTreatmentLegend, parent, svgNode;
        addTreatmentLegend = function(parent) {
          var j, label, label_lengths, labels, len, len1, p, results, sorted, span, trt, trts;
          trts = subject.treatments;
          if (!trts.length) {
            return;
          }
          p = parent.insert('p', function() {
            return svg.node();
          });
          p.text('Treatments: ');
          p.classed({
            'col-md-offset-5': true,
            'font-size: small': true
          });
          sorted = _.sortBy(trts, function(trt) {
            return trt.start_date.valueOf();
          });
          labels = _.uniq((function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = sorted.length; j < len1; j++) {
              trt = sorted[j];
              results.push(trt.treatment_type);
            }
            return results;
          })());
          label_lengths = (function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = labels.length; j < len1; j++) {
              label = labels[j];
              results.push(label.length);
            }
            return results;
          })();
          len = _.max(label_lengths) + 2;
          results = [];
          for (j = 0, len1 = labels.length; j < len1; j++) {
            label = labels[j];
            span = p.append('span');
            span.classed("qi-timeline-" + (label.toLowerCase()), true);
            results.push(span.text(label));
          }
          return results;
        };
        addEncounterLegend = function(parent) {
          var enc, encs, j, label, labels, len1, p, results, sorted, span;
          encs = subject.clinicalEncounters;
          if (!encs.length) {
            return;
          }
          p = parent.insert('p', function() {
            return svg.node();
          });
          p.text('Encounters: ');
          p.classed({
            'col-md-offset-5': true,
            'font-size: small': true
          });
          sorted = _.sortBy(encs, function(enc) {
            return enc.date.valueOf();
          });
          labels = _.uniq((function() {
            var j, len1, results;
            results = [];
            for (j = 0, len1 = sorted.length; j < len1; j++) {
              enc = sorted[j];
              results.push(enc.title);
            }
            return results;
          })());
          results = [];
          for (j = 0, len1 = labels.length; j < len1; j++) {
            label = labels[j];
            span = p.append('span');
            span.classed("qi-timeline-" + (label.toLowerCase()), true);
            results.push(span.text(TREATMENT_SYMBOL + label));
          }
          return results;
        };
        svgNode = svg.node();
        parent = d3.select(svgNode.parentNode);
        addTreatmentLegend(parent);
        return addEncounterLegend(parent);
      };
      if (_.some(subject.treatments) || _.some(subject.clinicalEncounters)) {
        dy = TREATMENT_BAR_HEIGHT;
      } else {
        dy = 0;
      }
      addTreatmentBars(xAxis);
      addClinicalEncounters(xAxis);
      addSessionDetailLinks(subject.sessions, xAxis, dy);
      return addLegend();
    }
  });

}).call(this);
