/**
 * This Subject Detail module exports the
 * {{#crossLink "SubjectComponent"}}{{/crossLink}}
 * directive.
 *
 * @module subject
 * @main subject
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AccordionModule } from 'ng2-accordion';

import { PageModule } from '../page/page.module.ts';
import { CommonModule } from '../common/common.module.ts';
import { CapitalizePipe } from '../common/capitalize.pipe.ts';
import { ChoicePipe } from '../common/choice.pipe.ts';
import { BooleanPipe } from '../common/boolean.pipe.ts';
import { NotSpecifiedPipe } from '../common/notSpecified.pipe.ts';
import { MomentPipe } from '../date/moment.pipe.ts';
import { RomanizePipe } from '../roman/romanize.pipe.ts';
import { TnmSizePipe } from '../clinical/tnm-size.pipe.ts';
import { TnmStagePipe } from '../clinical/tnm-stage.pipe.ts';
import { SubjectComponent } from './subject.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: SubjectComponent
  },
];

@NgModule({
  imports: [
    NgCommonModule, AccordionModule, CommonModule, PageModule,
    RouterModule.forChild(ROUTE_CONFIG)
  ],
  declarations: [
    SubjectComponent, CapitalizePipe, ChoicePipe, MomentPipe, RomanizePipe,
    BooleanPipe, NotSpecifiedPipe, TnmSizePipe, TnmStagePipe
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
