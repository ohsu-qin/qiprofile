import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import Subject from '../subject/subject.data.coffee';
import Session from '../session/session.data.coffee';
import Scan from '../session/scan.data.coffee';
import Registration from '../session/registration.data.coffee';
import Volume from './volume.data.coffee';
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
   * Makes a place-holder volume sufficient to display a title.
   * The place-holder extends the
   * {{#crossLink "VolumeService/secondaryKey"}}{{/crossLink}}
   * using the various data utility service `extend` methods,
   * which in turn enables the {{#crossLink "Volume/title"}}{{/crossLink}}
   * virtual property.
   *
   * @method placeHolder
   * @param routeParams {Object} the route parameters
   * @return {Volume} the place-holder volume object
   */
  placeHolder(routeParams: Object) {
    // The bare-bones volume object.
    let volume = this.secondaryKey(routeParams);
    // Fill in enough of the volume hierarchy to display a title.
    let scan;
    let reg = volume.registration;
    if (reg) {
      scan = reg.scan;
      Scan.extend(scan, scan.session);
      reg._cls = 'Registration';
      Registration.extend(reg, scan, reg.number);
      Volume.extend(volume, reg, volume.number);
    } else {
      scan = volume.scan;
      scan._cls = 'Scan';
      Scan.extend(scan, scan.session);
      Volume.extend(volume, scan, volume.number);
    }
    Subject.extend(scan.session.subject);
    Session.extend(scan.session, scan.session.subject, scan.session.number);
    
    return volume;
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
