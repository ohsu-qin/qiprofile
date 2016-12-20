import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'qi-collection-item',
  templateUrl: '/public/html/collections/collection-item.html'
})

/**
 * The Collections List collection item component
 *
 * @class CollectionItemComponent
 */
export class CollectionItemComponent {
  @Input() collection;

  constructor(private route: ActivatedRoute, private router: Router) { }

  /**
   * Opens the Collection Info page.
   *
   * @method visitInfo
   */
  visitInfo() {
    window.open(this.collection.url);
  }

  /**
   * Opens the Collection Detail page.
   *
   * @method visitDetail
   */
  visitDetail() {
    this.router.navigate([this.collection.name], {relativeTo: this.route});
  }
}
