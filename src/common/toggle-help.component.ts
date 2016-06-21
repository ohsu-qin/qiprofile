import { Component } from '@angular/core';

import { HelpService } from '../common/help.service.ts';

@Component({
  selector: 'qi-toggle-help',
  templateUrl: '/public/html/main/toggle-help.html'
})

export class ToggleHelpComponent {
  constructor(private service: HelpService) { }
  
  get showHelp(): boolean {
    return this.service.showHelp;
  }

  toggleHelp() {
    this.service.toggleHelp();
  }
}
