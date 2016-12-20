import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import Subject from '../subject/subject.data.coffee';
import Session from '../session/session.data.coffee';
import Scan from '../session/scan.data.coffee';
import Registration from '../session/registration.data.coffee';
import { SessionService } from '../session/session.service.ts';

@Injectable()

/**
 * The IamgeSequenceService data access service.
 *
 * @class IamgeSequenceService
 */
export class ImageSequenceService {
  constructor(private sessionService: SessionService) { }

  /**
   * Makes the image sequence secondary key from the given
   * route parameters. The image sequence secondary key is
   * the scan or registration number and the sequence parent
   * secondary key, recursively defined up to the subject
   * secondary key.
   *
   * @example
   *     secondaryKey({
   *       project: 'QIN', collection: 'Breast', subject: '4',
   *       session: 3, scan: 1, registration: 1
   *     }) =>
   *     {
   *       scan: {
   *         session: {
   *           subject: {project: 'QIN', collection: 'Breast', number: 4},
   *           number: 3
   *         },
   *         number: 1
   *       },
   *       number: 1
   *     }
   *
   * @method secondaryKey
   * @param routeParams {Object} the route parameters
   * @return {Object} the corresponding secondary key
   */
  secondaryKey(routeParams: Object) {
    // The subject secondary key.
    let session = this.sessionService.secondaryKey(routeParams);
    let scan = { _cls: 'Scan', session: session, number: +routeParams.scan };
    // The parent is either the scan or a registration.
    let regParam = routeParams.registration;
    if (regParam) {
      return { _cls: 'Registration', scan: scan, number: +regParam };
    } else {
      return scan;
    }
  }

  /**
   * Makes a place-holder image sequence sufficient to display a title.
   * The place-holder extends the
   * {{#crossLink "ImageSequenceService/secondaryKey"}}{{/crossLink}}
   * using the various data utility service `extend` methods,
   * which in turn enables the sequence *title* virtual property.
   *
   * @method placeHolder
   * @param routeParams {Object} the route parameters
   * @return {ImageSequence} the place-holder image sequence object
   */
  placeHolder(routeParams: Object) {
    // The bare-bones object.
    let imageSequence = this.secondaryKey(routeParams);
    // Fill in enough of the volume hierarchy to display a title.
    let scan;
    if (imageSequence._cls === 'Scan') {
      scan = imageSequence;
    } else {
      scan = imageSequence.scan;
      Registration.extend(imageSequence, scan, imageSequence.number);
    }
    Scan.extend(scan, scan.session);
    Subject.extend(scan.session.subject);
    Session.extend(scan.session, scan.session.subject, scan.session.number);

    return imageSequence;
  }

  /**
   * @method getImageSequence
   * @param routeParams {Object} the route parameters
   * @return {any} the REST image sequence object, or null if not found
   */
  getImageSequence(routeParams: Object): Observable<any> {
    // Fetch the session detail.
    let sessionFinder = this.sessionService.getSession(routeParams, true);

    // Find the volume.
    return sessionFinder.map(
      session => session ? this.findImageSequence(routeParams, session) : session
    );
  }

  /**
   * @method findImageSequence
   * @param routeParams {Object} the route parameters
   * @param session {Object} the session object holding the volume
   * @return {any} the REST image sequence object, or null if not found
   */
  private findImageSequence(routeParams: Object, session: Object) {
    // There must be a scan.
    let scanNbr = +routeParams.scan;
    let scan = _.find(session.scans, s => s.number === scanNbr);
    if (!scan) {
      return null;
    }

    // Return the scan or a registration.
    let regParam = routeParams.registration;
    if (regParam) {
      let regNdx = +regParam - 1;
      return scan.registrations[regNdx];
    } else {
      return scan;
    }
  }
}
