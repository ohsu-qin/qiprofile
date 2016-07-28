import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { SubjectService } from './subject.service.ts';
import { SubjectResource } from './subject.resource.ts';

/**
 * The test mock for a `SubjectResource`.
 *
 * @class SubjectResourceStub
 */
class SubjectResourceStub {
  /**
   * @method find
   * @param params {Object} the search specification
   * @return {Observable<Object[]>} the hard-coded subject objects
   */
  find(params: Object): Observable<Object[]> {
    return Observable.of({number: 1});
  }
}

/**
 * {{#crossLink "SubjectService"}}{{/crossLink}} validator.
 *
 * @class SubjectServiceSpec
 */
describe('The Subject service', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @param body {function(SubjectsComponent, SubjectService)} the test body
   * @private
   */
  function test(body) {
    return inject(
      [SubjectService],
      (service: SubjectService) => {
        // Run the test.
        body(service);
      }
    );
  }
  
  beforeEach(() => {
    addProviders([
      SubjectService,
      provide(SubjectResource, {useClass: SubjectResourceStub})
    ]);
  });

  it('should exist', test((service) => {
    expect(service, 'The service is missing').to.exist;
  }));

  xit('should fetch the subjects', test((service) => {
  }));
});
