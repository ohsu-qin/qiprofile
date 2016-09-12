/**
 * This image module is responsible for image load, parsing
 * and display. The module exports the following directives:
 * {{#crossLink "ImageComponent"}}{{/crossLink}}
 *
 * @module image
 * @main image
 */

import { NgModule } from '@angular/core';

import { ImageComponent } from './image.component.ts';

@NgModule({
  imports: [],
  declarations: [ImageComponent],
  exports: [ImageComponent]
})

/**
 * The image module metadata.
 *
 * @class ImageModule
 * @module image
 */
export class ImageModule { }
