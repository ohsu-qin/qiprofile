import {
  Component, Input, Output, OnInit, EventEmitter
} from '@angular/core';

import { ProtocolService } from './protocol.service.ts'

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

  @Output() fetched:  EventEmitter<Object> = new EventEmitter(true);

  /**
   * The protocol REST object to display.
   *
   * @property protocol {Object}
   */
  protocol: Object;

  constructor(private protocolService: ProtocolService) {
  }

  ngOnInit() {
    // Fetch the protocol.
    let fetcher = this.protocolService.getProtocol(this.protocolId);
    fetcher.subscribe(protocol => {
      if (protocol) {
        this.protocol = protocol;
        this.fetched.emit(protocol);
      } else {
        throw new Error(
          `The protocol with id ${ this.protocolId } was not found`
        );
      }
    });
  }
}
