import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collection',
  templateUrl: 'html/collection.html'
})

export class CollectionComponent {
  @Input() collection;
}
