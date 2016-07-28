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
 * The stunt showHelp flag service. Note that, unlike
 * {{#crossLink "CollectionsHelpServiceStub"}}{{/crossLink}},
 * this help stub must have the flag, since it is set in
 * the {{#crossLink "ProjectsComponent"}}{{/crossLink}}
 * constructor rather than an Angular call-back method.
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
 * {{#crossLink "ProjectsComponent"}}{{/crossLink}} validator.
 * This test validates that the projects are listed in sort order.
 *
 * @module projects
 * @class ProjectsComponentSpec
 */
describe('The Projects component', function() {
  let component;
  
  beforeEach(inject(
    [ProjectsComponent],
    (_component: ProjectsComponent) => {
      // Manually init the component.
      _component.ngOnInit();
      component = _component;
    }
  ));

  it('should sort the projects', inject(
    [ProjectService],
    (dataService: ProjectService) => {
      // The mocked projects are in reverse sort order.
      let expected;
      dataService.getProjects().subscribe(reversed => {
        expected = reversed.reverse();
      });
      // Compare to the component projects property.
      component.projects.subscribe(
        actual => {
          expect(actual, 'Projects are incorrect').to.eql(expected);
        }
      );
    }
  ));
});
