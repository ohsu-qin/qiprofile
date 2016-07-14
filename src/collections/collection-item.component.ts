import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collection-item',
  templateUrl: '/public/html/collections/collection-item.html'
})

/**
 * The Collections List collection item component
 *
 * @module collections
 * @class CollectionItemComponent
 */
export class CollectionItemComponent {
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
