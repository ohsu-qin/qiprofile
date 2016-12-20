import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { CollectionsResource } from './collections.resource.ts';

@Injectable()

/**
 * The collection data access service.
 *
 * @class CollectionsService
 */
export class CollectionsService {
  constructor(private resource: CollectionsResource) { }

  /**
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the REST collection objects
   */
  getCollections(project: string): Observable<Object[]> {
    let params: string = REST.where({project: project});

    return this.resource.find(params);
  }
}
