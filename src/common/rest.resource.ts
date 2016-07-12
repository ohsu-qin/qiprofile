/**
 * The shared utilities module.
 *
 * @module common
 */
import { Resource, ResourceParams } from 'ng2-resource-rest';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import Rest from './rest.service.coffee';

@Injectable()

// The base params. Subclasses augment these with the path.
@ResourceParams({
    url: '/qirest',
    responseInterceptor: observable => {
      return observable.map(response => {
        let value = Rest.transformResponse(response);
        if (_.isArray(value)) {
          return Array.from(value);
        } else {
          return value;
        }
      });
    }
})

/**
 * The abstract base class for a REST resource. The subclass is
 * required to augment the `@ResourceParams` with a path.
 *
 * @class RestResource
 */
export class RestResource extends Resource {
  /**
   * @method findOne
   * @param criterion {string} the search criterion
   * @return {Observable} an observable which resolves to the
   *   single search result object
   */
  findOne(criterion): Observable<Object> {
    return this.get(criterion).$observable;
  }

  /**
   * @method find
   * @param criterion {string} the search criterion
   * @return {Observable} an observable which resolves to the
   *   array of search result objects
   */
  find(criterion: Object): Observable<Object[]> {
    return this.query(criterion).$observable;
  }
}
