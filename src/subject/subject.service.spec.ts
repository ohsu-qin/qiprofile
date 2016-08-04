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
 * @module subject
 * @class SubjectResourceStub
 */
class SubjectResourceStub {
  /**
   * @method find
   * @param params {Object} the search specification
   * @return {Observable<Object[]>} the hard-coded subject objects
   */
  find(params: Object): Observable<Object[]> {
    return Observable.of(
      [
        {_id: 1, number: 1},
        {_id: 2, number: 2}
      ]
    );
  }
  /**
   * @method find
   * @param params {Object} the search specification
   * @return {Observable<any>} the hard-coded subject, or null if
   *    no match
   */
  findOne(params: Object): Observable<any> {
    let match = params.where.match(/^.*"(_id|number)":1.*/);
    if (match) {
      return Observable.of(
        {_id: 1, number: 1}
      );
    } else {
      return Observable.of(null);
    }
  }
}

/**
 * {{#crossLink "SubjectService"}}{{/crossLink}} validator.
 *
 * @module subject
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
    return inject([SubjectService], (service: SubjectService) => {
      // Run the test.
      body(service);
      });
  }
  
  beforeEach(() => {
    addProviders([
      SubjectService,
      provide(SubjectResource, {useClass: SubjectResourceStub})
    ]);
  });

  it('should fetch the subjects', test(service => {
    service.getSubjects({project: 'QIN_Test', collection: 'Breast'})
      .subscribe(function (subjects) {
          expect(subjects, "The subjects were not found").to.exist.and.not.be.empty;
        }
      );
  }));

  it('should fetch a single subject by secondary key', test(service => {
    service.getSubject({project: 'QIN_Test', collection: 'Breast', subject: 1})
      .subscribe(function (subject) {
          expect(subject, "The subject was not found").to.exist;
          expect(subject._id, "The subject id is incorrect").to.equal(1);
        }
      );
  }));

  it('should fetch a single subject by id', test(service => {
    service.getSubject({subjectid: 1})
      .subscribe(function (subject) {
          expect(subject, "The subject was not foundd").to.exist;
          expect(subject.number, "The subject number is incorrect").to.equal(1);
        }
      );
  }));

  it('should cache and find a new subject', test(service => {
    service.getSubject({subjectid: 2})
      .subscribe(function (subject) {
          expect(subject, "The subject was incorrectly found").to.not.exist;
        }
      );
    service.cache({_id: 2, number: 2});
    service.getSubject({subjectid: 2})
      .subscribe(function (subject) {
          expect(subject, "The cached subject was not found").to.exist;
          expect(subject.number, "The subject number is incorrect").to.equal(2);
        }
      );
  }));
});
