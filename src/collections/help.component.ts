import { Component } from '@angular/core';

import { HelpService } from '../common/help.service.ts';
import { HelpTextComponent } from './help-text.component.ts';

@Component({
  selector: 'qi-help',
  templateUrl: '/public/html/common/help.html',
  directives: [HelpTextComponent]
})


// TODO - use ng-content to pass the template into a generic
// common help component
// (cf. http://nicholasjohnson.com/blog/how-to-do-transclusion-in-angular-2/)


// Note: TypeScript's over-engineered and under-featured class
// mechanism does not support mix-ins adequately to allow a
// delegate with the showHelp and toggleHelp members below.
// The recipe https://www.typescriptlang.org/docs/handbook/mixins.html
// helps partially, but the mix-in cannot reference an instance
// variable defined in the calling class. Inheritance doesn't
// help, since the base class can't inject the service properly.
// We thus encounter yet another clumsy TypeScript construct rendering
// it unsuitable for modern web app development.
// The work-around for this TypeScript bug is to replicate the body of
// the class shown here in each similar application HelpComponent.
export class HelpComponent {
  constructor(private service: HelpService) { }

  get showHelp(): boolean {
    return this.service.showHelp;
  }
  
  toggleHelp() {
     this.service.toggleHelp();
  }
}
