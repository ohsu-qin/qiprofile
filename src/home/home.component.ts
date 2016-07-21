import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'qi-home',
  templateUrl: '/public/html/home/home.html'
})

/**
 * The home button component.
 *
 * @module home
 * @class HomeComponent
 */
export class HomeComponent {
  @Input() project: string;

  constructor(private router: Router) {}

  goHome() {
    this.router.navigate([this.project]);
  }
}
