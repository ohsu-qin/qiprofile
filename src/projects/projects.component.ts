/**
 * The Projects List module.
 *
 * @module projects
 */
import { Component, OnInit } from '@angular/core';
import { RouteSegment, OnActivate } from '@angular/router';
import * as _ from 'lodash';

import { GoHomeComponent } from '../common/go-home.component.ts';
import { ToggleHelpComponent } from '../common/toggle-help.component.ts';
import { ProjectService } from './project.service.ts';
import { ProjectComponent } from './project.component.ts';
import { HelpComponent } from '../common/help.component.ts';
import { HelpService } from '../common/help.service.ts';
import help from './projects.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-projects',
  templateUrl: '/public/html/projects/projects.html',
  directives: [GoHomeComponent, ToggleHelpComponent, ProjectComponent, HelpComponent],
  providers: [ProjectService]
})

/**
 * The Project List main component.
 *
 * @class ProjectsComponent
 * @main
 */
export class ProjectsComponent implements OnInit, OnActivate {
  /**
   * An Observable that resolves to the project REST objects.
   *
   * @property projects {Observable}
   */
  projects: Observable<Object[]>;
  
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
