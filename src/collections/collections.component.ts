import { Component, OnInit } from '@angular/core';
import { RouteSegment, OnActivate } from '@angular/router';
import * as _ from 'lodash';

import { GoHomeComponent } from '../common/go-home.component.ts';
import { ToggleHelpComponent } from '../common/toggle-help.component.ts';
import { CollectionService } from './collection.service.ts';
import { CollectionComponent } from './collection.component.ts';
import { HelpComponent } from './help.component.ts';
import { HelpService } from '../common/help.service.ts';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collections',
  templateUrl: '/public/html/collections/collections.html',
  directives: [GoHomeComponent, ToggleHelpComponent, CollectionComponent, HelpComponent],
  providers: [CollectionService]
})

export class CollectionsComponent implements OnInit, OnActivate {
  project: string;
  
  collections: Observable<Object[]>;

  constructor(private dataService: CollectionService,
              private helpService: HelpService) { }

  ngOnInit() {
    this.collections = this.dataService.getCollections(this.project).map(
      collections => _.sortBy(collections, 'name')
    );
  }

  // At startup, the router navigates to the Home destination.
  // If that is the case, then show the help and clear the _initialShowHelp
  // flag. Otherwise, clear the help whenever the route changes.
  routerOnActivate(curr: RouteSegment, prev?: RouteSegment) {
    this.project = curr.getParam('project');
    // There must be a project.
    if (!this.project) {
      let url = curr.stringifiedUrlSegments;
      throw new Error(`The project is missing in the location ${ url }`);
    }
    // If this is the first visit to this home page, then show the help.
    if (!prev) {
      this.helpService.showHelp = true;
    }
  }
}
