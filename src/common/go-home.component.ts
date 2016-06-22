import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'qi-go-home',
  templateUrl: '/public/html/common/go-home.html'
})

export class GoHomeComponent {
  @Input() project: string;

  constructor(private router: Router) { }

  goHome() {
    this.router.navigate(['/qiprofile', this.project]);
  }
}
