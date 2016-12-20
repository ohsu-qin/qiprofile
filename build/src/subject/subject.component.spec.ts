import { Observable } from 'rxjs';
import { provide, ChangeDetectorRef } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { Router, ActivatedRoute } from '@angular/router';
import { SubjectComponent } from './subject.component.ts';
import { SubjectService } from './subject.service.ts';

/**
 * The stunt {{#crossLink "SubjectService"}}{{/crossLink}}.
 *
 * @module subject
 * @class SubjectServiceStub
 */
class SubjectServiceStub {
  static subject: Object = {
    project: 'QIN_Test', collection: 'Breast', number: 1
  };

  /**
   *
   * @method secondaryKey
   * @param project {string} the project name
   * @return {Observable} the mock subject object sequence
   */
  secondaryKey(params: Object): Observable<Object[]> {
    return SubjectServiceStub.subject;
  }

  /**
   *
   * @method getSubjects
   * @param project {string} the project name
   * @return {Observable} the mock subject object sequence
   */
  getSubject(project: string, name: string): Observable<Object[]> {
    return Observable.of(SubjectServiceStub.subject);
  }
}

/**
 * The stunt router.
 *
 * @module subject
 * @class SubjectdRouterStub
 */
class SubjectRouterStub {
}

/**
 * The stunt route.
 *
 * @module subject
 * @class SubjectActivatedRouteStub
 */
class SubjectActivatedRouteStub {
  static paramsValue: Object = {project: 'QIN_Test', subject: 'Breast'};
  /**
   * The hard-coded stunt route params.
   *
   * @property params {Observable<Object>}
   */
  params: Observable<Object> = Observable.of(SubjectActivatedRouteStub.paramsValue);
}

/**
 * The stunt change detector.
 *
 * @module subject
 * @class SubjectChangeDetectorRefStub
 */
class SubjectChangeDetectorRefStub {
  markForCheck() {}
}

/**
 * The {{#crossLink "SubjectComponent"}}{{/crossLink}} validator.
 *
 * @module subject
 * @class SubjectComponentSpec
 */
describe('The Subject component', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @private
   * @param body {function(SubjectComponent, SubectService)} the test body
   */
  function test(body) {
    return inject(
      [SubjectComponent, SubjectService],
      (component: SubjectComponent, service: SubjectService) => {
        // Run the test.
        body(component, service);
      }
    );
   }

  beforeEach(() => {
    addProviders([
      SubjectComponent,
      provide(Router, {useClass: SubjectRouterStub}),
      provide(ActivatedRoute, {useClass: SubjectActivatedRouteStub}),
      provide(SubjectService, {useClass: SubjectServiceStub}),
      provide(ChangeDetectorRef, {useClass: SubjectChangeDetectorRefStub})
    ]);
  });

  it('should have a subject', test((component) => {
    let expected = SubjectServiceStub.subject;
    expect(component.subject, 'The subject is missing').to.exist;
    expect(component.subject, 'The subject is incorrect').to.eql(expected);
  }));

  xit('should have correlation charts', test((component, service) => {
    // TODO - flush out.
    expect(4, 'Correlation chart count is incorrect').to.equal(4);
  }));
});
