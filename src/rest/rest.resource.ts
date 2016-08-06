/**
 * The REST utilities.
 *
 * @module rest
 * @main rest
 */
import { Resource, ResourceParams } from 'ng2-resource-rest';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import REST from './rest.coffee';

@Injectable()

// The base params. Subclasses augment these with the path.
// See the RestResource class doc for a description of the
// response interceptor.
@ResourceParams({
    url: '/qirest',
    responseInterceptor: observable => {
      return observable.map(response => {
        return REST.transformResponse(response);
        });
    }
})

/**
 * The abstract base class for a REST resource. The request
 * url is always `/qirest`. The subclass is required to augment
 * the `@ResourceParams` with a path.
 *
 * @class RestResource
 */
export class RestResource extends Resource {
  /**
   * Fetches the sole REST object which satisfies the given MongoDB
   * search criterion, if any.
   *
   * @example
   *     import REST from '../rest/rest.coffee;'
   *     criterion = REST.where({id: id});
   *     subject = resource.findOne(criterion);
   *     subject.subscribe(sbj => console.log("Subject ", sbj.number));
   *
   * @method findOne
   * @param criterion {string} the search criterion
   * @return {Observable<any} an observable which resolves to the
   *   single search result object, or null if no match
   */
  findOne(criterion: string): Observable<any> {
    return this.query(criterion).$observable.map(result => {
      return result[0];
    });
  }

  /**
   * Fetches the REST objects which satisfy the given MongoDB
   * search criterion.
   *
   * Although the MongoDB response is always a single JSON object,
   * the base class `Resource.query` response contains an array of
   * matching REST objects embedded in the `_items` response entry.
   * This method unpacks the response and returns a `Observable`
   * which emits one matching REST object array.
   *
   * @example
   *     import REST from '../rest/rest.coffee;'
   *     criterion = REST.where({project: projectName});
   *     subjects = resource.find(criterion);
   *     subjects.subscribe(sbjs => console.log('%s subjects', sbjs.length));
   *
   * @method find
   * @param criterion {string} the optional search criterion
   * @return {Observable} an observable sequence of search result
   *   objects
   */
  find(criterion?: string): Observable<Object[]> {
    return this.query(criterion).$observable;
  }
}
