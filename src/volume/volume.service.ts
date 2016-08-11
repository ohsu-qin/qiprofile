import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SessionService } from '../session/session.service.ts';

@Injectable()

/**
 * The volume data access service.
 *
 * @class VolumeService
 */
export class VolumeService {
  constructor(private sessionService: SessionService) {}
  
  /**
   * Makes the {_sequence_, _number_} secondary
   * key from the given route parameters, where:
   * * _sequence_ is the parent image sequence secondary key
   * * _number_ is the _volume_ parameter
   * The image sequence secondary key is the scan or registration
   * number and the sequence parent secondary key, recursively
   * defined up to the subject secondary key.
   *
   * @example
   *     {
   *       scan: {
   *         session: {
   *           subject: {project: 'QIN', collection: 'Breast', number: 4},
   *           number: 3
   *         },
   *         number: 1
   *       },
   *       number: 12
   *     }
   *
   * @method secondaryKey
   * @param params {Object} the route parameters
   * @return {Object} the corresponding secondary key
   */
  secondaryKey(routeParams: Object) {
    // The subject secondary key.
    let session = this.sessionService.secondaryKey(routeParams);
    let scan = {session: session, number: +routeParams.scan};
    // The volume number.
    let volume = +routeParams.volume;
    // The parent is either the scan or a registration.
    let regParam = routeParams.registration;
    if (regParam) {
      return {registration: {scan: scan, number: +regParam}, number: volume};
    } else {
      return {scan: scan, number: volume};
    }
  }

  /**
   * @method getVolume
   * @param routeParams {Object} the route parameters
   * @return {any} the REST volume image object, or null if not found
   */
  getVolume(routeParams: Object): Observable<any> {
    // Fetch the session detail.
    let sessionFinder = this.sessionService.getSession(routeParams, true);
    
    // Find the volume.
    return sessionFinder.map(
      session => session ? this.findVolume(routeParams, session) : session
    );
  }
  
  /**
   * @method findVolume
   * @param routeParams {Object} the route parameters
   * @param session {Object} the session object holding the volume
   * @return {any} the REST volume image object, or null if not found
   */
  private findVolume(routeParams: Object, session: Object) {
    // There must be a scan.
    let scanNbr = +routeParams.scan;
    let scan = _.find(session.scans, s => s.number === scanNbr);
    if (!scan) {
      return null;
    }
    // The parent is either the scan or a registration.
    let imageSequence;
    let regParam = routeParams.registration;
    if (regParam) {
      let regNdx = +regParam - 1;
      imageSequence = scan.registrations[regNdx];
    } else {
      imageSequence = scan;
    }
    // The volumes object holds the volume images array.
    let volumes = imageSequence.volumes;
    if (!volumes || !volumes.images) {
      return null;
    }
    // The volume index is one less than the volume number.
    let volNdx = +routeParams.volume - 1;
    
    return volumes.images[volNdx];
  }
}
