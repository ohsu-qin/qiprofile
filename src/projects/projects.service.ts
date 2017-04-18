/**
 * Project data access module.
 *
 * @module projects
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProjectsResource } from './projects.resource.ts';

@Injectable()

/**
 * The project data access service.
 *
 * @class ProjectsService
 */
export class ProjectsService {
  constructor(private resource: ProjectsResource) { }

  /**
   * @method getProjects
   * @param project {string} the project name
   * @return {Observable} the REST project objects
   */
  getProjects(project: string): Observable<Object[]> {
    return this.resource.find();
  }
}
