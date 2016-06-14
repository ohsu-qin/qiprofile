import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()

export class ObservableHelper {
  toPromise(observable: Observable<T>): Promise<T> {
    let value;
    let promise = new Promise((resolve, reject) => {
      observable.subscribe(
        v => value = v,
        reject,
        () => resolve(value)
      );
    });
    
    return promise;
  }
}
