/**
 * This Subject Detail module exports the
 * {{#crossLink "SubjectComponent"}}{{/crossLink}}
 * directive.
 *
 * @module subject
 * @main subject
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { SubjectComponent } from './subject.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: SubjectComponent
  },
];

@NgModule({
  imports: [CommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [
    SubjectComponent
  ],
  exports: [SubjectComponent]
})

/**
 * The subject module metadata.
 *
 * @module subject
 * @class SubjectModule
 */
export default class SubjectModule { }
