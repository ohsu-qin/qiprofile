/**
 * The Projects List module.
 *
 * @module projects
 */
import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

import { GoHomeComponent } from '../common/go-home.component.ts';
import { ToggleHelpComponent } from '../common/toggle-help.component.ts';
import { ProjectItemComponent } from './project-item.component.ts';
import { ProjectService } from '../project/project.service.ts';
import { HelpComponent } from '../common/help.component.ts';
import { HelpService } from '../common/help.service.ts';
import help from './projects.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-projects',
  templateUrl: '/public/html/projects/projects.html',
  directives: [ProjectItemComponent, GoHomeComponent, ToggleHelpComponent,
               HelpComponent],
  providers: [ProjectService]
})

/**
 * The Project List main component.
 *
 * @class ProjectsComponent
 * @main
 */
export class ProjectsComponent implements OnInit {
  /**
   * An Observable that resolves to the project REST objects.
   *
   * @property projects {Observable}
   */
  projects: Observable<Object[]>;

  /**
   * The Project List page project name is `projects`. This is only
   * used by the Home button which turns home into a no-op when on
   * this page.
   *
   * @property project {string}
   */
  project: string = 'projects';
  
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

  constructor(private dataService: ProjectService,
              private helpService: HelpService) {
      this.help = help;
      this.helpService.showHelp = true;
  }
  
  /**
   * @method isEmpty
   * @return {Observable<boolean>} whether there any projects
   */
  isEmpty(): Observable<boolean> {
    return this.projects.map(
      array => array.length === 0
    );
  }

  /**
   * Obtains the project names from the data service and sorts them.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    // The unsorted project objects.
    let unsorted: Observable = this.dataService.getProjects();
    // A function to sort the projects by name.
    let sortByName = _.partialRight(_.sortBy, 'name');
    // Sort the projects.
    this.projects = unsorted.map(sortByName);
  }
}
