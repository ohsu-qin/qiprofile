import { Component, Input } from '@angular/core';

import { HelpService } from './help.service.ts';

@Component({
  selector: 'qi-help',
  templateUrl: '/public/html/common/help.html'
})

export class HelpComponent {
  @Input() help: string;
  
  constructor(private service: HelpService) { }

  get showHelp(): boolean {
    return this.service.showHelp;
  }
  
  toggleHelp() {
     this.service.toggleHelp();
  }
}
