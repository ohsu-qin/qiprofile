import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Component, Input, OnInit } from '@angular/core';

import { ProtocolService } from '../protocol/protocol.service.ts';

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
export class ModelingComponent implements OnInit {
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
  @Input() label: (value: string) => string;

  /**
   * The observable which resolves to the modeling source protocol
   * REST object.
   *
   * @property sourceProtocol {Observable}
   */
  sourceProtocol: Observable;

  /**
   * The observable which resolves to the modeling protocol REST object.
   *
   * @property modelingProtocol {Observable}
   */
  modelingProtocol: Observable;

  constructor(private protocolService: ProtocolService) { }

  ngOnInit() {
    // Fetch the source protocol.
    this.sourceProtocol = this.protocolService.getProtocol(
      this.modeling.source.protocol
    );
    // Fetch the modleing protocol.
    this.modelingProtocol = this.protocolService.getProtocol(
      this.modeling.protocol
    );
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
}
