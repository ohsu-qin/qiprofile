import * as _ from 'lodash';
import { Observable } from 'rxjs';
import {
  Component, ChangeDetectionStrategy, ChangeDetectorRef, HostListener
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import ObjectHelper from '../common/object-helper.coffee';
import {
  ConfigurationService
} from '../configuration/configuration.service.ts';
import { PageComponent } from '../page/page.component.ts';
import ImageStore from '../image/image-store.coffee';
import Subject from './subject.data.coffee';
import { SubjectService } from './subject.service.ts';

/**
 * A time line clinical encounter is designated by the HTML
 * nabla special character (the wedge-like math del operator).
 *
 * @property WEDGE {string}
 * @private
 * @static
 */
const WEDGE = '\u2207';

/**
 * The demographics properties.
 *
 * @property DEMOGRAPHICS_PROPERTIES {string[]}
 * @private
 * @static
 */
const DEMOGRAPHICS_PROPERTIES = ['age', 'gender', 'races', 'ethnicity'];

@Component({
  selector: 'qi-subject',
  templateUrl: '/public/html/subject/subject.html',
  // Instruct Angular to disable change detection until this
  // component tells it to do so.
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * The Subject Detail page component.
 *
 * @class SubjectComponent
 */
export class SubjectComponent extends PageComponent {
  /**
   * The subject to display.
   *
   * @property subject {Object}
   */
  subject: Object;

  /**
   * The subject demographics sub-object.
   *
   * @property demographics {Object}
   */
  get demographics(): Object {
    return _.pick(this.subject, DEMOGRAPHICS_PROPERTIES);
  }

  /**
   * A
   * {{#crossLink "SubjectComponent/getLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property label {function}
   */
  const label = property => this.getLabel(property);

  /**
   * The discrete property {path: {value: label}} tick label choices.
   *
   * @property valueChoices {Object}
   */
  valueChoices: Object;

  /**
   * The project name.
   *
   * @property project {string}
   * @readOnly
   */
  get project(): string  {
    return this.subject ? this.subject.project : null;
  }

  /**
   * The time line text is a wedge special symbol for a
   * clinical encounter, the session number otherwise.
   *
   * @property timeLineText {function}
   */
  timeLineText = (encounter: Object) => {
    return this._timeLineText(encounter);
  }

  /**
   * The
   * {{#crossLink "SubjectComponent/subject:property"}}{{/crossLink}}
   * encounters.
   *
   * @property encounters
   * @return {Object[]} the subject encounters
   */
  get encounters() {
    return _.get(this.subject, 'encounters');
  }

  /**
   * The time line class is the lower case dasherized REST
   * data object class.
   *
   * @property encounterDataClass {function}
   */
  encounterDataClass = (encounter: Object) => {
    return this._encounterDataClass(encounter);
  }

  /**
   * The
   * {{#crossLink "TimeLineDirective/legend"}}{{/crossLink}}
   * specification, consisting of the {_dataClass_: {label}}
   * settings for the encounter data classes. The
   * {{#crossLink "TimeLineDirective/legend"}}{{/crossLink}}
   * defaults suffice for all other legend settings.
   *
   * @property legend {Object}
   */
  get legend() {
    return this._legend();
  }

  /**
   * The
   * {{#crossLink "SubjectComponent/subject:property"}}{{/crossLink}}
   * treatments, ordered with the primary treatment first so that it
   * will overlay any overlapping neodajuvant or adjuvant treatment.
   *
   * @property treatments
   * @return {Object[]} the subject treatments
   */
  get treatments() {
    if (this.subject) {
      let isPrimary = trt => trt.treatmentType === 'Primary';
      let primary = _.find(this.subject.treatments, isPrimary);
      if (primary) {
        let others = _.without(this.subject.treatments, primary);
        return others.concat([primary]);
      } else {
        return this.subject.treatments;
      }
    }
  }

  /**
   * The comma-delimited
   * {{#crossLink "SubjectComponent/subject:property"}}{{/crossLink}}
   * clinical demographics, encounter and treatment HTML element ids.
   *
   * @property clinicalHtmlIdsSequence {string}
   */
  get clinicalHtmlIdsSequence(): string {
    let clnEncs = this.subject.clinicalEncounters;
    let clnEncIds = clnEncs.map(this.clinicalEncounterHtmlId);
    let treatmentId = (trt, i) => 'treatment-' + (i + 1);
    let trtIds = this.subject.treatments.map(treatmentId);
    let dmg = _.isEmpty(this.demographics) ? [] : 'demographics';

    return _.flatten([dmg, clnEncIds, trtIds]).join(', ');
  }

  /**
   * The time line width. Given the Subject page formatting,
   * this width is computed as 60% of the document body width.
   *
   * @property timeLineWidth {number}
   */
  timeLineWidth: number;

  constructor(
    private router: Router, private route: ActivatedRoute,
    modalService: NgbModal,
    subjectService: SubjectService,
    private configService: ConfigurationService,
    changeDetector: ChangeDetectorRef
  ) {
    super(modalService);

    // The route/query parameters.
    let params = this.route.params.value;

    // The select {path: {value: label}} configuration.
    this.valueChoices = this.configService.valueChoices;

    // A place-holder subject sufficient to get a title.
    this.subject = subjectService.secondaryKey(params);
    Subject.extend(this.subject);
    // Fetch the real subject.
    subjectService.getSubject(params).subscribe(subject => {
      if (subject) {
        this.subject = subject;
      } else {
        this.error = `${ this.subject.title } was not found`;
      }
      // Tell Angular to digest the change.
      changeDetector.markForCheck();
    });

    // The initial time line width.
    this.timeLineWidth = this.computeTimeLineWidth();
    // Recompute the time line width on resize.
    Observable.fromEvent(window, 'resize')
      .debounceTime(500)
      .subscribe((event) => {
        this.timeLineWidth = this.computeTimeLineWidth();
        // Tell Angular to digest the change.
        changeDetector.markForCheck();
      });
  }

  /**
   * Delegates to
   * {{#crossLink "ConfigurationService/getHTMLLabel"}}{{/crossLink}},
   *
   * @method getLabel
   * @param property {string} the property path
   * @return {string} the display HTML label
   */
  getLabel(property: string): string {
    return this.configService.getHTMLLabel(property, this.subject.collection);
  }

  /**
   * @method clinicalEncounterHtmlId
   * @param encounter {Object} the encounter object
   * @param index {number} the clinical encounter array index
   * @return {string} the encounter _title_-_index_ HTML id
   */
  clinicalEncounterHtmlId(encounter: Object, index: number): string {
    return encounter.title.toLowerCase() + '-' + (index + 1);
  }

  /**
   * Delegates to
   * {{#crossLink "ObjectHelper/hasValidContent"}}{{/crossLink}}.
   *
   * @method has
   * @param value {any} the value to check
   * @return {boolean} whether the value has displayable content
   */
  has(value: any): boolean {
    return ObjectHelper.hasValidContent(value);
  }

  /**
   * @method hasDemographics
   * @return {boolean} whether there is at least one non-empty
   *   {{#crossLink "SubjectComponent/demographics:property"}}{{/crossLink}}
   *   property value
   */
  hasDemographics(): boolean {
    return !_.isEmpty(this.demographics);
  }

  /**
   * Returns the image {{#crossLink "ImageStore"}}{{/crossLink}}
   * file location.
   *
   * @method location
   * @param image {Image} the image object
   * @return {string} the server image file path relative to the server
   *   web app root
   */
  location(image: Object): string {
    return ImageStore.location(image);
  }

  /**
   * Opens the Session Detail page.
   *
   * @method visitSession
   * @param session {Object} the session REST object
   */
  visitSession(session: Object) {
    // For now, go directly to the scan display.
    // TODO - navigate to an intermediate Session Detail page.
    this.router.navigate(
      ['session', session.number, 'scan', 1, 'volumes'],
      {relativeTo: this.route}
    );
  }

  /**
   * The time line is 60% as wide as the document body
   * above the small device responsive breakpoint, 90%
   * below. The small device breakpoint is 768 per
   * the [Bootstrap CSS guide](http://getbootstrap.com/css/).
   *
   * @method computeTimeLineWidth
   * @private
   * @returns {number} the time line width
   */
  private computeTimeLineWidth(): number {
    // The body has a 4-point horizontal padding below the
    // breakpoint.
    const BREAKPOINT = 768 - 8;
    let rect = document.body.getBoundingClientRect();
    let isCollapsed = rect.width < BREAKPOINT;
    let factor = isCollapsed ? 0.9 : 0.6;
    return Math.floor(rect.width * factor);
  }

  /**
   * @method _timeLineText
   * @param encounter {Object} the encounter REST data object
   * @return {string} the SVG text element inner text string
   */
  private _timeLineText(encounter: Object): string  {
    return encounter.isClinical() ? WEDGE : encounter.number;
  }

  /**
   * @method _encounterDataClass
   * @private
   * @param encounter {Object} the encounter REST data object
   * @return {string} the data class
   */
  private _encounterDataClass(encounter: Object): string {
    let klass = encounter._cls;
    // Left-truncate the surgery specialization class names.
    if (klass.endsWith('Surgery')) {
      klass = 'Surgery';
    }
    return klass;
  }

  /**
   * Returns the
   * {{#crossLink "SubjectComponent/legend:property"}}{{/crossLink}}
   * specification.
   *
   * @method _legend
   * @private
   * @return {Object} the legend specification
   */
  private _legend() {
    // The clinical encounters ordered by date.
    let clnEncounters = _.sortBy(this.subject.clinicalEncounters, 'date');
    // The encounter data classes.
    let clnCasses = _.uniq(clnEncounters.map(this.encounterDataClass));
    // The clinical legend label is the wedge character.
    let accumClinicalLegends = (accum, dataClass) => {
      accum[dataClass] = {label: WEDGE};
    };
    let legends = _.transform(clnCasses, accumClinicalLegends, {});

    // The session legend label is the session number range.
    legends['Session'] = {
      label: `1-${ this.subject.sessions.length }`,
      name: 'Imaging Visit'
    };

    return legends;
  }
}
