import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import SessionService from '../session/session.service.ts';

@Injectable()

/**
 * The volume data access service.
 *
 * @class VolumeService
 */
export class VolumeService {
  constructor(private sessionService: SessionService) {}

  /**
   * @method getVolume
   * @param params {Object} the search parameters
   * @return {any} the REST volume object, or null if not found
   */
  getVolume(params: Object): Observable<any> {
    // Build the session search criterion.
    let criterion = _.omit(params, ['volume']);
    let session = this.sessionService.getSession(criterion, true);
    
    return session.map(_session => _session.findVolume(params.volume));
  }
}
