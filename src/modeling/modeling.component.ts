import * as _ from 'lodash';
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
  @Input() label: (string) => string;

  /**
   * The modeling source protocol REST object.
   *
   * @property sourceProtocol {Object}
   */
  sourceProtocol: Object;

  /**
   * The modeling protocol REST object.
   *
   * @property modelingProtocol {Object}
   */
  modelingProtocol: Object;

  constructor(private protocolService: ProtocolService) { }

  ngOnInit() {
    // Fetch the protocols.
    let srcPclFetcher = this.protocolService.getProtocol(
      this.modeling.source.protocol
    );
    srcPclFetcher.subscribe(protocol => {
      if (protocol) {
        this.sourceProtocol = protocol;
      } else {
        throw new Error(
          'The modeling source protocol with id' +
          this.modeling.source.protocol +
          'was not found'
        );
      }
    });

    let mdlPclFetcher = this.protocolService.getProtocol(
      this.modeling.protocol
    );
    mdlPclFetcher.subscribe(protocol => {
      if (protocol) {
        this.modelingProtocol = protocol;
      } else {
        throw new Error(
          'The modeling protocol with id' +
          this.modeling.protocol +
          'was not found'
        );
      }
    });
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
