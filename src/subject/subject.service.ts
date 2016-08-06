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
  constructor(private resource: SubjectResource) {}
    
  private _subject: Object;
  
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

    // Return the extended subjects.
    return subjects.map(fetched => fetched.map(Subject.extend));
  }
  
  /**
   * Caches the given subject in this service. There is only one object
   * in the cache. Retrieve the object with `getSubject(id)`.
   *
   * @method cache
   * @param subject {Object} the subject REST object to cache
   */
  cache(subject: Object) {
    this._subject = subject;
  }
  
  /**
   * Clears the cached subject in this service, if there is one.
   *
   * @method cache
   */
  clearCache() {
    this._subject = null;
  }
  
  /**
   * Picks the {project, collection} secondary key from the
   * given route parameters.
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
   * Determines the search criterion as follows:
   * * If there is a `subjectid` route parameter, then the search
   *   criterion is the {`_id`: *value*} for that parameter value.
   * * Otherwise, the criterion is the secondary key determined
   *   in the `secondaryKey` method.
   *
   * @method searchCriterion
   * @param routeParams {Object} the route parameters
   * @return {Object} the search criterion object
   */
  private searchCriterion(routeParams: Object) {
    let subjectId = routeParams.subjectid;
    if (subjectId) {
      return {_id: subjectId};
    } else {
      return this.secondaryKey(routeParams);
    }
  }

  /**
   * Fetches the subject based on the given route parameters.
   * The search criterion is built as described in
   * {{#crossLink "SubjectService/searchCriterion"}}{{/crossLink}}.
   * If the criterion includes an *id* parameter and this service
   * has cached a subject with that id, then that object is returned.
   * Otherwise, the object is fetched from the database and cached.
   *
   * @method getSubject
   * @param routeParams {Object} the route parameters
   * @return {Observable<any>} the subject REST object, if found,
   *   otherwise null
   */
  getSubject(routeParams: Object): Observable<any> {
    let criterion = this.searchCriterion(routeParams);
    // Check the cache first.
    if (this._subject) {
      let keys = Object.keys(criterion);
      let key = _.pick(this._subject, keys);
      if (_.every(keys, prop => key[prop] === criterion[prop])) {
        return Observable.of(this._subject);
      }
    }
    
    // The search parameter.
    let searchParam: string = REST.where(criterion);
    // Fetch the subject.
    let subject: Observable<any> = this.resource.findOne(searchParam);

    // Return the extended, cached subject.
    return subject.map(fetched => {
      if (fetched) {
       return fetched ? Subject.extend(fetched) : fetched;
      }
    });
  }
}
