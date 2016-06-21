import { Injectable } from '@angular/core';

@Injectable()

export class HelpService {
  showHelp: boolean;
  
  constructor() {
     this.showHelp = false;
  }

  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
