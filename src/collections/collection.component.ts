import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collections-collection',
  templateUrl: '/public/html/collections/collection.html'
})

export class CollectionComponent {
  @Input() collection;
  
  visitInfo() {
    window.open(this.collection.url);
  }
}
