/**
 * The projects module exports the following directives:
 * {{#crossLink "ProjectsComponent"}}{{/crossLink}}
 *
 * @module projects
 * @main projects
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { ProjectService } from '../project/project.service.ts';
import { ProjectsComponent } from './projects.component.ts';
import { ProjectItemComponent } from './project-item.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: ProjectsComponent
  },
];

@NgModule({
  imports: [CommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [ProjectsComponent, ProjectItemComponent],
  providers: [ProjectService],
  exports: [ProjectsComponent]
})

/**
 * The projects module metadata.
 *
 * @module projects
 * @class ProjectsModule
 */
export default class ProjectsModule { }
