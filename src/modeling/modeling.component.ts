import * as _ from 'lodash';
import {
  Component, Input, ViewContainerRef, ViewChild
} from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap/index.js';

import { ModelingInfoComponent } from './modeling-info.component.ts';

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
  @Input() modeling;

  @ViewChild(ModelingInfoComponent) info: ModelingInfoComponent;

  constructor(
    vcRef: ViewContainerRef, overlay: Overlay, private modal: Modal
  ) {
    // Prep the modal in the obscure idiom favored by angular2-modal.
    overlay.defaultViewContainer = vcRef;
  }

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

  /**
   * Opens the Modeling Info pop-up.
   *
   * @method openModelingInfo
   * @param source {Object} the REST
   *   {{#crossLink "ModelingResults"}}{{/crossLink}} data object
   */
  openModelingInfo(modeling: Object) {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Modeling Input')
      .body(this.info.innerHTML)
      .open();
  }
}
