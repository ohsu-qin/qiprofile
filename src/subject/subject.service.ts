/**
 * The Subject data access module.
 *
 * @module subject
 * @main subject
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { SubjectResource } from './subject.resource.ts';
import Subject from './subject.data.coffee';

@Injectable()

/**
 * The Subject data access service.
 *
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
    let params: string = REST.where(
      {project: project, collection: collection}
    );
    // Fetch the subjects.
    let subjects: Observable<Object[]> = this.resource.find(params);

    // Return the extended subjects.
    return subjects.map(fetched => fetched.map(Subject.extend));
  }
}
