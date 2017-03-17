/**
 * This Collections List module exports the following directives:
 * {{#crossLink "CollectionsComponent"}}{{/crossLink}}
 *
 * @module collections
 * @main collections
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { PageModule } from '../page/page.module.ts';
import { CollectionsComponent } from './collections.component.ts';
import { CollectionItemComponent } from './collection-item.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: CollectionsComponent
  },
];

@NgModule({
  imports: [
    NgCommonModule, NgbModule, PageModule,
    RouterModule.forChild(ROUTE_CONFIG)
  ],
  declarations: [
    CollectionsComponent,  CollectionItemComponent
  ],
  exports: [CollectionsComponent]
})

/**
 * The collections module metadata.
 *
 * @module collections
 * @class CollectionsModule
 */
export default class CollectionsModule { }
