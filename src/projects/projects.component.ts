/**
 * The Projects List module.
 *
 * @module projects
 * @main projects
 */
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Component } from '@angular/core';

import { PageComponent } from '../page/page.component.ts';
import { ProjectService } from '../project/project.service.ts';
import { HelpService } from '../help/help.service.ts';
import help from './projects.help.md';
import { ProjectItemComponent } from './project-item.component.ts';

@Component({
  selector: 'qi-projects',
  templateUrl: '/public/html/projects/projects.html',
  directives: PageComponent.DIRECTIVES.concat([ProjectItemComponent]),
  providers: [ProjectService]
})

/**
 * The Project List main component.
 *
 * @class ProjectsComponent
 */
export class ProjectsComponent extends PageComponent {
  /**
   * The project REST objects.
   *
   * @property projects {Object[]}
   */
  projects: Object[];

  /**
   * Flag indicating whether there are no projects.
   * See {{#crossLink "CollectionsComponent"}}{{/crossLink}}
   * for the rationale for this property.
   *
   * @property isEmpty {boolean}
   */
  isEmpty: boolean;
  
  constructor(private dataService: ProjectService,
              private helpService: HelpService) {
      super(help);
      // Always show the help on this page.
      this.helpService.showHelp = true;
      // The unsorted project objects.
      let unsorted: Observable = this.dataService.getProjects();
      // A function to sort the projects by name.
      let sortByName = _.partialRight(_.sortBy, 'name');
      // Sort the projects.
      unsorted.map(sortByName).subscribe(projects => {
        this.projects = projects;
        this.isEmpty = projects.length === 0;
      });
  }
}
