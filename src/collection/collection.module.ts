/**
 * This Collection Detail module exports the following directives:
 * {{#crossLink "CollectionComponent"}}{{/crossLink}}
 *
 * @module collection
 * @main collection
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { CollectionComponent } from './collection.component.ts';
import { CollectionCorrelationComponent } from './correlation.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: CollectionComponent
  },
];

@NgModule({
  imports: [CommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG)],
  declarations: [
    CollectionComponent, CollectionCorrelationComponent
  ],
  exports: [CollectionComponent]
})

/**
 * The collection module metadata.
 *
 * @module collection
 * @class CollectionModule
 */
export default class CollectionModule { }
