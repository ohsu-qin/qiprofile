import { Component, Input } from '@angular/core';

//import { Axis } from '../visualization/axis.ts';
import { ScatterChartDirective } from '../visualization/scatter-chart.directive.ts';

@Component({
  selector: 'qi-collection-correlation',
  templateUrl: '/public/html/collection/correlation.html',
  directives: [ScatterChartDirective]
})

/**
 * The Collection Detail correlation component
 *
 * @class CollectionCorrelationComponent
 */
export class CollectionCorrelationComponent {
  /**
   * The augmented {{#crossLink "Axis"}}{{/crossLink}} {x, y} axis settings.
   *
   * @property _config {Object}
   * @private
   */
  private _config: Object;
  
  /**
   * The {{#crossLink "Subject"}}{{/crossLink}} REST data objects.
   *
   * @property subjects {Object[]}
   */
  @Input() subjects: Object[];

  /**
   * The partial {{#crossLink "Axis"}}{{/crossLink}} {x, y} axis settings.
   * The input consists of a partial {x, y} key-value object, where each axis value
   * is a property path. This input is flushed out as follows:
   * * _label_ is inferred from the *value* property path
   * * _orientation_ is `bottom` for the X axis and `left` for the Y axis
   * * _transformation_ is a 90 degree rotation for the Y axis
   *
   * @property config {Object}
   */
  @Input()
  set config(config: Object) {
    // TODO - convert each {x, y} input config to an Axis config.
    this._config = config;
  }
  
  get config() {
    return this._config;
  }
}
