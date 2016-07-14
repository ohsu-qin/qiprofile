import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collections-collection',
  templateUrl: '/public/html/collections/collection.html'
})

/**
 * The Collections List collection item component
 *
 * @module collections
 * @class CollectionComponent
 */
export class CollectionComponent {
  @Input() collection;
  
  /**
   * Opens the visit info page.
   *
   * @method visitInfo
   */
  visitInfo() {
    window.open(this.collection.url);
  }
}
