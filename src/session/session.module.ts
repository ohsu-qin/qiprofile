/**
 * This Session Detail module exports the
 * {{#crossLink "SessionComponent"}}{{/crossLink}}
 * directive.
 *
 * @module session
 * @main session
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { SessionComponent } from './session.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: SessionComponent
  },
];

@NgModule({
  imports: [NgCommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [
    SessionComponent
  ],
  exports: [SessionComponent]
})

/**
 * The session module metadata.
 *
 * @module session
 * @class SessionModule
 */
export default class SessionModule { }
