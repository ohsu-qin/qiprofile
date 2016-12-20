import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, expect, inject, addProviders
} from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { CollectionsComponent } from './collections.component.ts';
import { HelpService } from '../help/help.service.ts';
import { CollectionsService } from './collections.service.ts';

/**
 * The stunt showHelp flag service.
 *
 * @module collections
 * @class CollectionsHelpServiceStub
 */
class CollectionsHelpServiceStub {
  showHelp: boolean = false;
}

/**
 * The test mock for an `ActivatedRoute".
 *
 * @module collections
 * @class CollectionsActivatedRouteStub
 */
class CollectionsActivatedRouteStub {
  static paramsValue: Object = {project: 'QIN_Test'};

  params: Observable<Object> = Observable.of(CollectionsActivatedRouteStub.paramsValue);
}

/**
 * The test mock for a {{#crossLink "CollectionsService"}}{{/crossLink}}.
 *
 * @module collections
 * @class CollectionsServiceStub
 */
class CollectionsCollectionsServiceStub {
  static collections: Object[] = [{name: 'Sarcoma'}, {name: 'Breast'}];

  /**
   *
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the mock collection objects sequence
   */
  getCollections(project: string): Observable<Object[]> {
    return Observable.of(CollectionsCollectionsServiceStub.collections);
  }
}

/**
 * The {{#crossLink "CollectionsComponent"}}{{/crossLink}} validator.
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
   * @param body {function(CollectionsComponent, CollectionsService)} the test body
   * @private
   */
  function test(body) {
    return inject(
      [CollectionsComponent, CollectionsService],
      (component: CollectionsComponent, service: CollectionsService) => {
        // Run the test.
        body(component, service);
      }
    );
  }

  beforeEach(() => {
    addProviders([
      CollectionsComponent,
      provide(ActivatedRoute, {useClass: CollectionsActivatedRouteStub}),
      provide(HelpService, {useClass: CollectionsHelpServiceStub}),
      provide(CollectionsService, {useClass: CollectionsCollectionsServiceStub})
    ]);
  });

  it('should have a project', test((component, service) => {
    expect(component.project, 'The project is missing').to.exist;
    let expected: string = CollectionsActivatedRouteStub.paramsValue.project;
    expect(component.project, 'The project is incorrect').to.equal(expected);
  }));

  it('should sort the collections', test((component) => {
    // The mocked collections are in reverse sort order.
    let expected: Object[] = CollectionsCollectionsServiceStub.collections.reverse();
    // Compare to the component collections property.
    expect(component.collections, 'Collections are incorrect').to.eql(expected);
  }));
});
