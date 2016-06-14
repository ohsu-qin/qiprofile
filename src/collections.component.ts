import { Component } from '@angular/core';
import * as _ from 'lodash';

import { CollectionService } from './collection.service.ts';
import { CollectionComponent } from './collection.component.ts';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collections',
  templateUrl: '/html/collections.html',
  directives: [CollectionComponent],
  providers: [CollectionService]
})

export class CollectionsComponent implements OnInit {
  constructor(private service: CollectionService) { }

  collections: Observable<Object[]>;

  ngOnInit() {
    this.collections = this.service.getCollections('QIN_Test').map(
      collections => _.sortBy(collections, 'name')
    );
  }
}
