import * as _ from 'lodash';
import * as d3 from 'd3';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ConfigurationService } from '../configuration/configuration.service.ts';
import { PageComponent } from '../page/page.component.ts';
import { SubjectService } from '../subject/subject.service.ts';
import help from './collection.help.md';

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
   * The subject vs visit day sessions chart height allots
   * 18 pixels per subject.
   *
   * @property sessionsChartHeight {number}
   */

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
   * The subject objects.
   *
   * @property subjects {Object[]}
   * @private
   */
  private subjects: Object[];

  /**
   * The {topic: {path: label}} configuration.
   *
   * @property correlationConfig
   * @private
   */
  private correlationConfig: Object;


  /**
   * The tick values for a subject number axis.
   *
   * @property subjectAxisTickValues
   * @private
   */
  private subjectAxisTickValues: number[];

  /**
   * The axis callback sets the axis label and ticks.
   *
   * @property axis {function}
   */
   // Bind this to this rather than the caller in the
   // silly Javascript function dance.
   axis = (property: string, axis: Object) =>
    this._axis(property, axis);

  constructor(
    // private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private subjectService: SubjectService,
    private configService: ConfigurationService
  ) {
    super(help);

    // The initial chart data point accessors.
    //
    // TODO - get the Collection Correlation and Subject Detail
    // properties from the config file properties.cfg, e.g.:
    // [Demographics]
    // age
    // [Clinical]
    // tumorSize
    // [Modeling]
    // deltaKTrans
    //
    // pluck and plot all cln enc values.
    // for each node in path,
    // if value is array, collect from each item in array
    // make function getRecursive
    //

    // Get the sessions to display.
    let params = route.params.value;
    this.project = params.project;
    this.name = params.collection;
    subjectService.getSubjects(
      this.project, this.name
    ).do(subjects => {
      // Grab the subjects.
      this.subjects = subjects;
    }).map(subjects => {
      // Collect the sessions.
      return _.flow(_.map, _.flatten)(
        subjects, 'sessions'
      );
    }).subscribe(sessions => {
      this.sessions = sessions;
      this.initSessionChart();
      this.initCorrelationCharts();
    });
  }

  private initSessionChart() {
    this.subjectAxisTickValues = _.range(1, this.subjects.length + 1);
    // "nice" the ticks by adding a lower and upper tick.
    let yTickCnt = this.subjectAxisTickValues.length + 2;
    // The sessions chart accomodates both the axis label and the
    // session buttons along the axis.
    let yLegendSize = ('Subject'.length * 12) + 8;
    let plotHeight = (yTickCnt * 18) + 8;
    const pad = 18;
    this.sessionsChartHeight = pad + Math.max(yLegendSize, plotHeight);
  }

  private initCorrelationCharts() {
    // The {topic: {label: path}} configuration.
    this.correlationConfig = this.createCorrelationConfiguration();
    // The default correlation property paths.
    this.correlations = [
      {
        x: this.correlationConfig.Clinical.Surgery['Tumor Length'],
        y: this.correlationConfig.Imaging.Registration['delta Ktrans']
      }
    ];
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
    let baseConfig = this.configService.correlation;
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
    // The top-level entries.
    let top = _.pick(filtered, ['Clinical', 'Imaging']);
    // Fill out the top-level section.
    let flatten = (path, topic) => {
      let subsection = filtered[topic];
      return this.flattenSection(subsection, path, filtered);
    };
    // Each top-level section consists of {topic, path}
    // rather than {label, path} entries.
    let expand = section => _.mapValues(section, flatten);

    // Return the filtered, merged, flattened configuration.
    return _.mapValues(top, expand);
  }

  /**
   * Recursively flatten the section into an object consisting
   * only of {topic: {label: path}} entries.
   *
   * @method flattenSection
   * @private
   * @param section {string} the configuration section
   * @param path {string} the property path to the section
   * @param config {Object} the {topic, section} configuration
   */
  private flattenSection(section, path, config) {
    let flatten = (accum, entryPath, labelOrTopic) => {
      let flatPath = `${ path }.${ entryPath }`;
      let subsection = config[labelOrTopic];
      if (subsection) {
        let flattened = this.flattenSection(subsection, flatPath, config);
        _.assign(accum, flattened);
      } else {
        accum[labelOrTopic] = flatPath;
      }
    };

    return _.transform(section, flatten);
  }

  /**
   * The axis callback sets the axis label and ticks.
   *
   * @method axis
   * @private
   * @param property {string} the axis property
   * @param axis {Object} the D3 axis object
   */
  private _axis(property: string, axis: Object) {
    if (property.endsWith('subject.number')) {
      axis.tickValues(this.subjectAxisTickValues);
      // The ticks are integers.
      axis.tickFormat(d3.format('.0f'));
    }
  }

  /**
   * Returns the label for the given property name or property path.
   *
   * @method getLabel
   * @param property {Object} the property name or path
   */
  getLabel(property: string) {
    let terminal = _.last(property.split('.'));
    return this.configService.getLabel(terminal);
  }

  /**
   * Opens the Subect Detail page.
   *
   *
   * TODO - this belongs in the list pane item component.
   *
   * @method visitSubject
   * @param subject {Object} the subject REST object
   */
  visitSubject(subject) {
    this.subjectService.cache(subject);
    this.router.navigate(
      ['subject', subject.number],
      {relativeTo: this.route}
    );
  }
}
