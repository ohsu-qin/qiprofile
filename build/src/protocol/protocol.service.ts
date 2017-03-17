import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { ProtocolResource } from './protocol.resource.ts';

@Injectable()

// tslint:disable:max-line-length
/**
 * The protocol data access service. This service caches fetched
 * protocols, which are assumed to be immutable and few in number.
 * Protocol immutability is a`qirest-client`
 * [Protocol](http://qiprofile-rest-client.readthedocs.io/en/latest/api/model.html#qirest_client.model.imaging.Protocol)
 * database constraint.
 *
 * @module protocol
 * @class ProtocolService
 */
// tslint:enable:max-line-length
export class ProtocolService {
  constructor(private resource: ProtocolResource) { }

  /**
   * The cached protocol REST objectd.
   *
   * @property protocols {Object}
   * @private
   */
  private protocols = {};

  /**
   * Fetches the protocol based on the given REST database id.
   * If this service has a cached protocol which matches that
   * id, then that object is returned.
   * Otherwise, the object is fetched from the database and
   * cached.
   *
   * @method getProtocol
   * @param protocolId {string} the REST database id
   * @return {Observable<Object>} the protocol REST object, if found,
   *   otherwise null
   * @throws Error if the protocol was not found
   */
  getProtocol(protocolId: string): Observable<any> {
    // Check the cache first.
    let cached = this.protocols[protocolId];
    if (cached) {
      return Observable.of(cached);
    }

    // Not cached; hit the database.
    let searchParam: string = REST.where({_id: protocolId});
    // Fetch the protocol.
    let protocol: Observable<any> = this.resource.findOne(searchParam);

    // Return the fetched protocol, or null if there is no match.
    return protocol.map(fetched => {
      if (fetched) {
        // Cache the protocol object.
        this.protocols[protocolId] = fetched;
        // Pass the protocol along.
        return fetched;
      } else {
        throw new Error(
          `The protocol with id #{ protocolId } was not found`
        );
      }
    });
  }
}
