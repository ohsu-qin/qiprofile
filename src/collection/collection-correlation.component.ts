import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collection-correlation',
  templateUrl: '/public/html/collection/collection-correlation.html'
})

/**
 * The Collection Detail correlation component
 *
 * @module collection-correlation
 * @class CollectionCorrelationComponent
 */
export class CollectionCorrelationComponent {
  @Input() collection;
}
