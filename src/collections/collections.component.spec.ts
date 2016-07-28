import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { CollectionsComponent } from './collections.component.ts';
import { CollectionService } from '../collection/collection.service.ts';

/**
 * The test mock for an `ActivatedRoute".
 *
 * @module collections
 * @class ActivatedRouteStub
 */
class CollectionsActivatedRouteStub {
  static paramsValue: Object = {project: 'QIN_Test'};
  
  params: Observable<Object> = Observable.of(CollectionsActivatedRouteStub.paramsValue);
}

/**
 * The test mock for a {{#crossLink "CollectionService"}}{{/crossLink}}.
 *
 * @module collections
 * @class CollectionServiceStub
 */
class CollectionsCollectionServiceStub {
  static collections: Object[] = [{name: 'Sarcoma'}, {name: 'Breast'}]
  
  /**
   *
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the mock collection objects sequence
   */
  getCollections(project: string): Observable<Object[]> {
    return Observable.of(CollectionsCollectionServiceStub.collections);
  }
}

/**
 * {{#crossLink "CollectionsComponent"}}{{/crossLink}} validator.
 * This test is better suited for E2E testing, but confirms that we
 * can test an observable component property with injected stubs and
 * simulated init.
 *
 * @module collections
 * @class CollectionsComponentSpec
 */
describe('The Collections component', function() {
  /**
   * Runs the given test body on the injected component and service.
   *
   * @function test
   * @param body {function(CollectionsComponent, CollectionService)} the test body
   * @private
   */
  function test(body) {
    return inject(
      [CollectionsComponent, CollectionService],
      (component: CollectionsComponent, dataService: CollectionService) => {
        // Manually init the component.
        component.ngOnInit();
        // Run the test.
        body(component, dataService);
      }
    );
  };
  
  beforeEach(() => {
    addProviders([
      CollectionsComponent,
      provide(ActivatedRoute, {useClass: CollectionsActivatedRouteStub}),
      provide(CollectionService, {useClass: CollectionsCollectionServiceStub})
    ]);
  });

  it('should have a project', test((component, service) => {
    expect(component.project, 'The project is missing').to.exist;
    let expected: string = CollectionsActivatedRouteStub.paramsValue.project;
    expect(component.project, 'The project is incorrect').to.equal(expected);
  }));
  
  it('should not be empty', test((component, dataService) => {
    component.isEmpty().subscribe(
      empty => {
        expect(empty, 'Collections are incorrectly empty').to.be.false;
      }
    );
  }));
  
  it('should sort the collections', test((component, dataService) => {
    // The mocked collections are in reverse sort order.
    let expected = CollectionsCollectionServiceStub.collections.reverse();
    // Compare to the component collections property.
    component.collections.subscribe(
      actual => {
        expect(actual, 'Collections are incorrect').to.eql(expected);
      }
    );
  }));
});
