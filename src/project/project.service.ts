import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProjectResource } from './project.resource.ts';

@Injectable()

/**
 * The project data access service.
 *
 * @module project
 * @class ProjectService
 */
export class ProjectService {
  constructor(private resource: ProjectResource) { }

  /**
   * @method getProjects
   * @param project {string} the project name
   * @return {Observable} the REST project objects
   */
  getProjects(project: string): Observable<Object[]> {
    return this.resource.find();
  }
}
