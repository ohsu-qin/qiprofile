import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { CollectionResource } from './collection.resource.ts';

@Injectable()

export class CollectionService {
  constructor(private resource: CollectionResource) { }

  getCollections(project: string): Observable<Object[]> {
    return this.resource.find({project: project});
  }
}
