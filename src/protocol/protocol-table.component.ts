import * as _ from 'lodash';
import * as _s from 'underscore.string';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'qi-protocol-table',
  templateUrl: '/public/html/protocol/protocol-table.html'
})

/**
 * The {{#crossLink "ProtocolComponent"}}{{/crossLink}} table
 * subcomponent.
 *
 * @module protocol
 * @class ProtocolTableComponent
 */
export class ProtocolTableComponent implements OnChanges {
  /**
   * The input protocol object.
   *
   * @property protocol {Object}
   */
  @Input() protocol: Object;

  /**
   * A
   * {{#crossLink "ProtocolTableComponent/getLabel"}}{{/crossLink}}
   * wrapper that can be used in templates.
   *
   * @property label {function}
   */
  const label = property => this.getLabel(property);

  ngOnChanges(changes: SimpleChanges) {
    // Fetch the protocol.
    console.log(`>>pcl Changed: ${ changes.protocol.previousValue } -> ${ changes.protocol.currentValue }`);
  }

  /**
   * Formats the protocol configuration property sheet row
   * label as the underscored unqualified input property
   * name, e.g. `r10_val` for input `r1.r10Val`, as opposed
   * to the default
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * transformer.
   *
   * Note that the property path is relative to the
   * {{#crossLink "PropertyTableComponent/object"}}{{/crossLink}},
   * so a compound path is disambiguated as a nested property
   * underscore the parent property. For example, input
   * `configuration.r1.r10Val` displays as:
   *
   *     +---------+----------------+
   *     |  Configuration           |
   *     +---------+----------------+
   *     |   r1                     |
   *     | +---------+------------+ |
   *     | | r10_val +   ....     | +
   *     | +---------+------------+ |
   *     | + ....                 | |
   *     | +---------+------------+ |
   *     +---------+----------------+
   *
   * The input property name is the camelCase transformation of
   * the REST input JSON object property, which is customarily
   * obtained from a Python imaging pipeline. In that case, this
   *`getLabel` function restores the upstream Python property
   * naming convention.
   *
   * The top-level protocol ``technique`` and ``configuration``
   * properties display using the default
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * transformer.
   *
   * @method getLabel
   * @param property {string} the input property path
   * @return {string} the unmodified property name
   */
  private getLabel(property: string) {
    if (_.includes(property, '.')) {
      let last = _.last(property.split('.'));
      return _s.underscored(last);
    }
  }
}
