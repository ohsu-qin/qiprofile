import { Resource, ResourceParams, ResourceResult } from 'ng2-resource-rest';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';
import Rest from './rest.resource.coffee';

@Injectable()

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

export class RestResource extends Resource {
  findOne(criterion): Observable<Object> {
    return this.get(criterion).$observable;
  }

  find(criterion: Object): Observable<Object[]> {
    return this.query(criterion).$observable;
  }
}
