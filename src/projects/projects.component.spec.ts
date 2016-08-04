import { Observable } from 'rxjs';
import { provide } from '@angular/core';
import {
  describe, it, inject, beforeEachProviders, expect
} from '@angular/core/testing';

import { ProjectService } from '../project/project.service.ts';
import { ProjectsComponent } from './projects.component.ts';
import { HelpService } from '../help/help.service.ts';

/**
 * The test mock for a {{#crossLink "ProjectService"}}{{/crossLink}}.
 *
 * @module projects
 * @class ProjectServiceStub
 */
class ProjectServiceStub {
  /**
   *
   * @method getProjects
   * @param project {string} the project name
   * @return {Observable} the mock project objects sequence
   */
  getProjects(project: string): Observable<Object[]> {
    let values = [
      {name: 'QIN_Test', description: 'Test'},
      {name: 'QIN', description: 'Production'}
    ];

    return Observable.of(values);
  }
}

/**
 * The stunt showHelp flag service.
 *
 * @module projects
 * @class ProjectsHelpServiceStub
 */
class ProjectsHelpServiceStub {
  showHelp: boolean = false;
}

beforeEachProviders(() => {
  return [
    ProjectsComponent,
    provide(ProjectService, {useClass: ProjectServiceStub}),
    provide(HelpService, {useClass: ProjectsHelpServiceStub})
  ];
});

/**
 * Runs the given test body on the injected component and service.
 *
 * @function test
 * @param body {function(CollectionsComponent, CollectionService)} the 
 *   test body
 * @private
 */
function test(body) {
  return inject(
    [ProjectsComponent, ProjectService],
    (component: ProjectsComponent, service: ProjectService) => {
      body(component, service);
    }
  );
}

/**
 * The {{#crossLink "ProjectsComponent"}}{{/crossLink}} validator.
 * This test validates that the projects are listed in sort order.
 *
 * @module projects
 * @class ProjectsComponentSpec
 */
describe('The Projects component', function() {
  it('should sort the projects', test((component, service) => {
    // The mocked projects are in reverse sort order.
    service.getProjects().subscribe(projects => {
      let expected = projects.reverse();
      // Compare to the component projects property.
      expect(component.projects, 'Projects are incorrect').to.eql(expected);
    });
  }));
});
