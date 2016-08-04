import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { Router, ActivatedRoute } from '@angular/router';
import { CollectionComponent } from './collection.component.ts';
import { SubjectService } from '../subject/subject.service.ts';

/**
 * The stunt {{#crossLink "SubectService"}}{{/crossLink}}.
 *
 * @class SubectServiceStub
 */
class CollectionSubectServiceStub {
  static subjects: Object[] = [{number: 1}, {number: 2}];

  /**
   *
   * @method getSubjects
   * @param project {string} the project name
   * @return {Observable} the mock collection objects sequence
   */
  getSubjects(project: string, name: string): Observable<Object[]> {
    return Observable.of(CollectionSubectServiceStub.subjects);
  }
}

/**
 * The stunt router.
 *
 * @class CollectiondRouterStub
 */
class CollectionRouterStub {
}

/**
 * The stunt route.
 *
 * @class CollectionActivatedRouteStub
 */
class CollectionActivatedRouteStub {
  static paramsValue: Object = {project: 'QIN_Test', collection: 'Breast'};
  /**
   * The hard-coded stunt route params.
   *
   * @property params {Observable<Object>}
   */
  params: Observable<Object> = Observable.of(CollectionActivatedRouteStub.paramsValue);
}

/**
 * The {{#crossLink "CollectionComponent"}}{{/crossLink}} validator.
 *
 * @class CollectionComponentSpec
 */
describe('The Collection component', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @private
   * @param body {function(CollectionComponent, SubectService)} the test body
   */
  function test(body) {
    return inject(
      [CollectionComponent, SubjectService],
      (component: CollectionComponent, dataService: SubjectService) => {
        // Run the test.
        body(component, dataService);
      }
    );
   }

  beforeEach(() => {
    addProviders([
      CollectionComponent,
      provide(Router, {useClass: CollectionRouterStub}),
      provide(ActivatedRoute, {useClass: CollectionActivatedRouteStub}),
      provide(SubjectService, {useClass: CollectionSubectServiceStub})
    ]);
  });

  it('should have a project', test((component, service) => {
    expect(component.project, 'The project is missing').to.exist;
    let expected: string = CollectionActivatedRouteStub.paramsValue.project;
    expect(component.project, 'The project is incorrect').to.equal(expected);
  }));

  it('should have a name', test((component, service) => {
    expect(component.name, 'The collection name is missing').to.exist;
    let expected: string = CollectionActivatedRouteStub.paramsValue.collection;
    expect(component.name, 'The collection name is incorrect').to.equal(expected);
  }));

  it('should have subjects', test((component, service) => {
    let expected: string = CollectionSubectServiceStub.subjects;
    expect(component.subjects, 'The subjects are missing').to.exist;
    expect(component.subjects, 'The subjects are incorrect').to.eql(expected);
  }));

  xit('should have correlation charts', test((component, service) => {
    // TODO - flush out.
    expect(4, 'Correlation chart count is incorrect').to.equal(4);
  }));
});
