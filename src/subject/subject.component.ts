import * as _ from 'lodash';
import {
  Component, ViewContainerRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap/index.js';

import ObjectHelper from '../object/object-helper.coffee';
import {
  ConfigurationService
} from '../configuration/configuration.service.ts';
import { PageComponent } from '../page/page.component.ts';
import Subject from './subject.data.coffee';
import { SubjectService } from './subject.service.ts';
import help from './subject.help.md';
import modelingHelp from './modeling.help.md';
import breastTnmStageHelp from '../clinical/breast-tnm-stage.help.md';
import sarcomaTnmStageHelp from '../clinical/sarcoma-tnm-stage.help.md';
import recurrenceScoreHelp from '../clinical/recurrence-score.help.md';
import rcbHelp from '../clinical/breast-rcb.help.md';
import dosageAmountHelp from '../clinical/dosage-amount.help.md';

/**
 * The modeling display formats, `chart` or `table`.
 *
 * @property MODELING_FORMATS {string}
 * @private
 * @static
 */
const MODELING_FORMATS = ['chart', 'table'];

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
   * The modeling display format, `chart` or `table`.
   *
   * @property modelingFormat {string}
   */
  get modelingFormat(): string {
    return MODELING_FORMATS[this._modelingFormatIndex];
  }

  /**
   * A
   * {{#crossLink "SubjectComponent/getLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property label {function}
   */
  const label = (property: string) => this.getLabel(property);

  /**
   * A
   * {{#crossLink "SubjectComponent/getGenomicsLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property genomicsLabel {function}
   */
  const genomicsLabel = (property: string) =>
    this.getGenomicsLabel(property);

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
   * The
   * {{#crossLink "SubjectComponent/MODELING_FORMATS:property"}}{{/crossLink}}
   * index to obtain the
   * {{#crossLink "SubjectComponent/modelingFormat:property"}}{{/crossLink}}.
   *
   * @property _modelingFormatIndex {number}
   * @private
   */
  private _modelingFormatIndex = 0;

  constructor(
    private router: Router, private route: ActivatedRoute,
    vcRef: ViewContainerRef, overlay: Overlay, private modal: Modal,
    subjectService: SubjectService,
    private configService: ConfigurationService,
    changeDetector: ChangeDetectorRef
  ) {
    super(help);

    // Prep the modal in the obscure idiom favored by Angular.
    overlay.defaultViewContainer = vcRef;
    // The route/query parameters.
    let params = this.route.params.value;

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
  }

  /**
   * Delegates to
   * {{#crossLink "ConfigurationService/getHTMLLabel"}}{{/crossLink}},
   *
   * @method getLabel
   * @param property {string} the property path
   * @return {string} the display HTML label
   */
  getLabel(property: string) {
    return this.configService.getHTMLLabel(property, this.subject.collection);
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
   * Sets the
   * {{#crossLink "SubjectComponent/modelingFormat:property"}}{{/crossLink}}
   * to the other value.
   *
   * @method tnmStageHelp
   * @raise {Error} if the collection does not have help
   */
  toggleModelingFormat() {
    this._modelingFormatIndex =
      (this._modelingFormatIndex + 1) % MODELING_FORMATS.length;
  }

  /**
   * Shows the PK modeling help pop-up.
   *
   * @method openModelingHelp
   */
  openModelingHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Pharmokinetic Modeling')
      .body(modelingHelp)
      .open();
  }

  /**
   * Shows the TNM stage modal help pop-up. The help is
   * specialized for the subject collection.
   *
   * @method tnmStageHelp
   * @raise {Error} if the collection does not have help
   */
  openTNMStageHelp() {
    let help;
    if (this.subject.collection === 'Breast') {
      help = breastTnmStageHelp;
    } else if (this.subject.collection === 'Sarcoma') {
      help = sarcomaTnmStageHelp;
    } else {
      throw new Error('There is no help for collection' +
                      this.subject.collection);
    }

    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('TNM Stage')
      .body(help)
      .open();
  }

  /**
   * Shows the recurrence score help pop-up.
   *
   * @method openRecurrenceScoreHelp
   */
  openRecurrenceScoreHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Recurrence Score')
      .body(recurrenceScoreHelp)
      .open();
  }

  /**
   * Shows the RCB help pop-up.
   *
   * @method openRCBHelp
   */
  openRCBHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Residual Cancer Burden')
      .body(rcbHelp)
      .open();
  }

  /**
   * Shows the dosage amount help pop-up.
   *
   * @method openDosageAmountHelp
   */
  openDosageAmountHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Dosage Amount')
      .body(dosageAmountHelp)
      .open();
  }

  /**
   * Opens the Session Detail page.
   *
   * @method visitSession
   * @param session {Object} the session REST object
   */
  visitSession(session: Object) {
    this.router.navigate(
      ['session', session.number],
      {relativeTo: this.route}
    );
  }
}
