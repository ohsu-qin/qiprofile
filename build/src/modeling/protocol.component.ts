import * as _ from 'lodash';
import * as _s from 'underscore.string';
import { Component, Input, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'qi-modeling-protocol',
  templateUrl: '/public/html/modeling/protocol.html'
})

/**
 * The modeling protocol component displays the protocol
 * technique and protocol info button.
 *
 * @module modeling
 * @class ModelingProtocolComponent
 */
export class ModelingProtocolComponent implements OnChanges {
  /**
   * The protocol REST object to display.
   *
   * @property protocol {Object}
   */
  @Input() protocol: Object;

  /**
   * A
   * {{#crossLink "ModelingProtocolComponent/getLabel"}}{{/crossLink}}
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

  /**
   * Formats the protocol property labels. The top-level properties,
   * .e.g. *configuration*, display using the default
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * transformer. The configuration properties are formatted as the
   * underscored unqualified input property name, e.g. `r10_val` for input `r1.r10Val`, as opposed
   * to the default
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * transformer.
   *
   * @example
   *   A protocol with nested configuration property`r1.r10_val`
   *   displays as:
   *
   *       +---------+----------------+
   *       |  Configuration           |
   *       +---------+----------------+
   *       |   r1                     |
   *       | +---------+------------+ |
   *       | | r10_val +   ....     | +
   *       | +---------+------------+ |
   *       | + ....                 | |
   *       | +---------+------------+ |
   *       +---------+----------------+
   *
   * The input property name is the camelCase transformation of
   * the REST input JSON object property, which is customarily
   * obtained from a Python imaging pipeline. In that case, this
   * `getLabel` function restores the upstream Python property
   * naming convention.
   *
   * @method getLabel
   * @param property {string} the input property path
   * @return {string} the unmodified property name
   */
  getLabel(property: string) {
    if (_.includes(property, '.')) {
      let last = _.last(property.split('.'));
      return _s.underscored(last);
    }
  }
}
