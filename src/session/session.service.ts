import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { SubjectService } from '../subject/subject.service.ts';
import { SessionDetailResource } from './session-detail.resource.ts';

@Injectable()

/**
 * The session data access service.
 *
 * @class SessionService
 */
export class SessionService {
  constructor(
    private subjectService: SubjectService,
    private resource: SessionDetailResource
  ) {}
  
  /**
   * Makes the {subject, number} secondary key from the
   * given route parameters, where:
   * * *subject* is the {{#crossLink "SubjectService"}}{{/crossLink}}
   *   secondary key
   * * *number* is the *session* parameter
   *
   * @method secondaryKey
   * @param params {Object} the route parameters
   * @return {Object} the corresponding secondary key
   */
  secondaryKey(routeParams: Object) {
    // The subject secondary key.
    let subject = this.subjectService.secondaryKey(routeParams);
    return {subject: subject, number: +routeParams.session};
  }

  /**
   * @method getSession
   * @param routeParams {Object} the route parameters
   * @param detail {boolean} flag indicating whether to fetch the
   *   session detail and add the detail content to the session
   *   object
   * @return {Observable<any>} the REST session object, if found,
   *   otherwise null
   */
  getSession(routeParams: Object, detail=false): Observable<any> {
    if (!routeParams.session) {
      throw new ReferenceError(
        `The route parameters are missing a session: ${ JSON.stringify(routeParams) }`
      );
    }
    let sessionIndex = +routeParams.session - 1;
    let session = this.subjectService.getSubject(routeParams)
      .map(subject => subject ? subject.sessions[sessionIndex] : null);
    // If the detail flag is set, then tack on an addDetail observable.
    if (detail) {
      // If there is a session, then fetch and add the detail.
      let addDetail = _session => {
        return _session ? this.getSessionDetail(_session) : Observable.of(null);
      };
      // Chain the session observable to the makeDetail observable.
      return session.map(addDetail).concatAll();
    } else {
      return session;
    }
  }
  
  /**
   * Fetches the detail REST object for the given session object.
   *
   * @method getSessionDetail
   * @private
   * @param session {Object} the session whose detail is to be fetched
   * @return {Observable<Object>} an observable which resolves to the
   *   session object extended with the detail properties
   */
  private getSessionDetail(session: Object): Observable<Object> {
    if (!session.detail) {
      throw new ReferenceError(
        `${ session.title } does not have a detail database reference`
      );
    }

    // The search parameter.
    let searchParam: string = REST.where({_id: session.detail});
    let detail = this.resource.findOne(searchParam);
    
    return detail.map(_detail => session.extendDetail(_detail));
  }
}
