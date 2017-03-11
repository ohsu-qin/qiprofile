import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { ProtocolResource } from './protocol.resource.ts';

@Injectable()

/**
 * The protocol data access service.
 *
 * @module protocol
 * @class ProtocolService
 */
export class ProtocolService {
  constructor(private resource: ProtocolResource) { }

  /**
   * The cached protocol REST object.
   *
   * @property protocol {Object}
   * @private
   */
  private protocol: Object;

  /**
   * Fetches the protocol based on the given REST database id.
   * If this service has a cached protocol which matches that id,
   * then that object is returned.
   * Otherwise, the object is fetched from the database and cached.
   *
   * @method getProtocol
   * @param protocolId {string} the REST database id
   * @return {Observable<any>} the protocol REST object, if found,
   *   otherwise null
   */
  getProtocol(protocolId: string): Observable<any> {
    // Check the cache first.
    if (this.protocol && this.protocol._id === protocolId) {
      return Observable.of(this.protocol);
    }

    // Not cached; hit the database.
    let searchParam: string = REST.where({_id: protocolId});
    // Fetch the protocol.
    let protocol: Observable<any> = this.resource.findOne(searchParam);

    // Return the cached protocol.
    return protocol.map(fetched => {
      if (fetched) {
        this.protocol = fetched;
      }
      return fetched;
    });
  }
}
