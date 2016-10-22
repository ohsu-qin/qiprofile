/**
 * This D3 facade module exports the following directives:
 * {{#crossLink "ScatterPlotDirective"}}{{/crossLink}}
 * {{#crossLink "SparkLineDirective"}}{{/crossLink}}
 * {{#crossLink "ColorBarDirective"}}{{/crossLink}}
 *
 * @module visualization
 * @main visualization
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlsModule } from '../controls/controls.module.ts';
import { ScatterPlotDirective } from './scatter-plot.directive.ts';
import { SparkLineDirective } from './spark-line.directive.ts';
import { ColorBarDirective } from './color-bar.directive.ts';
import { CorrelationComponent } from './correlation.component.ts';

const DIRECTIVES = [
  ScatterPlotDirective, SparkLineDirective, ColorBarDirective,
  CorrelationComponent
];

@NgModule({
  imports: [CommonModule, ControlsModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})

/**
 * The visualization module metadata.
 *
 * @module visualization
 * @class VisualizationModule
 */
export class VisualizationModule { }
