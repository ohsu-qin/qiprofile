/**
 * The controls module exports the following directives:
 * {{#crossLink "SliderDirective"}}{{/crossLink}}
 * {{#crossLink "PlayerComponent"}}{{/crossLink}}
 *
 * @module controls
 * @main controls
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SliderDirective } from './slider.directive.ts';
import { PlayerComponent } from './player.component.ts';

const DIRECTIVES = [
  SliderDirective, PlayerComponent
];

@NgModule({
  imports: [CommonModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})

/**
 * The controls module metadata.
 *
 * @module controls
 * @class ControlsModule
 */
export class ControlsModule { }
