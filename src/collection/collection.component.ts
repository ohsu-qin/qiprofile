import * as _ from 'lodash';
import * as d3 from 'd3';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ConfigurationService } from '../configuration/configuration.service.ts';
import { PageComponent } from '../page/page.component.ts';
import { SubjectService } from '../subject/subject.service.ts';
import help from './collection.help.md';

// The D3 v4 symbols
// (cf. https://github.com/d3/d3-shape/blob/master/README.md#symbols).
// The symbols are sorted by inverse preference.
const SYMBOL_TYPES = [
  d3.symbolCircle, d3.symbolDiamond, d3.symbolStar, d3.symbolTriangle,
  d3.symbolSquare, d3.symbolCross, d3.symbolWye
];

@Component({
  selector: 'qi-collection',
  templateUrl: '/public/html/collection/collection.html'
})

/**
 * The Collection Detail main component.
 *
 * @class CollectionComponent
 * @module collection
 */
export class CollectionComponent extends PageComponent {
  /**
   * The project name.
   *
   * @property project {string}
   */
  project: string;

  /**
   * The collection name.
   *
   * @property name {string}
   */
  name: string;

  /**
   * The subject session objects.
   *
   * @property sessions {Object[]}
   */
  sessions: Object[];

  /**
   * The sessions display state (or null to display all session data).
   *
   * @property selection {boolean[]}
   */
  selection: boolean[];

  /**
   * The data => symbol type method.
   *
   * @property symbolType {(d: Object) => string}
   */
  symbolType = d => this._symbolType(d);

  /**
   * The sessions chart margin is scooched down to allow room
   * for the Y axis label at the top.
   *
   * @property sessionsChartMargin {number[]}
   */
  const sessionsChartMargin = [12, 0, 0, 0];

  /**
   * The subject vs visit day sessions chart {x, y, height}
   * configuration. The X and Y values are constants.
   * The height is determined after the sessions are fetched
   * from the database, alloting 24 pixels per subject.
   *
   * @property sessionsChart {Object}
   */
  sessionsChart: Object = {
    x: {property: 'day', legend: 'Day'},
    y: {property: 'subject.number', legend: 'Subject'}
  };

  /**
   * The axis callback sets the axis label and ticks.
   *
   * @method _onAxis
   * @private
   * @param property {string} the axis property
   * @param axis {Object} the D3 axis object
   */
  onSessionsChartAxis = (property, axis) => {
    // Wrap the private function in this fat arrow function
    // to ensure that `this` binds correctly.
    this._onSessionsChartAxis(property, axis);
  };

  /**
   * The correlation chart height apportions the remainder
   * of the usable real estate.
   *
   * @property correlationChartHeight {number}
   */
  correlationChartHeight: number;

  /**
   * The initial correlation chart {x, y} property path objects,
   * one per chart.
   *
   * @property correlations {Object[]}
   */
  correlations: Object[];

  /**
   * The {topic: {label: path}} correlation selectionChoices.
   *
   * @property selectionChoices {Object}
   */
  selectionChoices: Object;

  /**
   * The subject objects.
   *
   * @property subjects {Object[]}
   * @private
   */
  private subjects: Object[];

  /**
   * The properties to exclude.
   *
   * @property exclude {string[]}
   * @private
   */
  private exclude: string[];

  /**
   * The tick values for a subject number axis.
   *
   * @property subjectAxisTickValues
   * @private
   */
  private subjectAxisTickValues: number[];

  constructor(
    // private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private configService: ConfigurationService
  ) {
    super(help);
    // The project and collection name are displayed in the banner.
    let params = route.params.value;
    this.project = params.project;
    this.name = params.collection;
    // Fetch the subjects.
    subjectService.getSubjects(
      this.project, this.name
    ).do(subjects => {
      this.subjects = subjects;
    }).map(subjects => {
      // Collect the sessions.
      return _.flow(_.map, _.flatten)(
        subjects, 'sessions'
      );
    }).subscribe(sessions => {
      this.sessions = sessions;
      // Initialize the charts.
      this.initSessionChart();
      this.initCorrelationCharts();
    });
  }

  /**
   * The symbol is specific to the session number.
   *
   * @method symbolType
   * @param d {Object} the session object
   * @return {string} the session number symbol type
   */
  symbolType(d: Object) {
    return d.number - 1;
  }

