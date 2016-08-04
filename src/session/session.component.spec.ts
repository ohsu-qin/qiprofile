import { Observable } from 'rxjs';
import { provide, ChangeDetectorRef } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { Router, ActivatedRoute } from '@angular/router';
import { SessionComponent } from './session.component.ts';
import { SessionService } from './session.service.ts';

/**
 * The stunt {{#crossLink "SessionService"}}{{/crossLink}}.
 *
 * @class SessionServiceStub
 */
class SessionServiceStub {
  static session: Object = {
    subject: {project: 'QIN_Test', collection: 'Breast', number: 1},
    number: 1
  };

  /**
   *
   * @method secondaryKey
   * @param project {string} the project name
   * @return {Observable} the mock session object sequence
   */
  secondaryKey(params: Object): Observable<Object[]> {
    return SessionServiceStub.session;
  }

  /**
   *
   * @method getSessions
   * @param routeParams {Object} the route parameters
   * @return {Observable} the mock session object sequence
   */
  getSession(routeParams: Object): Observable<Object[]> {
    return Observable.of(SessionServiceStub.session);
  }
}

/**
 * The stunt router.
 *
 * @class SessiondRouterStub
 */
class SessionRouterStub {
}

/**
 * The stunt route.
 *
 * @class SessionActivatedRouteStub
 */
class SessionActivatedRouteStub {
  static paramsValue: Object = {
    project: 'QIN_Test', collection: 'Breast', subject: 1, session: 1
  };

  /**
   * The hard-coded stunt route params.
   *
   * @property params {Observable<Object>}
   */
  params: Observable<Object> = Observable.of(SessionActivatedRouteStub.paramsValue);
}

/**
 * The stunt change detector.
 *
 * @class SubjectChangeDetectorRefStub
 */
class SessionChangeDetectorRefStub {
  markForCheck() {}
}

/**
 * The {{#crossLink "SessionComponent"}}{{/crossLink}} validator.
 *
 * @class SessionComponentSpec
 */
describe('The Session component', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @private
   * @param body {function(SessionComponent, SubectService)} the test body
   */
  function test(body) {
    return inject(
      [SessionComponent, SessionService],
      (component: SessionComponent, service: SessionService) => {
        // Run the test.
        body(component, service);
      }
    );
   }

  beforeEach(() => {
    addProviders([
      SessionComponent,
      provide(Router, {useClass: SessionRouterStub}),
      provide(ActivatedRoute, {useClass: SessionActivatedRouteStub}),
      provide(SessionService, {useClass: SessionServiceStub}),
      provide(ChangeDetectorRef, {useClass: SessionChangeDetectorRefStub})
    ]);
  });

  it('should have a session', test((component) => {
    let expected = SessionServiceStub.session;
    expect(component.session, 'The session is missing').to.exist;
    expect(component.session, 'The session is incorrect').to.eql(expected);
  }));

  xit('should have correlation charts', test((component, service) => {
    // TODO - flush out.
    expect(4, 'Correlation chart count is incorrect').to.equal(4);
  }));
});
