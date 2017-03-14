import * as _ from 'lodash';
import * as _s from 'underscore.string';
import { Component, Input, OnInit } from '@angular/core';

import { ProtocolService } from './protocol.service.ts';

@Component({
  selector: 'qi-protocol',
  templateUrl: '/public/html/protocol/protocol.html'
})

/**
 * The protocol component.
 *
 * @module protocol
 * @class ProtocolComponent
 */
export class ProtocolComponent implements OnInit {
  /**
   * The input protocol database id.
   *
   * @property protocolId {string}
   */
  @Input() protocolId: string;

  /**
   * The protocol REST object to display.
   *
   * @property protocol {Object}
   */
  protocol: Object;

  constructor(private protocolService: ProtocolService) { }

  ngOnInit() {
    // The protocol.
    this.protocol = this.protocolService.getProtocol(this.protocolId);
    // this.protocol = fetcher.subscribe(protocol => {
    //   if (protocol) {
    //     this.protocol = protocol;
    //   } else {
    //     throw new Error(
    //       `The protocol with id ${ this.protocolId } was not found`
    //     );
    //   }
    // });
  }
}
