/**
 * The Collections List module.
 *
 * @module collections
 */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { CollectionService } from '../collection/collection.service.ts';
import { CollectionItemComponent } from './collection-item.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { HelpService } from '../help/help.service.ts';
import help from './collections.help.md';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collections',
  templateUrl: '/public/html/collections/collections.html',
  directives: [HomeComponent, ToggleHelpComponent, CollectionItemComponent, HelpComponent],
  providers: [CollectionService]
})

/**
 * The Collection List main component.
 *
 * @class CollectionsComponent
 */
export class CollectionsComponent {
  /**
   * The project name.
   *
   * @property project {string}
   */
  project: string;
  
  /**
   * The collection REST objects.
   *
   * @property collections {Object[]}
   */
  collections: Object[];
  
  /**
   * Flag indicating whether there are no collections.
   * This property is necessary in order to asynchronously convey
   * to the view whether there are subjects. The view cannot test
   * `collections.length` directly, since `collections` is only
   * set when the collections are fetched.
   * 
   * @property isEmpty {boolean}
   */
  isEmpty: boolean;
  
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
      // Always show the help on this page.
      this.helpService.showHelp = true;
      let params = this.route.params.value;
      this.project = params.project;
      // The unsorted collection objects.
      let unsorted: Observable = this.dataService.getCollections(this.project);
      // A function to sort the collections by name.
      let sortByName = _.partialRight(_.sortBy, 'name');
      // Sort the collections.
      unsorted.map(sortByName).subscribe(collections => {
        this.collections = collections.sort(sortByName);
        this.isEmpty = collections.length === 0;
      });
  }
}
