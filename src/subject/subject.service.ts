import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import RestService from '../common/rest.service.coffee';
import { SubjectResource } from './subject.resource.ts';

@Injectable()

/**
 * The subject data access service.
 *
 * @module subject
 * @class SubjectService
 */
export class SubjectService {
  constructor(private resource: SubjectResource) { }

  /**
   * @method getSubjects
   * @param project {string} the project name
   * @param collection {string} the collection name
   * @return {Observable} the REST subject objects
   */
  getSubjects(project: string, collection: string): Observable<Object[]> {
    let params: string = RestService.where(
      {project: project, collection: collection}
    );

    return this.resource.find(params);
  }
}
