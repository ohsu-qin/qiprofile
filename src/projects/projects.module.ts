/**
 * The projects module exports the following directives:
 * {{#crossLink "ProjectsComponent"}}{{/crossLink}}
 *
 * @module projects
 * @main projects
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PageModule } from '../page/page.module.ts';
import { ProjectsComponent } from './projects.component.ts';
import { ProjectItemComponent } from './project-item.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: ProjectsComponent
  },
];

@NgModule({
  imports: [
    NgCommonModule, NgbModule, PageModule,
    RouterModule.forChild(ROUTE_CONFIG)
  ],
  declarations: [
    ProjectsComponent, ProjectItemComponent
  ],
  exports: [ProjectsComponent]
})

/**
 * The projects module metadata.
 *
 * @module projects
 * @class ProjectsModule
 */
export default class ProjectsModule { }
