/**
 * This Volume Detail module exports the
 * {{#crossLink "VolumeComponent"}}{{/crossLink}}
 * directive.
 *
 * @module volume
 * @main volume
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { PageModule } from '../page/page.module.ts';
import { ControlsModule } from '../controls/controls.module.ts';
import { VisualizationModule } from '../visualization/visualization.module.ts';
import { ImageModule } from '../image/image.module.ts';
import { VolumeComponent } from './volume.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: VolumeComponent
  },
];

@NgModule({
  imports: [
    CommonModule, PageModule, ControlsModule, RouterModule.forChild(ROUTE_CONFIG),
    VisualizationModule, ImageModule
  ],
  declarations: [VolumeComponent],
  exports: [VolumeComponent]
})

/**
 * The volume module metadata.
 *
 * @class VolumeModule
 * @module volume
 */
export default class VolumeModule { }