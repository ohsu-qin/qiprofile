/**
 * This Collection Detail module exports the following directives:
 * {{#crossLink "CollectionComponent"}}{{/crossLink}}
 *
 * @module collection
 * @main collection
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { VisualizationModule } from '../visualization/visualization.module.ts';
import { CollectionComponent } from './collection.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: CollectionComponent
  },
];

@NgModule({
  imports: [
    NgCommonModule, PageModule, RouterModule.forChild(ROUTE_CONFIG),
    VisualizationModule
  ],
  declarations: [CollectionComponent],
  exports: [CollectionComponent]
})

/**
 * The collection module metadata.
 *
 * @module collection
 * @class CollectionModule
 */
export default class CollectionModule { }
