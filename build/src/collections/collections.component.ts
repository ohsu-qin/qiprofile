import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PageComponent } from '../page/page.component.ts';
import { CollectionsService } from './collections.service.ts';

@Component({
  selector: 'qi-collections',
  templateUrl: '/public/html/collections/collections.html'
})

/**
 * The Collection List main component.
 *
 * @class CollectionsComponent
 */
export class CollectionsComponent extends PageComponent {
  /**
   * The collection REST objects.
   *
   * @property collections {Object[]}
   */
  collections: Object[];

  /**
   * Flag indicating whether there are no collections.
   * This property is necessary in order to asynchronously convey
   * to the view whether there are subjects. The view cannot test
   * `collections.length` directly, since `collections` is only
   * set when the collections are fetched.
   *
   * @property isEmpty {boolean}
   */
  isEmpty: boolean;

  constructor(
    route: ActivatedRoute, modalService: NgbModal,
    dataService: CollectionsService
  ) {
      super(modalService);

      let params = route.params.value;
      this.project = params.project;
      // The unsorted collection objects.
      let unsorted: Observable = dataService.getCollections(this.project);
      // A function to sort the collections by name.
      let sortByName = _.partialRight(_.sortBy, 'name');
      // Sort the collections.
      unsorted.map(sortByName).subscribe(collections => {
        this.collections = collections.sort(sortByName);
        this.isEmpty = collections.length === 0;
      });
  }
}
