import { Component, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private router: Router, private route: ActivatedRoute) { }
  
  /**
   * Opens the visit info page.
   *
   * @method visitInfo
   */
  visitInfo() {
    window.open(this.collection.url);
  }
  
  /**
   * Opens the visit info page.
   *
   * @method visitInfo
   */
  visitDetail() {
    // Note: the explicit route works around the following Angular bug:
    // * the router@3.0.0-alpha.3 navigate with relativeTo results in the
    //   error:
    //      Cannot match any routes
    //   with no indication of what the offending route is nor any reasonable
    //   way to idientify it in the traceback.
    //   The work-around is to build the route piecemeal rather than the
    //   line commented out below.
    //this.router.navigate([this.collection.name], {relativeTo: this.route});
    //
    // Note: if the initial route node omits the leading slash, then Angular
    //   raises the following error:
    //     Invalid number of '../'
    this.router.navigate(['/qiprofile', this.collection.project, this.collection.name]);
  }
}
