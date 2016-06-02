import { Component, Input } from '@angular/core';

import { Collection } from './collection.ts';

@Component({
  selector: 'collection',
  templateUrl: 'src/collection.html'
})

export class CollectionComponent {
  @Input() collection: Collection;
}
