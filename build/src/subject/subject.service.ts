import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import REST from '../rest/rest.coffee';
import { SubjectResource } from './subject.resource.ts';
import Subject from './subject.data.coffee';

@Injectable()

/**
 * The Subject data access service.
 *
 * @module subject
 * @class SubjectService
 */
export class SubjectService {
  constructor(private resource: SubjectResource) { }

  private subject: Object;

  /**
   * @method getSubjects
   * @param project {string} the project name
   * @param collection {string} the collection name
   * @return {Observable} the subject REST objects
   */
  getSubjects(project: string, collection: string): Observable<Object[]> {
    // The search parameter.
    let searchParam: string = REST.where(
      {project: project, collection: collection}
    );
    // Fetch the subjects.
    let subjects: Observable<Object[]> = this.resource.find(searchParam);

    // Return the extended subjects in number order.
    let extend = fetched => fetched.map(Subject.extend);
    let sort = extended => _.sortBy(extended, 'number');

    return subjects.map(_.flow(extend, sort));
  }

  /**
   * Caches the given subject in this service. There is only one object
   * in the cache. Retrieve the object with `getSubject(id)`.
   *
   * @method cache
   * @param subject {Object} the subject REST object to cache
   */
  cache(subject: Object) {
    this.subject = subject;
  }

  /**
   * Clears the cached subject in this service, if there is one.
   *
   * @method cache
   */
  clearCache() {
    this.subject = null;
  }

  /**
   * Picks the {project, collection, subject number} secondary
   * key from the given route parameters.
   *
   * @method secondaryKey
   * @param params {Object} the route parameters
   * @return {Object} the corresponding secondary key
   */
  secondaryKey(routeParams: Object) {
    if (!routeParams.project) {
      throw new ReferenceError(
        `The route parameters do not have a project: ${ JSON.stringify(routeParams) }`
      );
    }
    if (!routeParams.collection) {
      throw new ReferenceError(
        `The route parameters do not have a collection: ${ JSON.stringify(routeParams) }`
      );
    }
    if (!routeParams.subject) {
      throw new ReferenceError(
        `The route parameters do not have a subject: ${ JSON.stringify(routeParams) }`
      );
    }
    let secondaryKey = _.pick(routeParams, ['project', 'collection']);
    secondaryKey.number = +routeParams.subject;

    return secondaryKey;
  }

  /**
   * Fetches the subject based on the given route parameters.
   * The search criterion is the
   * {{#crossLink "SubjectService/secondaryKey"}}{{/crossLink}}.
   * If this service has a cached subject which matches that key,
   * then that object is returned.
   * Otherwise, the object is fetched from the database and cached.
   *
   * @method getSubject
   * @param routeParams {Object} the route parameters
   * @return {Observable<any>} the subject REST object, if found,
   *   otherwise null
   */
  getSubject(routeParams: Object): Observable<any> {
    let criterion = this.secondaryKey(routeParams);
    // Check the cache first.
    if (this.subject) {
      let keys = Object.keys(criterion);
      if (_.every(keys, prop => this.subject[prop] === criterion[prop])) {
        return Observable.of(this.subject);
      }
    }

    // Not cached; hit the database.
    // The search parameter.
    let searchParam: string = REST.where(criterion);
    // Fetch the subject.
    let subject: Observable<any> = this.resource.findOne(searchParam);

    // Return the extended, cached subject.
    return subject.map(fetched => {
      if (fetched) {
        Subject.extend(fetched);
        this.subject = fetched;
      }
      return fetched;
    });
  }
}