  /**
   * The session chart callback adds axis labels and subject
   * hyperlinks.
   *
   * @method onSessionsChartPlotted
   * @param svg {Object} the root SVG group D3 selection
   */
   onSessionsChartPlotted(svg: Object) {
    // Make the X axis legend.
    let xData = [[100, 10, this.sessionsChart.x.legend]];
    svg.selectAll('text.x.legend')
      .data(xData)
      .enter().append('text')
        .attr('class', 'legend x')
        .text(d => d[2])
        .attr('x', d => d[0])
        .attr('y', d => d[1]);

    // Make the Y axis legend.
    let yData = [[this.sessionsChart.y.legend]];
    let y = Math.max(80, Math.floor(this.sessionsChart.height / 3));
    svg.selectAll('text.y.legend')
      .data(yData)
      .enter().append('text')
        .attr('class', 'legend y')
        .attr('transform', `translate(10,${ y })rotate(-90)`)
        .text(d => d[0]);

    // Open the Subject Detail page when the Y axis subject tick
    // mark is clicked. The argument is the subect number string
    // tick text. Convert the string to a number before calling
    // visitSubject.
    let onClick = d => this.visitSubject(+d);
    svg.selectAll('g.y.axis .tick text')
      .on('click', onClick);

    // TODO - adapt checkbox from
    // https://bl.ocks.org/Lulkafe/c77a36d5efb603e788b03eb749a4a714.
    // Center X axis checkbox over average day for each session number.
    // Push plot and axes down and over to make room.
  }

  /**
   * Relays a brush selection to all charts.
   *
   * @method onBrushSelect
   * @param selection {boolean[]} the selection state array
   */
  onBrushSelect(selection: boolean[]) {
    this.selection = selection;
  }

  /**
   * Returns the D3 symbol type for the given data.
   *
   * @method symbolType
   * @param d {Object} the session object
   */
  private _symbolType(d: Object) {
    let i = Math.min(d.number - 1, SYMBOL_TYPES.length);
    return SYMBOL_TYPES[i];
  }

  /**
   * Opens the Subect Detail page.
   *
   * @method visitSubject
   * @param subjectNbr {number} the subject number
   */
  private visitSubject(subjectNbr) {
    // The subjects are ordered by number.
    let subject = this.subjects[subjectNbr - 1];
    // Cache the subject to avoid a refetch.
    this.subjectService.cache(subject);
    // Go to the Subect Detail page.
    this.router.navigate(
      ['subject', subjectNbr],
      {relativeTo: this.route}
    );
  }

  private initSessionChart() {
    // Each subject has a tick mark.
    this.subjectAxisTickValues = _.range(1, this.subjects.length + 1);
    let yTickCnt = this.subjectAxisTickValues.length;
    // The axis vertical padding.
    const axisPad = 8;
    // The axis legend character size.
    const legendCharSize = 12;
    // The subject tick button size.
    const tickCharSize = 18;
    // The sessions chart vertical legend size.
    let yLegend = this.sessionsChart.y.legend;
    let yLegendSize = (yLegend.length * legendCharSize) + axisPad;
    // The sessions chart plot vertical size.
    let plotHeight = yTickCnt * tickCharSize;
    // The sessions chart accomodates both the axis label and the
    // session buttons along the axis, along with a small padding.
    let height = Math.max(yLegendSize, plotHeight);
    this.sessionsChart.height = height;
  }

  private initCorrelationCharts() {
    // The {Imaging, Clinical} configuration.
    let config = this.createCorrelationConfiguration();
    // The combined {topic: {label: path}} configuration.
    let accumChoices = (accum, choices) => _.assign(accum, choices);
    this.selectionChoices = _.values(config).reduce(accumChoices, {});
    // The initial select property paths.
    this.correlations = this.initialPaths(config);
  }

