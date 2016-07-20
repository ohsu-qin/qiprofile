import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import RestService from '../common/rest.service.coffee';
import { CollectionResource } from './collection.resource.ts';

@Injectable()

/**
 * The collection data access service.
 *
 * @module collection
 * @class CollectionService
 */
export class CollectionService {
  constructor(private resource: CollectionResource) {}

  /**
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the REST collection objects
   */
  getCollections(project: string): Observable<Object[]> {
    let params: string = RestService.where({project: project});

    return this.resource.find(params);
  }
}
