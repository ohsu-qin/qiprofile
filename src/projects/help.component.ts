import { Component } from '@angular/core';

import { HelpService } from '../help/help.service.ts';

@Component({
  selector: 'qi-projects-help',
  templateUrl: '/public/html/projects/help.html'
})

/**
 * The Projects List help panel component. This component is
 * adapted from the standard
 * {{#crossLink "HelpComponent"}}{{/crossLink}}
 * but with a child
 * {{#crossLink "ProjectsHelpTextComponent"}}{{/crossLink}}
 * rather than a `help` input variable. This is done in order
 * to allow for the pronunciation button click action, which is
 * disabled by Angular when the standard help component includes
 * the help string variable as inner HTML.
 *
 * @class ProjectsHelpComponent
 */
export class ProjectsHelpComponent {
  constructor(private service: HelpService) { }

  get showHelp(): boolean {
    return this.service.showHelp;
  }

  toggleHelp() {
     this.service.toggleHelp();
  }
}
