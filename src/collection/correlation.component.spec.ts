//import { Observable } from 'rxjs';
//import { provide } from '@angular/core';
import {
  describe, it, expect
} from '@angular/core/testing';

import { CollectionCorrelationComponent } from './correlation.component.ts';

/**
 * {{#crossLink "CollectionCorrelationComponent"}}{{/crossLink}} validator.
 *
 * @class CollectionCorrelationComponentSpec
 */
describe('The CollectionCorrelation component', function() {
  let component;

  beforeEach(() => {
    component = new CollectionCorrelationComponent();
  });
  
  it('should convert the config to a chart config', function() {
     component.config = {foo: 'bar'};
     expect(component.config, "Config is incorrect").to.eql({foo: 'bar'});
  });
});
