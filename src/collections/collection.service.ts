import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CollectionResource } from './collection.resource.ts';

@Injectable()

export class CollectionService {
  constructor(private resource: CollectionResource) { }

  /**
   * @method getCollections
   * @param project {string} the project name
   * @return {Observable} the REST collection objects
   */
  getCollections(project: string): Observable<Object[]> {
    return this.resource.find({project: project});
  }
}
