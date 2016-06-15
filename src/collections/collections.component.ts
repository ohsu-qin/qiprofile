import { Component } from '@angular/core';
import * as _ from 'lodash';

import { CollectionService } from './collection.service.ts';
import { CollectionComponent } from './collection.component.ts';
import { HelpComponent } from './help.component.ts';
import { Observable } from 'rxjs';

@Component({
  selector: 'qi-collections',
  templateUrl: '/public/html/collections/collections.html',
  directives: [CollectionComponent, HelpComponent],
  providers: [CollectionService]
})

export class CollectionsComponent implements OnInit {
  collections: Observable<Object[]>;

  constructor(private service: CollectionService) { }

  ngOnInit() {
    this.collections = this.service.getCollections('QIN_Test').map(
      collections => _.sortBy(collections, 'name')
    );
  }
}
