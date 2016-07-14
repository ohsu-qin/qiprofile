import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import RestService from '../common/rest.service.coffee';
import { CollectionResource } from './collection.resource.ts';

@Injectable()

/**
 * The collections data access service.
 *
 * @module collections
 * @class CollectionService
 */
export class CollectionService {
  constructor(private resource: CollectionResource) { }

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
