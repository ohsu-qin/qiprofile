import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  //describe, it, inject, beforeEachProviders, expect
  describe, inject, beforeEachProviders
} from '@angular/core/testing';

import { CollectionService } from '../collection/collection.service.ts';
import { CollectionComponent } from './collection.component.ts';
import { HelpService } from '../help/help.service.ts';

/**
 * The test mock for a {{#crossLink "CollectionService"}}{{/crossLink}}.
 *
 * @module collections
 * @class CollectionServiceStub
 */
class CollectionServiceStub {
  /**
   *
   * @method getCollection
   * @param project {string} the project name
   * @return {Observable} the mock collection objects sequence
   */
  getCollection(project: string, name: string): Observable<Object[]> {
    let value = {project: project, name: name};

    return Observable.of(value);
  }
}

/**
 * The stunt showHelp flag. Note that, unlike
 * {{#crossLink "ProjectComponentSpec"}}{{/crossLink}},
 * this help stub is empty, since 
 * the {{#crossLink "CollectionComponent"}}{{/crossLink}}
 * sets the flag in its router activation method, which is
 * not called in this unit test.
 *
 * @class CollectionHelpServiceStub
 */
class CollectionHelpServiceStub {
}

beforeEachProviders(() => {
  return [
    CollectionComponent,
    provide(CollectionService, {useClass: CollectionServiceStub}),
    provide(HelpService, {useClass: CollectionHelpServiceStub})
  ];
});

// This test is better suited for E2E testing, but confirms that we
// can test an observable component property with injected stubs and
// simulated init.
describe('Collection', () => {
  let component;
  
  beforeEach(inject(
    [CollectionComponent],
    (_component: CollectionComponent) => {
      // Manually init the component.
      _component.ngOnInit();
      component = _component;
    }
  ));

  xit('should have four correlation charts', inject(
    [CollectionService],
    (dataService: CollectionService) => {
      // TODO
    }
  ));
});