  private initialPaths(config) {
    // The initial {topic: path} preference is in the
    // preferences configuration.
    let prefConfig = this.configService.preferences.Collection;

    // Finds a matching property path in the given data model
    // section. The path parameter is the data model path string.
    let searchSection = (path, section) => {
      // Guard against a non-object section.
      if (_.isPlainObject(section)) {
        // Try to match against a full path.
        if (_.get(section, path)) {
          return path;
        }
        // Recurse until a match is found.
        for (let key in section) {
          let subsection = section[key];
          let target = searchSection(path, subsection);
          if (target) {
            return `${ key }.${ target }`;
          }
        }
      }
      // No matching path.
      return null;
    };

    let search = path => {
      for (let section of _.values(config)) {
        let target = searchSection(path, section);
        if (target) {
          return target;
        }
      }
      // The selection path was not found.
      throw new Error('The collection correlation selection path was not found: ' +
                      path);
    };

    // Converts the delimited preference string to an array.
    let parse = value => value.split(/;\s*/);

    // Converts the preference config entry to property paths.
    let collect = (axis, topic) => {
      // Fills out partial paths and sets paths which are not
      // in the data model to null.
      let resolvePath = path => search(path);
      let resolveAll = paths => paths.map(resolvePath);
      // Parse, complete and filter the paths.
      return _.flow(parse, resolveAll, _.filter)(axis);
    };

    // The complete, valid preference paths.
    let preferences = _.mapValues(prefConfig, collect);

    // The X axis preferences.
    let xPrefs = preferences.x;
    // The number of X paths.
    let xPrefCnt = xPrefs.length;
    // The Y axis preferences.
    let yPrefs = preferences.y;
    // The number of Y paths.
    let yPrefCnt = yPrefs.length;
    // The number of Clinical x Imaging path combinations.
    let prefCnt = xPrefCnt * yPrefCnt;
    // Draw at most four correlation charts.
    const maxCorrCnt = 4;
    // The number of correlation charts.
    let corrCnt = Math.min(prefCnt, maxCorrCnt);
    // There should be an even number of side-by-side
    // correlation charts.
    if (corrCnt > 1 && corrCnt % 2) { corrCnt--; }
    // The ith X axis correlation path modulo the X preference count.
    let xPathAt = i => xPrefs[i % xPrefCnt];
    // The ith Y axis correlation path modulo the Y preference count.
    let yPathAt = i => yPrefs[i % yPrefCnt];
    // Pick each X and Y path.
    let correlationAt = i => {
      return {x: xPathAt(i), y: yPathAt(i)};
    };

    return _.range(corrCnt).map(correlationAt);
  }

  /**
   * Converts the parsed correlation configuration file into a
   * {`Clinical`: sections}, {`Imaging`: sections} object,
   * where each sections object is a {topic: {label: path, ...}}}
   * of chartable property label: path items grouped by topic,
   * e.g.:
   *
   *     {
   *       Clinical: {
   *         Demographics: {
   *           'Age': 'subject.age',
   *           'Gender': 'subject.gender',
   *           ...
   *         }
   *         Biopsy: {
   *           'TNM Size': 'subject.biopsy.pathology.tumors[0].tnm.size',
   *           ...
   *         }
   *         Surgery: {
   *           'Tumor Length': 'subject.surgery.pathology.tumorLength',
   *           ...
   *         }
   *       },
   *       Imaging: {
   *         Scan: {
   *           'delta Ktrans':
   *             scanModeling.modelingResult.deltaKTrans.image.metadata.averageIntensity
   *         },
   *         Registration: ...
   *       }
   *     }
   *
   * @method createCorrelationConfiguration
   * @private
   * @return {Object} the chartable property configuration
   */
  private createCorrelationConfiguration() {
    // The {topic: {label: path}} configuration.
    let baseConfig = this.configService.dataModel;
    // Merge sections for this collection, e.g. if
    // this collection's name is 'Breast', then
    // [TNM] and [TNM:Breast] are merged into one
    // TNM section. Other collection specializations
    // are ignored, e.g. [TNM:Sarcoma].
    let accumSections = (accum, section, topic) => {
      let topicCollection = topic.split(':');
      let baseTopic = topicCollection[0];
      let collection = topicCollection[1];
      if (!collection || collection === this.name) {
        let accumSection = accum[baseTopic];
        if (accumSection) {
          accum[baseTopic] = _.assign({}, accumSection, section);
        } else {
          accum[baseTopic] = section;
        }
      }
    };
    // The consolidated configuration with merged specialized
    // topics.
    let filtered = _.transform(baseConfig, accumSections);

    // The top-level entries are not referenced by another entry.
    let isChild = topic => _.find(filtered, other => _.has(other, topic));
    let isTop = (value, key) => !isChild(key);
    let top = _.pickBy(filtered, isTop);

    // Flattens subtopics.
    let flatten = (path, topic) => {
      let section = filtered[topic];
      return this.flattenSection(section, filtered, path);
    };
    // Fill out the top subsections.
    let flattenValues = (section) => _.mapValues(section, flatten);
    let flattened = _.mapValues(top, flattenValues);

    // Delete unavailable properties and empty sections.
    let cleaned = this.cleanCorrelationConfiguration(flattened);

    // Return the filtered, merged, flattened, cleaned configuration.
    return cleaned;
  }

