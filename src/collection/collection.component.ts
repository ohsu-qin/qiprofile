import * as _ from 'lodash';
import * as d3 from 'd3';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import ObjectHelper from '../object/object-helper.coffee';
import DateHelper from '../date/date-helper.coffee';
import {
  ConfigurationService
} from '../configuration/configuration.service.ts';
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
   * The session display state array (or null to display
   * all session data).
   *
   * @property domainSelection {boolean[]}
   */
  domainSelection: boolean[];

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
  const sessionsChartMargin = [12, 0, 0, 12];

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
   * The initial correlation chart {x, y} [[topic, label], ...] array,
   * one item per chart.
   *
   * @property correlations {Object[]}
   */
  correlations: Object[];

  /**
   * The {topic: {label: path}} correlation choices.
   *
   * @property propertyChoices {Object}
   */
  propertyChoices: Object;

  /**
   * The subject objects.
   *
   * @property subjects {Object[]}
   * @private
   */
  private subjects: Object[];

  /**
   * The {path: domain} associative object for the displayable
   * properties.
   *
   * @property domains
   */
  domains: Object[];

  /**
   * Flag indicating whether the domain selection is
   * based on the subject checkboxes.
   *
   * @property isCheckboxSelection {boolean}
   * @private
   */
  private isCheckboxSelection: boolean;

  /**
   * The properties to exclude.
   *
   * @property exclude {string[]}
   * @private
   */
  private exclude: string[];

  /**
   * The SVG element.
   *
   * @property svg {d3.Selection<any>}
   * @private
   */
  private svg: d3.Selection<any>;

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
   * Delegates to
   * {{#crossLink "ConfigurationService/getTextLabel"}}{{/crossLink}},
   *
   * @method getLabel
   * @param property {string} the property path
   * @return {string} the display text label
   */
  getLabel(property: string) {
    return this.configService.getTextLabel(property, this.name);
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
    // Capture the SVG element for use when clearing the checkboxes.
    this.svg = svg;
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
    let onSubjectClick = d => this.visitSubject(+d);
    svg.selectAll('g.y.axis .tick text')
      .on('click', onSubjectClick);

    // Flip the corresponding domain selection flag when a
    // subject checkbox is clicked. If a checkbox select is
    // active, then augment the domain selection. Otherwise,
    // activate a new checkbox select and select only the
    // domain sessions for the checked subject.
    let onCheckboxClick = value => {
      let subjectNbr = +value;
      let matchesSubject = d => d.subject.number === subjectNbr;
      let isSelected;
      if (this.isCheckboxSelection) {
        isSelected = (d, i) =>
          this.domainSelection[i] || matchesSubject(d);
      } else {
        isSelected = matchesSubject;
        this.isCheckboxSelection = true;
      }
      this.domainSelection = this.sessions.map(isSelected);
    };
    // Add the Y axis checkboxes. The pixel values are 'just so'
    // a posteriori numbers determined by visual inspection with
    // no a priori justification.
    svg.selectAll('g.y.axis g.tick')
      .append('g')
        .attr('transform', 'translate(-32, -7)')
        .append('foreignObject')
          .attr('width', 10)
          .attr('height', 10)
          .append('xhtml:input')
            .attr('type', 'checkbox')
            .on('click', onCheckboxClick);
  }

  /**
   * Relays a brush selection to all charts.
   *
   * @method onBrushSelect
   * @param selection {boolean[]} the selection state array
   */
  onBrushSelect(selection: boolean[]) {
    // Relay the selection to the child charts.
    this.domainSelection = selection;
    // Cancel an active checkbox select.
    if (this.isCheckboxSelection) {
      this.isCheckboxSelection = false;
      this.svg.selectAll('g.y.axis g.tick [type="checkbox"]')
        .property('checked', false);
    }
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
    // Acquire the excludes from the preferences configuration.
    let prefConfig = this.configService.preferences.Collection;
    let prefExcludes = prefConfig.exclude;
    if (prefExcludes) {
      this.exclude = prefExcludes.split(/,\s*/);
    }

    // The select {topic: {label: path}} configuration.
    this.propertyChoices = this.createCorrelationConfiguration();
    // The select {path: {value: label}} configuration.
    this.valueChoices = this.configService.valueChoices;
    // The [[topic, label], ...] configuration.
    this.correlations = this.initialCorrelationChoices();
  }

  /**
   * Makes the initial correlation [[topic, label], ...]
   * configuration from the preferences configuration [Correlation]
   * section x and y entries.
   *
   * @method initialCorrelationChoices
   * @private
   * @return {string[][]} the correlation choices
   */
  private initialCorrelationChoices() {
    // The x and y label preference array is in the preferences
    // configuration.
    let prefConfig = this.configService.preferences.Collection;
    let unparsed = _.pick(prefConfig, 'x', 'y');

    // Convert the delimited preference strings to arrays.
    let parse = value => value.split(/\s*[,;:]\s*/);
    let parsed = _.mapValues(unparsed, parse);

    // Looks for the labels in the {topic: {label: path}} configuration.
    let topicWithLabel = label => {
      for (let topic in this.propertyChoices) {
        if (this.propertyChoices[topic][label]) {
          return topic;
        }
      }
    };
    //  Makes a path consisting of the topic which contains the
    // label followed by the label. If the label is not found in
    // any topic section, then this function throws an error.
    let qualifyLabel = label => {
      let topic = topicWithLabel(label);
      if (!topic) {
        // The property selection path was not found; complain.
        throw new Error('The preferences configuration Collection axis ' +
                        ` label was not found: ${ label }`);
      }
      // Return the topic.label path.
      return `${ topic }.${ label }`;
    };
    // The complete, valid preference topic.label paths.
    let qualifyLabels = labels => labels.map(qualifyLabel);
    let preferences = _.mapValues(parsed, qualifyLabels);

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
   *
   * @method createCorrelationConfiguration
   * @private
   * @return {Object} the chartable property configuration
   */
  private createCorrelationConfiguration() {
    // The clinical {topic: path} associative object.
    let clinical = this.configService.dataModel.Clinical;
    // The imaging {topic: path} associative object.
    let imaging = this.configService.dataModel.Imaging;
    // The combined top-level {topic: path} associative object.
    let top = _.assign({}, clinical, imaging);
    // The top-level paths.
    let topPaths = _.invert(top);

    // The label lookup to flatten. The lookup is parameterized
    // by the collection name.
    let lookup = this.configService.labelLookup[this.name];

    // Converts the path to a lookup section (ignoring the topic).
    let resolveLookup = (topic, path) =>
      path === 'this' ? lookup : _.get(lookup, path);
    // The top-level lookup {path: section}.
    let topLookup = _.mapValues(topPaths, resolveLookup);

    let flatten = (accum, section, path) => {
      let label = _.get(section, '_label.text');
      let nonLabel = label ? _.omit(section, '_label') : section;
      if (label && _.isEmpty(nonLabel)) {
        accum[path] = label;
      } else {
        let flattenChild = (value, key) => {
          let subpath = this.concatPath(key, path);
          if (!(subpath in topPaths)) {
            flatten(accum, value, subpath);
          }
        };
        _.forEach(nonLabel, flattenChild);
      }
    };

    // Converts the top-level lookup section to a property
    // {label: path} object.
    let flattenTop = topPath => {
      let section = topLookup[topPath];
      // Make a root traversal object.
      let root = {};
      root[topPath] = section;
      // Make the {label: path} object.
      let flattened = _.transform(root, flatten, {});
      // Collect the {path: domain} objects.
      let domains = this.getDomains(flattened);
      // Hold onto the domains for later use.
      _.assign(this.domains, domains);
      // Delete the missing properties.
      let hasDomain = path => path in domains;
      let cleaned = _.pickBy(flattened, hasDomain);
      // Fold in the expanded properties.
      for (let path in domains) {
        if (!(path in cleaned)) {
          cleaned[path] = this.getLabel(path);
        }
      }

      // Convert the {path: label} to the {label: path} object.
      return _.invert(cleaned);
    };

    // Return the {topic: config} object.
    return _.mapValues(top, flattenTop);
  }

  /**
   * Collects the
   * {{#crossLink "PropertyCollector/domains:property"}}{{/crossLink}}
   * for the given paths.
   *
   * @method getDomains
   * @param paths {Object|string[]} the starting paths
   * @return {Object} the {path: domain} lookup
   */
  private getDomains(paths: Object|string[]) {
    // The return object.
    let domains = {};

    let collectNumber = (value, path) => {
      let domain = domains[path];
      if (!domain) {
        domain = domains[path] = [value, value];
      } else if (!_.isArray(domain)) {
        throw new Error('Heterogeneous property domain not supported:' +
                        `property: ${ path } value: ${ value }`);
      } else {
        let [min, max] = domain;
        if (value < min) {
          domain[0] = value;
        }
        if (value > max) {
          domain[1] = value;
        }
      }
    };

    let collectDiscrete = (value, path) => {
      let domain = domains[path];
      if (!domain) {
        domain = domains[path] = {};
      } else if (!_.isPlainObject(domain)) {
        throw new Error('Heterogeneous property domain not supported:' +
                        `property: ${ path } value: ${ value }`);
      }
      domain[value] = true;
    };

    let isPublic = key => !key.startsWith('_');

    let collectObject = (object, path, parent) => {
      for (let key in object) {
        if (isPublic(key)) {
          let subpath = this.concatPath(key, path);
          let value = object[key];
          collectValue(value, subpath, object);
        }
      }
    };

    let isDiscrete = value =>
      _.isBoolean(value) || _.isString(value) || DateHelper.isDate(value);

    let collectValue = (value, path, parent) => {
      if (ObjectHelper.hasValidContent(value)) {
        if (isDiscrete(value)) {
          collectDiscrete(value, path);
        } else if (_.isNumber(value)) {
          collectNumber(value, path);
        } else if (_.isPlainObject(value) && value !== parent) {
          collectObject(value, path, parent);
        }
      }
    };

    let collectDomain = path => {
      for (let session of this.sessions) {
        let value = _.get(session, path);
        collectValue(value, path, session);
      }
    };

    // Build the {path, domain} object.
    for (let path in paths) {
      collectDomain(path);
    }
    // Convert each discrete domain to a sorted array.
    let convertDiscrete = domain =>
      _.isPlainObject(domain) ? _.keys(domain).sort() : domain;

    return _.mapValues(domains, convertDiscrete);
  }

  /**
   * Concatenates the parent path to the given key as follows:
   * * If there is not a path or the path is `this`, then return the key
   * * Otherwise, if the key is numeric, then return _path_`[`_key_`]`
   * * Otherwise, return _path_`.`_key_
   *
   * @method concatPath
   * @param key {string|number} the accessor
   * @param path {string} the optional parent property path
   * @return {string} the concatenated path
   */
  private concatPath(key, path?) {
    if (path && path !== 'this') {
      let suffix = _.isNumber(key) ? `[${ key }]` : '.' + key;
      return path + suffix;
    } else {
      return key;
    }
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
