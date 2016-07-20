import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, inject, beforeEachProviders, expect
} from '@angular/core/testing';

import { ActivatedRoute } from '@angular/router';
import { CollectionService } from '../collection/collection.service.ts';
import { CollectionsComponent } from './collections.component.ts';
import { HelpService } from '../help/help.service.ts';

/**
 * The test mock for an `ActivatedRoute".
 *
 * @module collections
 * @class ActivatedRouteStub
 */
class ActivatedRouteStub {
  params: Observable<Object> = Observable.of({project: 'QIN_Test'});
}

/**
 * The test mock for a {{#crossLink "CollectionService"}}{{/crossLink}}.
 *
 * @module collections
 * @class CollectionServiceStub
 */
class CollectionServiceStub {
  /**
   *
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the mock collection objects sequence
   */
  getCollections(project: string): Observable<Object[]> {
    let values = [{name: 'Sarcoma'}, {name: 'Breast'}];

    return Observable.of(values);
  }
}

/**
 * The stunt showHelp flag. Note that, unlike
 * {{#crossLink "ProjectComponentSpec"}}{{/crossLink}},
 * this help stub is empty, since 
 * the {{#crossLink "CollectionsComponent"}}{{/crossLink}}
 * sets the flag in its router activation method, which is
 * not called in this unit test.
 *
 * @class CollectionsHelpServiceStub
 */
class CollectionsHelpServiceStub {
}

beforeEachProviders(() => {
  return [
    CollectionsComponent,
    provide(ActivatedRoute, {useClass: ActivatedRouteStub}),
    provide(CollectionService, {useClass: CollectionServiceStub}),
    provide(HelpService, {useClass: CollectionsHelpServiceStub})
  ];
});

// This test is better suited for E2E testing, but confirms that we
// can test an observable component property with injected stubs and
// simulated init.
describe('Collections', () => {
  let component;
  
  beforeEach(inject(
    [CollectionsComponent],
    (_component: CollectionsComponent) => {
      // Manually init the component.
      _component.ngOnInit();
      component = _component;
    }
  ));

  it('should not be empty', function() {
    component.isEmpty().subscribe(
      empty => {
        expect(empty, 'Collections are incorrectly empty').to.be.false;
      }
    );
  });

  it('should sort the collections', inject(
    [CollectionService],
    (dataService: CollectionService) => {
      // The mocked collections are in reverse sort order.
      let expected;
      dataService.getCollections().subscribe(reversed => {
        expected = reversed.reverse();
      });
      // Compare to the component collections property.
      component.collections.subscribe(
        actual => {
          expect(actual, 'Collections are incorrect').to.eql(expected);
        }
      );
    }
  ));
});
