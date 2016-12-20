import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';

import { Router, ActivatedRoute } from '@angular/router';
import { CollectionComponent } from './collection.component.ts';
import { SubjectService } from '../subject/subject.service.ts';

/**
 * The stunt {{#crossLink "SubectService"}}{{/crossLink}}.
 *
 * @class CollectionSubectServiceStub
 * @module collection
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
 * @class CollectionRouterStub
 * @module collection
 */
class CollectionRouterStub {
}

/**
 * The stunt route.
 *
 * @class CollectionActivatedRouteStub
 * @module collection
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
 * FIXME - this second attempt to test in Angular rc.5 results in the
 *   following error:
 *     undefined is not a constructor (evaluating 'describe')
 *   Although the karma plug-ins should provide describe, et al. as globals,
 *   perhaps they must be grabbed from some import.
 *
 * @class CollectionComponentSpec
 * @module collection
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
    async(inject([], () => {
      let fixture = TestBed.createComponent(CollectionComponent);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let component = fixture.componentInstance;
        // Run the test.
        body(component);
      });
    }));
   }

   beforeEach(() => {
     TestBed.configureTestingModule({
       declarations: [
         CollectionComponent
       ],
       imports: [
         BrowserModule
       ],
       providers: [
         provide(Router, {useClass: CollectionRouterStub}),
         provide(ActivatedRoute, {useClass: CollectionActivatedRouteStub}),
         provide(SubjectService, {useClass: CollectionSubectServiceStub})
       ]
     });
   });

  it('should have a project', test((component) => {
    expect(component.project, 'The project is missing').to.exist;
    let expected: string = CollectionActivatedRouteStub.paramsValue.project;
    expect(component.project, 'The project is incorrect').to.equal(expected);
  }));

  it('should have a name', test((component) => {
    expect(component.name, 'The collection name is missing').to.exist;
    let expected: string = CollectionActivatedRouteStub.paramsValue.collection;
    expect(component.name, 'The collection name is incorrect').to.equal(expected);
  }));

  it('should have subjects', test((component) => {
    let expected: string = CollectionSubectServiceStub.subjects;
    expect(component.subjects, 'The subjects are missing').to.exist;
    expect(component.subjects, 'The subjects are incorrect').to.eql(expected);
  }));

  xit('should have correlation charts', test((component) => {
    // TODO - flush out.
    expect(4, 'Correlation chart count is incorrect').to.equal(4);
  }));
});
