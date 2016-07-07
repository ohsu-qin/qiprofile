import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, inject, beforeEachProviders, expect
} from '@angular/core/testing';

import { CollectionService } from './collection.service.ts';
import { CollectionsComponent } from './collections.component.ts';
import { HelpService } from '../common/help.service.ts';

class CollectionServiceStub {
  getCollections(project: string): Observable<Object[]> {
    let values = [{name: 'Sarcoma'}, {name: 'Breast'}];
    return Observable.create((subscriber) => subscriber.next(values));
  }
}

class HelpServiceStub {
}

beforeEachProviders(() => {
  return [
    CollectionsComponent,
    provide(CollectionService, {useClass: CollectionServiceStub}),
    provide(HelpService, {useClass: HelpServiceStub})
  ];
});

// This test is better suited for E2E testing, but confirms that we
// can test an observable component property with injected stubs and
// simulated init.
describe('Collections', () => {
  it('should sort the collections', inject(
    [CollectionService, HelpService, CollectionsComponent],
    (dataService: CollectionService, helpService: HelpService,
     collections: CollectionsComponent) => {
      // Manually init the component.
      collections.ngOnInit();
      // The sorted collections.
      let expected;
      dataService.getCollections().subscribe(colls => {
        expected = colls.reverse();
      });
      collections.collections.subscribe(
        actual => {
          expect(actual, 'Collections are incorrect').to.eql(expected);
        }
      );
    }
  ));
});
