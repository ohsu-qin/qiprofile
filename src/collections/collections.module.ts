/**
 * This Collections List module exports the following directives:
 * {{#crossLink "CollectionsComponent"}}{{/crossLink}}
 *
 * @module collections
 * @main collections
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { CollectionsComponent } from './collections.component.ts';
import { CollectionItemComponent } from './collection-item.component.ts';
import { CollectionsHelpComponent } from './help.component.ts';
import { CollectionsHelpTextComponent } from './help-text.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: CollectionsComponent
  },
];

@NgModule({
  imports: [CommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [
    CollectionsComponent,
    CollectionItemComponent, CollectionsHelpComponent, CollectionsHelpTextComponent
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
