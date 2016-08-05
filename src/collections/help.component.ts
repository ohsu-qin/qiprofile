import { Component } from '@angular/core';

import { CollectionsHelpTextComponent } from './help-text.component.ts';
import { HelpService } from '../help/help.service.ts';

@Component({
  selector: 'qi-collections-help',
  templateUrl: '/public/html/collections/help.html',
  directives: [CollectionsHelpTextComponent]
})

/**
 * The Collections List help panel component. This component is
 * adapted from the standard
 * {{#crossLink "HelpComponent"}}{{/crossLink}} 
 * but with a child
 * {{#crossLink "CollectionsHelpTextComponent"}}{{/crossLink}}
 * rather than a `help` input variable. This is done in order
 * to allow for the pronunciation button click action, which is
 * disabled by Angular when the standard help component includes
 * the help string variable as inner HTML.
 *
 * @class CollectionsHelpComponent
 */
export class CollectionsHelpComponent {
  constructor(private service: HelpService) {}

  get showHelp(): boolean {
    return this.service.showHelp;
  }
  
  toggleHelp() {
     this.service.toggleHelp();
  }
}
