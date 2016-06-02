import { Component } from '@angular/core';
import * as _ from 'lodash';

import { CollectionService } from './collection.service.ts';
import { CollectionComponent } from './collection.component.ts';
import { Collection } from './collection.ts';

@Component({
  selector: 'collections',
  // Note: the preferred relative templateUrl value './collections.view.html'
  //   resolves the path relative to the app root rather than this file's
  //   parent directory. A templateUrl value must be prefixed by the src
  //   package directory.
  templateUrl: 'src/collections.html',
  directives: [CollectionComponent],
  providers: [CollectionService]
})

export class CollectionsComponent {
  constructor(private service: CollectionService) { }

  collections: Collection[];

  ngOnInit() {
    this.collections = this.service.getCollections();
  }

  get sortedCollections(): Collection[] {
    return _.sortBy(this.collections, 'name');
  }
}
