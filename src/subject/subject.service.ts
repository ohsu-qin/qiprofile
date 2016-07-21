import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import RestService from '../rest/rest.service.coffee';
import { SubjectResource } from './subject.resource.ts';

@Injectable()

/**
 * The subject data access service.
 *
 * @module subject
 * @class SubjectService
 */
export class SubjectService {
  constructor(private resource: SubjectResource) {}

  /**
   * @method getSubjects
   * @param project {string} the project name
   * @param collection {string} the collection name
   * @return {Observable} the REST subject objects
   */
  getSubjects(project: string, collection: string): Observable<Object[]> {
    // The selection query parameters.
    let params: string = RestService.where(
      {project: project, collection: collection}
    );
    // Fetch the subjects.
    let subjects: Observable<Object[]> = this.resource.find(params);
    // Extend the subjects.
    let extend = _subjects => {
      for (subject in _subjects) {
        Subject.extend(_subject);
      }
    };
    
    // Return the extended subjects.
    return subjects.map(fetched => { extend(fetched); });
  }
}
