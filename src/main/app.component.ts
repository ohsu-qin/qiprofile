import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, Routes, ROUTER_DIRECTIVES } from '@angular/router';

import { CollectionsComponent } from '../collections/collections.component.ts';
import { HelpService } from '../common/help.service.ts';

@Component({
  selector: 'qi-app',
  templateUrl: '/public/html/main/app.html',
  directives: [ROUTER_DIRECTIVES],
  // The HelpService singleton is shared by subcomponents, which
  // should not declare the provider separately.
  providers: [HelpService]
})

@Routes([
  {path: '/qiprofile/:project', component: CollectionsComponent}
])

export class AppComponent implements OnInit {
  constructor(private router: Router, private location: Location) { }

  ngOnInit() {
    // Kick the router to get things started.
    this.router.navigateByUrl(this.location.path());
  }
}
