import * as _ from 'lodash';
import {
  Component, Input, ViewContainerRef, ViewChild
} from '@angular/core';

@Component({
  selector: 'qi-modeling',
  templateUrl: '/public/html/modeling/modeling.html'
})

/**
 * The modeling component displays the subject modeling results.
 *
 * @module modeling
 * @class ModelingComponent
 */
export class ModelingComponent {
  /**
   * The subject {{#crossLink "ModelingResults"}}{{/crossLink}}
   * REST object to display.
   *
   * @property modeling {Object}
   */
  @Input() modeling: Object;

  /**
   * The mandatory label lookup function. This input is set by
   * the parent {{#crossLink "SubjectComponent"}}{{/crossLink}}.
   *
   * @property label {function}
   */
  @Input() label: (string) => string;

  // /**
  //  * The modeling protocol REST object.
  //  *
  //  * @property modelingProtocol {Object}
  //  */
  // modelingProtocol: Object;

  constructor() { }

  /**
   * Rounds the modeling result to two decimals.
   *
   * @method formatModelingResult
   * @param value {number} the value to format
   * @return {number} the rounded value
   */
  formatModelingResult(value: number): number {
    return _.isNil(value) ? value : _.round(value, 2);
  }
}
