import { Component } from 'angular2/core';

@Component({
  selector: 'qiprofile',
  template: '<h4>Hello {{ name }}</h4>'
})
export class QIProfileComponent {
  name: string;
  
  constructor() {
    this.name = 'Angular2';
    setTimeout(() => {
      this.name = 'Angular2!!!'
    }, 1500);
  }
}