  /**
   * Returns a new configuration without unavailable properties and
   * empty sections removed from the given configuration.
   *
   * @method cleanCorrelationConfiguration
   * @param config {Object} the input configuration
   * @return {Object} the new cleaned configuration
   */
  private cleanCorrelationConfiguration(config: Object) {
    // If the key is not excluded and the value is not
    // empty, then returns the recursively cleaned value.
    let clean = (value, key) => {
      if (!_.includes(this.exclude, key)) {
        return this.cleanCorrelationConfigurationValue(value);
      }
    };

    // Filter out the empty and excluded properties.
    let accumClean = (accum, value, key) => {
      let cleanedValue = clean(value, key);
      if (!_.isEmpty(cleanedValue)) {
        accum[key] = cleanedValue;
      }
    };

    return _.transform(config, accumClean);
  }

  /**
   * "Cleans" the given value as follows:
   * * If the value is an Object, then this method cleans
   *   the value using
   *   {{#crossLink "CollectionComponent/cleanCorrelationConfiguration}}{{/crossLink}}.
   * * Otherwise, the input value is a property path. In that case,
   *   if there is at least one
   *   {{#crossLink "CollectionComponent/sessions:property}}{{/crossLink}}
   *   data object which has the property value, then the input
   *   property path is returned.
   * * Otherwise, null is returned.
   *
   *
   * @method cleanCorrelationConfigurationValue
   * @param value {any} the sub-configuration or property path to check
   * @return {any} the cleaned value
   */
  private cleanCorrelationConfigurationValue(value: any) {
    if (_.isPlainObject(value)) {
      return this.cleanCorrelationConfiguration(value);
    } else if (this.isPropertyinSomeSession(value)) {
      return value;
    } else {
      return null;
    }
  }

  /**
   * Returns whether there is at least one
   * {{#crossLink "CollectionComponent/sessions:property}}{{/crossLink}}
   * data object which has a non-nil value for the given property.
   *
   * @method isPropertyinSomeSession
   * @param path {string} the property path to check
   * @return {boolean} whether some session has a non-nil
   *   value for the property
   */
  private isPropertyinSomeSession(path: string) {
    let hasValue = session => !_.isNil(_.get(session, path));
    return _.some(this.sessions, hasValue);
  }

  /**
   * Recursively flatten the section into an object consisting
   * only of {topic: {label: path}} entries.
   *
   * @method flattenSection
   * @private
   * @param section {Object} the configuration section
   * @param config {Object} the {topic, section} configuration
   * @param path {string} the property path to the section
   */
  private flattenSection(section: Object, config: Object, path: string) {
    let flatten = (accum, value, key) => {
      let subpath;
      // The section entry "this" implies the section is
      // an alias for the parent section, so ignore it in
      // the path.
      if (path === 'this') {
        subpath = value;
      } else {
        subpath = `${ path }.${ value }`;
      }
      // If the property key references a config section,
      // then recursively flatten the subsection.
      // Otherwise, the result is the value.
      let subsection = config[key];
      if (subsection) {
        let flattened = this.flattenSection(subsection, config, subpath);
        _.assign(accum, flattened);
      } else {
        accum[key] = subpath;
      }
    };

    return _.transform(section, flatten);
  }

  /**
   * This axis callback sets the X axis Day tick interval to 10 rather
   * than the default 5.
   *
   * @method _onSessionsChartAxis
   * @private
   * @param property {string} the axis property
   * @param axis {Object} the D3 axis object
   */
   private _onSessionsChartAxis(property: string, axis: Object) {
    if (property.endsWith('day')) {
      let [min, max] = axis.scale().domain();
      axis.ticks(Math.floor((max - min) / 10));
    }
  }
}
