import * as _ from 'lodash';
import {
  Component, ViewContainerRef,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap/index.js';

import ObjectHelper from '../object/object-helper.coffee';
import StringHelper from '../string/string-helper.coffee';
import {
  ConfigurationService
} from '../configuration/configuration.service.ts';
import { PageComponent } from '../page/page.component.ts';
import Subject from './subject.data.coffee';
import { SubjectService } from './subject.service.ts';
import help from './subject.help.md';
import breastTnmStageHelp from '../clinical/breast-tnm-stage.help.md';
import sarcomaTnmStageHelp from '../clinical/sarcoma-tnm-stage.help.md';
import dosageAmountHelp from '../clinical/dosage-amount.help.md';

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
   * A
   * {{#crossLink "SubjectComponent/getLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property label {function}
   */
  const label = (property: string) => this.getLabel(property);

  /**
   * The project name.
   *
   * @property project {string}
   * @readOnly
   */
  get project(): string {
    return this.subject ? this.subject.project : null;
  }

  /**
   * The {property: label} associative object, where *property*
   * is the property path relative to the subject.
   *
   * @property labelLookup {Object}
   * @private
   */
  private labelLookup: Object;

  constructor(
    private router: Router, private route: ActivatedRoute,
    vcRef: ViewContainerRef, overlay: Overlay, private modal: Modal,
    service: SubjectService,
    configService: ConfigurationService,
    changeDetector: ChangeDetectorRef
  ) {
    super(help);

    // Prep the modal.
    overlay.defaultViewContainer = vcRef;
    // The route/query parameters.
    let params = this.route.params.value;

    // Make the property => label lookup.
    this.labelLookup = this.createLabelLookup(configService.dataModel);

    // A place-holder subject sufficient to get a title.
    this.subject = service.secondaryKey(params);
    Subject.extend(this.subject);
    // Fetch the real subject.
    service.getSubject(params).subscribe(subject => {
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
   * Shows the dosage amount help pop-up.
   *
   * @method dosageAmountHelp
   */
  openRecurrenceScoreHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Dosage Amount')
      .body(dosageAmountHelp)
      .open();
  }

  /**
   * Shows the dosage amount help pop-up.
   *
   * @method dosageAmountHelp
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
   * Gets the label for the given clinical property.
   * This method supplants the default
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * to search for the property in the
   * {{#crossLink "ConfigurationService/dataModel:property"}}{{/crossLink}}.
   * If the property is not a unique value in a data model
   * {label: property} section, then this method delegates to
   * {{#crossLink "StringHelper/labelize"}}{{/crossLink}}.
   *
   * @method getLabel
   * @param property {string} the property name
   */
  getLabel(property: string): string {
    return this.labelLookup[property] || StringHelper.labelize(property);
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

  private createLabelLookup(dataModel) {
    // Returns whether the label is not a key in the dataModel.
    let isLeaf = (prop, label) => !(label in dataModel);
    // Collect the section leaf items.
    let accumLeaves = section => _.pickBy(section, isLeaf);
    let leaves = _.values(dataModel).map(accumLeaves);

    // Remove ambiguous {property: label} associations.
    let isAmbiguous = (prop, label) => {
      let match = section => {
        let other = section[label];
        return other && other != prop;
      }
      return _.some(leaves, match);
    }
    let removeAmbiguous = section => _.remove(section, isAmbiguous);
    _.forEach(leaves, removeAmbiguous);

    // Collect the section {label: property} items into
    // a flat {property: label} lookup.
    let accumInverse = (accum, section) =>
      _.assign(accum, _.invert(section));

    return _.reduce(leaves, accumInverse, {});
  }
}
