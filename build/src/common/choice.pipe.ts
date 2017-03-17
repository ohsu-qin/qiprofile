import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import {
  ConfigurationService }
from '../configuration/configuration.service.ts';

@Pipe({name: 'choice'})

/**
 * Transforms a database value to a display value.
 *
 * @module common
 * @class ChoicePipe
 */
export class ChoicePipe implements PipeTransform {
  /**
   * The
   * {{#crossLink "ConfigurationService/valueChoices"}}{{/crossLink}}.
   *
   * @property
   */
  private choices: Object;

  constructor(private configService: ConfigurationService) {
    this.choices = configService.valueChoices;
  }

  /**
   * Looks up the input value within the `choices.cfg` section
   * for the given topic. If found, then this method returns
   * the look-up result, otherwise this method returns the
   * input value. If the input value is an array, then this
   * method collects the item transformations.
   *
   * @method transform
   * @param value {string|string[]} the _topic_._value_
   *   property value
   * @return {string|string[]} the display string
   */
  transform(value: string|string[], topic: string): string|string[] {
    // Recurse into an array.
    if (_.isArray(value)) {
      let recurse = item => this.transform(item, topic);
      return value.map(recurse);
    }
    // The choice section.
    let section = this.choices[topic];
    // The section look-up value.
    let displayValue = section && section[value];

    // The display value is the look-up value, if it exists,
    // otherwise the input value.
    return displayValue || value;
  }
}
