import * as _ from 'lodash';
import * as _s from 'underscore.string';
import { Component, Input, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'qi-modeling-source',
  templateUrl: '/public/html/modeling/source.html'
})

/**
 * The modeling source component displays the source type
 * and the protocol info button.
 *
 * @module modeling
 * @class ModelingSourceComponent
 */
export class ModelingSourceComponent implements OnChanges {
  /**
   * The source type, e.g.`Scan`.
   *
   * @property type {string}
   */
  @Input() type: string;

  /**
   * The protocol REST object to display.
   *
   * @property protocol {Object}
   */
  @Input() protocol: Object;

  /**
   * A
   * {{#crossLink "ModelingSourceComponent/getLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property label {function}
   */
  const label = property => this.getLabel(property);

  constructor(private modalService: NgbModal) { }

  /**
   * Displays the protocol property sheet in a modal dialog.
   *
   * @property content {TemplateRef}
   */
  open(content: TemplateRef) {
    this.modalService.open(content);
  }
}
