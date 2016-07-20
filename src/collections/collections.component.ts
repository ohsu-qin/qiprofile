/**
 * The Collections List module.
 *
 * @module collections
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { GoHomeComponent } from '../common/go-home.component.ts';
import { ToggleHelpComponent } from '../common/toggle-help.component.ts';
import { CollectionService } from '../collection/collection.service.ts';
import { CollectionItemComponent } from './collection-item.component.ts';
import { HelpComponent } from '../common/help.component.ts';
import { HelpService } from '../common/help.service.ts';
import help from './collections.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collections',
  templateUrl: '/public/html/collections/collections.html',
  directives: [GoHomeComponent, ToggleHelpComponent, CollectionItemComponent, HelpComponent],
  providers: [CollectionService]
})

/**
 * The Collection List main component.
 *
 * @class CollectionsComponent
 * @main
 */
export class CollectionsComponent implements OnInit {
  /**
   * The project name.
   *
   * @property project {string}
   */
  project: string;
  
  /**
   * An Observable that resolves to the collection REST objects.
   *
   * @property collections {Observable}
   */
  collections: Observable<Object[]>;
  
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;
  
  constructor(private route: ActivatedRoute,
              private dataService: CollectionService,
              private helpService: HelpService) {
      this.help = help;
  }
  
  /**
   * @method isEmpty
   * @return whether there any collections
   */
  isEmpty(): Observable<boolean> {
    return this.collections.map(
      array => array.length === 0
    );
  }
  
  /**
   * Initializes this component as follows:
   * * Obtains the REST Collection objects from the data service
   * * Sort the collections by name.
   * * Always show the help.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    // Always show the help on this page.
    this.helpService.showHelp = true;
    // When the route settles, fetch the collections.
    this.route.params.subscribe(params => {
      this.project = params.project;
      // The unsorted collection objects.
      let unsorted: Observable = this.dataService.getCollections(this.project);
      // A function to sort the collections by name.
      let sortByName = _.partialRight(_.sortBy, 'name');
      // Sort the collections.
      this.collections = unsorted.map(sortByName);
    });
  }
}
