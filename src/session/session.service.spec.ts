import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { SubjectService } from '../subject/subject.service.ts';
import { SubjectResource } from '../subject/subject.resource.ts';
import { SessionService } from './session.service.ts';
import { SessionDetailResource } from './session-detail.resource.ts';

const TEST_SUBJECT = {
  _id: 1,
  number: 1,
  encounters: [
    {
      _cls: 'Session',
      detail: 1
    }
  ]
};

const TEST_SESSION_DETAIL = {
  _id: 1,
  scans: [
    {
      number: '1',
      volumes:
      {
        name: 'NIFTI',
        images: [
          {name: 'volume001.nii.gz'}
        ]
      }
    }
  ]
};

/**
 * The stunt {{#crossLink "SubjectResource"}}{{/crossLink}.
 *
 * @module subject
 * @class SessionSubjectResourceStub
 */
class SessionSubjectResourceStub {
  /**
   * @method findOne
   * @param params {Object} the search specification
   * @return {Observable<any>} the hard-coded subject, or null if
   *    no match
   */
  findOne(params: Object): Observable<any> {
    let match = params.where.match(/^.*"(_id|number)":1.*/);
    if (match) {
      return Observable.of(TEST_SUBJECT);
    } else {
      return Observable.of(null);
    }
  }
}

/**
 * The stunt {{#crossLink "SessionDetailResource"}}{{/crossLink}}.
 *
 * @module session
 * @class SessionDetailResourceStub
 */
class SessionDetailResourceStub {
  /**
   * @method find
   * @param params {Object} the search specification
   * @return {Observable<any>} the hard-coded session detail, or null if
   *    no match
   */
  findOne(params: Object): Observable<any> {
    let match = params.where.match(/^.*"_id":1.*/);
    if (match) {
      return Observable.of(TEST_SESSION_DETAIL);
    } else {
      return Observable.of(null);
    }
  }
}

/**
 * The {{#crossLink "SessionService"}}{{/crossLink}} validator.
 *
 * @module session
 * @class SessionServiceSpec
 */
describe('The Session service', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @param body {function(SessionsComponent, SessionService)} the test body
   * @private
   */
  function test(body) {
    return inject([SessionService], (service: SessionService) => {
      // Run the test.
      body(service);
      });
  }
  
  beforeEach(() => {
    addProviders([
      SessionService,
      provide(SubjectResource, {useClass: SessionSubjectResourceStub}),
      provide(SessionDetailResource, {useClass: SessionDetailResourceStub}),
      {
        provide: SubjectService,
        useFactory: rsc => new SubjectService(rsc),
        deps: [SubjectResource]
      }
    ]);
  });

  it('should fetch the session', test(service => {
    service.getSession({project: 'QIN_Test', collection: 'Breast', subject: 1, session: 1})
      .subscribe(function (session) {
        expect(session, "The session was not found").to.exist;
        expect(session.hasDetailProperties, "The session was not extended")
          .to.exist;
        expect(session.hasDetailProperties(), "The session detail was fetched without asking")
          .to.be.false;
      });
  }));

  it('should fetch the session detail', test(service => {
    service.getSession({project: 'QIN_Test', collection: 'Breast', subject: 1, session: 1}, true)
      .subscribe(function (session) {
        expect(session, "The session was not found").to.exist;
        expect(session.hasDetailProperties, "The session was not extended")
          .to.exist;
        expect(session.hasDetailProperties(), "The session detail was not fetched")
          .to.be.true;
      });
  }));
});
